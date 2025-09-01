from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Configuration JWT
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Remplace par une vraie clé en prod
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Chargement des variables d'environnement (.env)
load_dotenv()

# Connexion MongoDB (Atlas ou local)
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
MONGODB_DB = os.getenv('MONGODB_DB', 'booker')
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
users_collection = db['users']
books_collection = db['books']

# Indexes pour de meilleures perfs
try:
    users_collection.create_index('email', unique=True)
    books_collection.create_index([('user_email', 1), ('genre', 1)])
    books_collection.create_index([('user_email', 1), ('author', 1)])
    books_collection.create_index([('user_email', 1), ('created_at', -1)])
except Exception:
    pass

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        print(data)
        return jsonify({'error': 'Missing fields'}), 400

    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    user = {
        'username': username,
        'email': email,
        'password': hashed_password
    }
    users_collection.insert_one(user)
    return jsonify({'message': 'User registered successfully!'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(data)
    user = users_collection.find_one({'email': email})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user['email'])
    return jsonify({'access_token': access_token})

@app.route('/api/getbooks', methods=['GET'])
@jwt_required()
def get_books():
    current_user = get_jwt_identity()
    print(f"[DEBUG] getbooks called by user: {current_user}")
    
    # Return books with stringified _id so the frontend can navigate/edit/delete
    books_cursor = books_collection.find({'user_email': current_user})
    books = []
    for b in books_cursor:
        print(f"[DEBUG] Processing book: {b.get('title', 'No title')} with _id: {b.get('_id', 'NO ID')}")
        b['_id'] = str(b['_id'])
        print(f"[DEBUG] After conversion, _id: {b['_id']}")
        books.append(b)
    
    print(f"[DEBUG] Returning {len(books)} books")
    if books:
        print(f"[DEBUG] Sample book keys: {list(books[0].keys())}")
        print(f"[DEBUG] Sample book _id: {books[0].get('_id', 'MISSING')}")
    
    return jsonify(books)

@app.route('/api/getbook/<id>', methods=['GET'])
@jwt_required()
def get_book(id):
    current_user = get_jwt_identity()
    try:
        _id = ObjectId(id)
    except:
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
    books = []
    for b in books_cursor:
        b['_id'] = str(b['_id'])
        books.append(b)
    return jsonify(books)

@app.route('/api/getbyauthor', methods=['GET'])
@jwt_required()
def get_by_author():
    current_user = get_jwt_identity()
    author = request.args.get('author')
    if not author:
        return jsonify({'error': 'No author provided'}), 400

    books_cursor = books_collection.find({'author': author, 'user_email': current_user})
    books = []
    for b in books_cursor:
        b['_id'] = str(b['_id'])
        books.append(b)
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
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Remove sensitive fields that shouldn't be updated via this endpoint
    data.pop('password', None)
    data.pop('email', None)  # Email should be updated via separate endpoint
    
    try:
        result = users_collection.update_one(
            {'email': current_user},
            {'$set': data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({'message': 'Profile updated successfully'})
    except Exception as e:
        return jsonify({'error': 'Failed to update profile'}), 500

@app.route('/api/addbook', methods=['POST'])
@jwt_required()
def add_book():
    current_user = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    book = {
        'user_email': current_user,
        'title': data.get('title', ''),
        'author': data.get('author', ''),
        'genre': data.get('genre', ''),
        'year': data.get('year', None),
        'pages': data.get('pages', None),
    'resume': data.get('resume', ''),
        'image': data.get('image', ''),
        'rating': data.get('rating', 0),
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
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    book_id = data.get('id')
    if not book_id:
        return jsonify({'error': 'No book ID provided'}), 400

    try:
        _id = ObjectId(book_id)
    except:
        return jsonify({'error': 'Invalid book ID'}), 400

    book = books_collection.find_one({'_id': _id})
    if not book or book.get('user_email') != current_user:
        return jsonify({'error': 'Unauthorized'}), 403

    updated_book = {
        'title': data.get('title', ''),
        'author': data.get('author', ''),
        'genre': data.get('genre', ''),
        'year': data.get('year', None),
        'pages': data.get('pages', None),
    'resume': data.get('resume', ''),
        'image': data.get('image', ''),
        'rating': data.get('rating', 0),
        'comment': data.get('comment', ''),
        'quotes': data.get('quotes', []),
        'highlights': data.get('highlights', []),
        'updated_at': datetime.datetime.utcnow()
    }

    books_collection.update_one({'_id': _id}, {'$set': updated_book})
    return jsonify({'message': 'Book updated successfully!'})

@app.route('/api/deletebook', methods=['POST'])
@jwt_required()
def delete_book():
    current_user = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    book_id = data.get('id')
    if not book_id:
        return jsonify({'error': 'No book ID provided'}), 400

    try:
        _id = ObjectId(book_id)
    except:
        return jsonify({'error': 'Invalid book ID'}), 400

    book = books_collection.find_one({'_id': _id})
    if not book or book.get('user_email') != current_user:
        return jsonify({'error': 'Unauthorized'}), 403

    books_collection.delete_one({'_id': _id})
    return jsonify({'message': 'Book deleted successfully!'})

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy'})

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    current_user = get_jwt_identity()
    
    # Compter les livres par genre
    pipeline = [
        {'$match': {'user_email': current_user}},
        {'$group': {'_id': '$genre', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}}
    ]
    genre_stats = list(books_collection.aggregate(pipeline))
    
    # Statistiques générales
    total_books = books_collection.count_documents({'user_email': current_user})
    avg_rating = books_collection.aggregate([
        {'$match': {'user_email': current_user}},
        {'$group': {'_id': None, 'avg_rating': {'$avg': '$rating'}}}
    ])
    avg_rating = list(avg_rating)
    avg_rating = avg_rating[0]['avg_rating'] if avg_rating else 0
    
    return jsonify({
        'total_books': total_books,
        'avg_rating': round(avg_rating, 1) if avg_rating else 0,
        'genre_distribution': genre_stats
    })

@app.route('/api/genres', methods=['GET'])
@jwt_required()
def get_genres():
    current_user = get_jwt_identity()
    genres = books_collection.distinct('genre', {'user_email': current_user})
    return jsonify(genres)

if __name__ == '__main__':
    app.run()
