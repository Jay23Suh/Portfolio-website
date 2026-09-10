from PIL import Image
import numpy as np

img = Image.open('public/JayLogo.gif')
frames = []
for frame in range(img.n_frames):
    img.seek(frame)
    f = img.convert("RGBA")
    data = np.array(f)
    
    # Let's find the most common color (likely the background)
    # Just take the top-left pixel as background color
    bg_color = data[0, 0]
    print(f"Frame {frame} top-left pixel:", bg_color)
    
    # We will replace anything close to bg_color with transparent
    r, g, b, a = data.T
    bg_r, bg_g, bg_b = bg_color[:3]
    
    # threshold for "close to background"
    threshold = 30
    mask = (abs(r - bg_r) < threshold) & (abs(g - bg_g) < threshold) & (abs(b - bg_b) < threshold)
    data[mask.T] = (0, 0, 0, 0) # set transparent
    
    frames.append(Image.fromarray(data))

frames[0].save('public/JayLogoTransparent.gif', save_all=True, append_images=frames[1:], loop=0, duration=img.info.get('duration', 100), disposal=2)
print("Saved transparent GIF")
