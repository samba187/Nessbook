#!/usr/bin/env python3
"""
Script pour générer toutes les icônes PWA à partir du logo SVG
Nécessite: pip install pillow cairosvg
"""

import os
from pathlib import Path
try:
    import cairosvg
    from PIL import Image, ImageDraw
except ImportError:
    print("❌ Modules manquants. Installez avec:")
    print("pip install pillow cairosvg")
    exit(1)

# Dossier des icônes
ICONS_DIR = Path("booker-app/public/icons")
SVG_PATH = ICONS_DIR / "logo.svg"

# Tailles d'icônes nécessaires
ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512]
APPLE_SIZES = [152, 167, 180]  # Tailles spécifiques iOS
SPLASH_SCREENS = [
    (640, 1136),   # iPhone 5/SE
    (750, 1334),   # iPhone 6/7/8
    (1242, 2208),  # iPhone 6/7/8 Plus
    (1125, 2436),  # iPhone X/XS
    (1284, 2778),  # iPhone 12/13 Pro
    (1170, 2532),  # iPhone 12/13 Pro Max
]

def create_png_from_svg(svg_path, output_path, size):
    """Convertit SVG en PNG à la taille donnée"""
    cairosvg.svg2png(
        url=str(svg_path),
        write_to=str(output_path),
        output_width=size,
        output_height=size
    )

def create_maskable_icon(icon_path, output_path, size):
    """Crée une icône maskable (avec padding)"""
    # Ouvre l'icône originale
    img = Image.open(icon_path)
    
    # Redimensionne à 80% pour laisser de la place au padding
    inner_size = int(size * 0.8)
    img = img.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
    
    # Crée une nouvelle image avec fond transparent
    maskable = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # Centre l'icône
    offset = (size - inner_size) // 2
    maskable.paste(img, (offset, offset), img if img.mode == 'RGBA' else None)
    
    maskable.save(output_path)

def create_splash_screen(base_icon_path, output_path, width, height):
    """Crée un écran de démarrage pour iOS"""
    # Crée un fond dégradé
    splash = Image.new('RGB', (width, height), '#0f172a')
    
    # Ajoute l'icône au centre
    icon = Image.open(base_icon_path)
    icon_size = min(width, height) // 4  # Icône = 1/4 de la taille d'écran
    icon = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    
    # Centre l'icône
    x = (width - icon_size) // 2
    y = (height - icon_size) // 2
    
    if icon.mode == 'RGBA':
        splash.paste(icon, (x, y), icon)
    else:
        splash.paste(icon, (x, y))
    
    splash.save(output_path)

def main():
    print("🎨 Génération des icônes PWA pour NessBook...")
    
    # Vérifie que le SVG existe
    if not SVG_PATH.exists():
        print(f"❌ Logo SVG non trouvé: {SVG_PATH}")
        return
    
    # Crée le dossier d'icônes
    ICONS_DIR.mkdir(exist_ok=True)
    
    print("📱 Génération des icônes standards...")
    # Génère toutes les tailles d'icônes
    for size in ICON_SIZES:
        output_path = ICONS_DIR / f"icon-{size}.png"
        create_png_from_svg(SVG_PATH, output_path, size)
        print(f"   ✅ icon-{size}.png")
    
    print("🍎 Génération des icônes Apple...")
    # Génère les icônes Apple Touch
    for size in APPLE_SIZES:
        input_path = ICONS_DIR / f"icon-{size}.png"
        output_path = ICONS_DIR / f"apple-touch-icon-{size}x{size}.png"
        # Copie l'icône existante
        img = Image.open(input_path)
        img.save(output_path)
        print(f"   ✅ apple-touch-icon-{size}x{size}.png")
    
    # Icône Apple Touch générique (180x180)
    apple_main = ICONS_DIR / "apple-touch-icon.png"
    img180 = Image.open(ICONS_DIR / "icon-180.png")
    img180.save(apple_main)
    print("   ✅ apple-touch-icon.png")
    
    print("🎭 Génération des icônes maskables...")
    # Génère les icônes maskables
    for size in [192, 512]:
        input_path = ICONS_DIR / f"icon-{size}.png"
        output_path = ICONS_DIR / f"maskable-{size}.png"
        create_maskable_icon(input_path, output_path, size)
        print(f"   ✅ maskable-{size}.png")
    
    print("🌟 Génération des écrans de démarrage iOS...")
    # Génère les splash screens
    base_icon = ICONS_DIR / "icon-512.png"
    for width, height in SPLASH_SCREENS:
        output_path = ICONS_DIR / f"splash-{width}x{height}.png"
        create_splash_screen(base_icon, output_path, width, height)
        print(f"   ✅ splash-{width}x{height}.png")
    
    print("\n🎉 Toutes les icônes ont été générées avec succès!")
    print("📋 Résumé:")
    print(f"   • {len(ICON_SIZES)} icônes standards")
    print(f"   • {len(APPLE_SIZES) + 1} icônes Apple Touch")
    print(f"   • 2 icônes maskables")
    print(f"   • {len(SPLASH_SCREENS)} écrans de démarrage")
    print(f"   • Total: {len(list(ICONS_DIR.glob('*.png')))} fichiers PNG")

if __name__ == "__main__":
    main()
