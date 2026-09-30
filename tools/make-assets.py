"""Erzeugt Icon- und Splash-Quellbilder (assets/*.png) für @capacitor/assets.
Motiv: leuchtender Stern/Punkt auf tiefdunklem Grund, passend zum Intro."""
from playwright.sync_api import sync_playwright
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')

def svg(size, bg, glow=True, scale=1.0, star=True):
    c = size / 2
    r = size * 0.055 * scale
    rings = ''.join(
        f'<circle cx="{c}" cy="{c}" r="{size*k*scale}" fill="none" stroke="#8fd3ff" stroke-opacity="{o}" stroke-width="{size*0.004}"/>'
        for k, o in ((0.17, .35), (0.27, .2), (0.38, .1)))
    spikes = ''
    if star:
        L = size * 0.26 * scale
        spikes = (f'<path d="M{c-L} {c} L{c} {c-r*0.5} L{c+L} {c} L{c} {c+r*0.5} Z" fill="#cfeaff" fill-opacity=".85"/>'
                  f'<path d="M{c} {c-L} L{c+r*0.5} {c} L{c} {c+L} L{c-r*0.5} {c} Z" fill="#cfeaff" fill-opacity=".85"/>')
    bgrect = f'<rect width="{size}" height="{size}" fill="{bg}"/>' if bg else ''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
<defs><radialGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".25" stop-color="#bfe6ff" stop-opacity=".9"/><stop offset=".6" stop-color="#4f8cff" stop-opacity=".25"/><stop offset="1" stop-color="#4f8cff" stop-opacity="0"/></radialGradient>
<radialGradient id="bgg" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#0d1530"/><stop offset="1" stop-color="#05060c"/></radialGradient></defs>
{bgrect.replace(f'fill="{bg}"', 'fill="url(#bgg)"') if bg else ''}
{rings}{spikes}
<circle cx="{c}" cy="{c}" r="{size*0.22*scale}" fill="url(#g)"/>
<circle cx="{c}" cy="{c}" r="{r}" fill="#fff"/></svg>'''

jobs = {
    'icon-only.png': svg(1024, '#05060c'),
    'icon-foreground.png': svg(1024, None, scale=0.62),
    'icon-background.png': f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#05060c"/></svg>',
    'splash.png': svg(2732, '#05060c', scale=0.55),
    'splash-dark.png': svg(2732, '#05060c', scale=0.55),
}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)
    for name, s in jobs.items():
        import re
        size = int(re.search(r'width="(\d+)"', s).group(1))
        pg = b.new_page(viewport={'width': size, 'height': size})
        pg.set_content(f'<body style="margin:0;background:transparent">{s}</body>')
        pg.screenshot(path=os.path.join(OUT, name), omit_background=True)
        pg.close()
    b.close()
