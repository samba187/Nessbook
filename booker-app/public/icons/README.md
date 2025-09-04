# 🎨 Génération des icônes PWA pour NessBook

Ce dossier contient toutes les icônes nécessaires pour faire fonctionner NessBook comme une PWA (Progressive Web App) sur toutes les plateformes.

## 📱 Icônes incluses

### Standards (Web & Android)
- `icon-16.png` à `icon-512.png` - Toutes les tailles standard
- `maskable-192.png` & `maskable-512.png` - Icônes adaptatives Android

### iOS Safari
- `apple-touch-icon.png` - Icône principale iOS (180x180)
- `apple-touch-icon-152x152.png` - iPad
- `apple-touch-icon-167x167.png` - iPad Pro
- `apple-touch-icon-180x180.png` - iPhone

### Écrans de démarrage iOS
- `splash-640x1136.png` - iPhone 5/SE
- `splash-750x1334.png` - iPhone 6/7/8
- `splash-1242x2208.png` - iPhone 6/7/8 Plus
- `splash-1125x2436.png` - iPhone X/XS
- `splash-1284x2778.png` - iPhone 12/13 Pro
- `splash-1170x2532.png` - iPhone 12/13 Pro Max

## 🛠️ Régénérer les icônes

Si vous voulez modifier le logo et régénérer toutes les icônes :

### 1. Installer les dépendances
```bash
pip install pillow cairosvg
```

### 2. Modifier le logo
Éditez le fichier `logo.svg` avec votre design.

### 3. Générer les icônes
```bash
python ../generate_icons.py
```

## 🎨 Design du logo actuel

Le logo NessBook inclut :
- 📚 Un livre ouvert avec des pages
- ⭐ Des étoiles pour les notes
- ❤️ Un cœur pour les favoris  
- 💬 Des guillemets pour les citations
- 🎨 Dégradé rose/violet thématique

## 📋 Checklist PWA

- ✅ Manifest avec toutes les métadonnées
- ✅ Icônes pour toutes les tailles
- ✅ Support iOS avec apple-touch-icon
- ✅ Écrans de démarrage iOS
- ✅ Service Worker pour le cache
- ✅ Installation sur Android/Chrome
- ✅ Instructions d'installation iOS
- ✅ Thème adaptatif et responsive

L'app peut maintenant être installée sur **tous les appareils** ! 🎉
