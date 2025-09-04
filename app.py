import os
import datetime
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

# Charge .env en local (sur Heroku on utilisera Config Vars)
load_dotenv()

"""
Backend API-only (Heroku). Frontend will be deployed separately to Vercel.
"""
app = Flask(__name__)
# Allow cross-origin for Vercel frontend; by default allow all. You can restrict with CORS_ORIGINS env.
# Example value for CORS_ORIGINS: "https://nessbook.vercel.app"
allowed_origins = os.environ.get("CORS_ORIGINS", "*")

# Be explicit about the CORS resources and methods/headers to make OPTIONS preflight succeed on Heroku
CORS(
    app,
    resources={r"/api/*": {"origins": allowed_origins}, r"/": {"origins": allowed_origins}},
    supports_credentials=False,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization"],
)

# Ensure CORS headers are always added (including for automatic OPTIONS) and handle multi-origin lists
@app.after_request
def add_cors_headers(response):
    try:
        origin = request.headers.get("Origin")
        if allowed_origins == "*":
            response.headers["Access-Control-Allow-Origin"] = "*"
        else:
            allowed = [o.strip() for o in allowed_origins.split(",") if o.strip()]
            if origin and origin in allowed:
                response.headers["Access-Control-Allow-Origin"] = origin
                # Vary to ensure caches respect per-origin response
                response.headers["Vary"] = ", ".join(filter(None, [response.headers.get("Vary"), "Origin"]))
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    except Exception:
        pass
    return response

# --- Config JWT ---
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "change-me")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(days=1)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- MongoDB ---
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://127.0.0.1:27017/")
MONGODB_DB  = os.environ.get("MONGODB_DB", "booker")
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
users_collection = db["users"]
books_collection = db["books"]

# Indexes (si ça échoue, on ignore pour ne pas crasher le boot)
try:
    users_collection.create_index("email", unique=True)
    books_collection.create_index([("user_email", 1), ("genre", 1)])
    books_collection.create_index([("user_email", 1), ("author", 1)])
    books_collection.create_index([("user_email", 1), ("created_at", -1)])
except Exception:
    pass

# ------------------ ROOT (API status) ------------------
@app.get("/")
def home():
    return jsonify({"status": "ok", "app": "Nessbook API", "docs": "/api/health"})

# ------------------ ROUTES API ------------------
@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy'})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing fields'}), 400

    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = {'username': username, 'email': email, 'password': hashed_password}
    users_collection.insert_one(user)
    return jsonify({'message': 'User registered successfully!'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = users_collection.find_one({'email': email})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=user['email'])
    return jsonify({'access_token': access_token})

@app.route('/api/getbooks', methods=['GET'])
@jwt_required()
def get_books():
    current_user = get_jwt_identity()
    books_cursor = books_collection.find({'user_email': current_user})
    books = []
    for b in books_cursor:
        b['_id'] = str(b['_id'])
        books.append(b)
    return jsonify(books)

@app.route('/api/getbook/<id>', methods=['GET'])
@jwt_required()
def get_book(id):
    current_user = get_jwt_identity()
    try:
        _id = ObjectId(id)
    except Exception:
        return jsonify({'error': 'Invalid book ID'}), 400
    book = books_collection.find_one({'_id': _id})
    if not book or book.get('user_email') != current_user:
        return jsonify({'error': 'Book not found or unauthorized'}), 403
    book['_id'] = str(book['_id'])
    return jsonify(book)

@app.route('/api/getbygenre', methods=['GET'])
@jwt_required()
def get_by_genre():
    current_user = get_jwt_identity()
    genre = request.args.get('genre')
    if not genre:
        return jsonify({'error': 'No genre provided'}), 400
    books_cursor = books_collection.find({'genre': genre, 'user_email': current_user})
    books = [{**b, '_id': str(b['_id'])} for b in books_cursor]
    return jsonify(books)

@app.route('/api/getbyauthor', methods=['GET'])
@jwt_required()
def get_by_author():
    current_user = get_jwt_identity()
    author = request.args.get('author')
    if not author:
        return jsonify({'error': 'No author provided'}), 400
    books_cursor = books_collection.find({'author': author, 'user_email': current_user})
    books = [{**b, '_id': str(b['_id'])} for b in books_cursor]
    return jsonify(books)

@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user = get_jwt_identity()
    user = users_collection.find_one({'email': current_user}, {'password': 0, '_id': 0})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user)

