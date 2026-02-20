import subprocess
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw

def create_icon(size, path):
    img = Image.new('RGB', (size, size), color='#22c55e') 
    d = ImageDraw.Draw(img)
    cx, cy = size//2, size//2
    r = size * 0.35
    d.ellipse([(cx-r, cy-r), (cx+r, cy+r)], fill='white')
    d.ellipse([(cx-r*0.8, cy-r*0.8), (cx+r*0.8, cy+r*0.8)], fill='#0a0a0a')
    img.save(path)

create_icon(192, r'C:\Users\정재윤\.gemini\antigravity\scratch\BroApp\public\pwa-192x192.png')
create_icon(512, r'C:\Users\정재윤\.gemini\antigravity\scratch\BroApp\public\pwa-512x512.png')