@app.route('/api/user/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    current_user = get_jwt_identity()
    data = request.get_json() or {}
    data.pop('password', None)
    data.pop('email', None)
    result = users_collection.update_one({'email': current_user}, {'$set': data})
    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404
    # Return the updated user (without sensitive fields) so client can persist
    updated_user = users_collection.find_one({'email': current_user}, {'password': 0, '_id': 0})
    return jsonify({'message': 'Profile updated successfully', 'user': updated_user})

@app.route('/api/addbook', methods=['POST'])
@jwt_required()
def add_book():
    current_user = get_jwt_identity()
    data = request.get_json() or {}
    book = {
        'user_email': current_user,
        'title': data.get('title', ''),
        'author': data.get('author', ''),
        'genre': data.get('genre', ''),
        'startedDate': data.get('startedDate', ''),
        'finishedDate': data.get('finishedDate', ''),
        'resume': data.get('resume', ''),
        'image': data.get('image', ''),
        'rating': data.get('rating', 0),
        'characterRating': data.get('characterRating', 0),
        'environmentRating': data.get('environmentRating', 0),
        'plotRating': data.get('plotRating', 0),
        'plotTwistRating': data.get('plotTwistRating', 0),
        'originalityRating': data.get('originalityRating', 0),
        'isFavorite': data.get('isFavorite', False),
        'comment': data.get('comment', ''),
        'quotes': data.get('quotes', []),
        'highlights': data.get('highlights', []),
        'created_at': datetime.datetime.utcnow(),
        'updated_at': datetime.datetime.utcnow()
    }
    result = books_collection.insert_one(book)
    book['_id'] = str(result.inserted_id)
    return jsonify({'message': 'Book added successfully!', 'book': book})

@app.route('/api/editbook', methods=['POST'])
@jwt_required()
def edit_book():
    current_user = get_jwt_identity()
    data = request.get_json() or {}
    book_id = data.get('id')
    if not book_id:
        return jsonify({'error': 'No book ID provided'}), 400
    try:
        _id = ObjectId(book_id)
    except Exception:
        return jsonify({'error': 'Invalid book ID'}), 400
    book = books_collection.find_one({'_id': _id})
    if not book or book.get('user_email') != current_user:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Construction de l'objet livre mis à jour en préservant les anciens champs
    updated_book = {
        'title': data.get('title', ''),
        'author': data.get('author', ''),
        'genre': data.get('genre', ''),
        'resume': data.get('resume', ''),
        'image': data.get('image', ''),
        'rating': data.get('rating', 0),
        'comment': data.get('comment', ''),
        'quotes': data.get('quotes', []),
        'highlights': data.get('highlights', []),
        'updated_at': datetime.datetime.utcnow()
    }
    
    # Nouveaux champs (système de dates et ratings détaillés)
    if 'startedDate' in data:
        updated_book['startedDate'] = data.get('startedDate', '')
    if 'finishedDate' in data:
        updated_book['finishedDate'] = data.get('finishedDate', '')
    if 'characterRating' in data:
        updated_book['characterRating'] = data.get('characterRating', 0)
    if 'environmentRating' in data:
        updated_book['environmentRating'] = data.get('environmentRating', 0)
    if 'plotRating' in data:
        updated_book['plotRating'] = data.get('plotRating', 0)
    if 'plotTwistRating' in data:
        updated_book['plotTwistRating'] = data.get('plotTwistRating', 0)
    if 'originalityRating' in data:
        updated_book['originalityRating'] = data.get('originalityRating', 0)
    if 'isFavorite' in data:
        updated_book['isFavorite'] = data.get('isFavorite', False)
    
    # Anciens champs (pour compatibilité avec les livres existants)
    if 'year' in data:
        updated_book['year'] = data.get('year', None)
    if 'pages' in data:
        updated_book['pages'] = data.get('pages', None)
    
    books_collection.update_one({'_id': _id}, {'$set': updated_book})
    return jsonify({'message': 'Book updated successfully!'})

@app.route('/api/deletebook', methods=['POST'])
@jwt_required()
def delete_book():
    current_user = get_jwt_identity()
    data = request.get_json() or {}
    book_id = data.get('id')
    if not book_id:
        return jsonify({'error': 'No book ID provided'}), 400
    try:
        _id = ObjectId(book_id)
    except Exception:
        return jsonify({'error': 'Invalid book ID'}), 400
    book = books_collection.find_one({'_id': _id})
    if not book or book.get('user_email') != current_user:
        return jsonify({'error': 'Unauthorized'}), 403
    books_collection.delete_one({'_id': _id})
    return jsonify({'message': 'Book deleted successfully!'})

# --- Lancement local uniquement (Heroku utilise Gunicorn) ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
