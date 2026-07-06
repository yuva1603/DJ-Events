"""
DJ Events – Phase 3: GLB Asset Generator (No Blender Required)
==============================================================
Uses Python + trimesh to create all 12 GLB assets programmatically.

Install dependencies:
    pip install trimesh numpy scipy pyglet

Run:
    python generate_assets_python.py
"""

import os
import math
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial  # type: ignore[attr-defined]
from trimesh.visual import TextureVisuals

# ── Output root (same folder as this script) ────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SUBFOLDERS = ["Amplifier", "SoundWave", "DJ", "Crowd", "Lights", "Contact"]


def ensure_dirs():
    for sf in SUBFOLDERS:
        os.makedirs(os.path.join(BASE_DIR, sf), exist_ok=True)


# ── Material helper ──────────────────────────────────────────────────────────

def pbr(color_rgba, metallic=0.0, roughness=0.5):
    """Create a PBRMaterial with the given RGBA color (0-255 range)."""
    mat = PBRMaterial(
        baseColorFactor=color_rgba,       # [R, G, B, A]  0-255
        metallicFactor=metallic,
        roughnessFactor=roughness,
    )
    return TextureVisuals(material=mat)


def c(r, g, b, a=255, metallic=0.0, roughness=0.5):
    """Shorthand: rgb 0-255."""
    return pbr([r, g, b, a], metallic=metallic, roughness=roughness)


# ── Scene helpers ────────────────────────────────────────────────────────────

def make_scene(*meshes):
    scene = trimesh.Scene()
    for i, mesh in enumerate(meshes):
        scene.add_geometry(mesh, node_name=f"node_{i}")
    return scene


def save(scene, path):
    data = scene.export(file_type='glb')
    with open(path, 'wb') as f:
        f.write(data)
    print(f"  OK  {os.path.relpath(path, BASE_DIR)}")


def translate(mesh, xyz):
    mesh.apply_translation(xyz)
    return mesh


def scale(mesh, xyz):
    m = np.eye(4)
    m[0, 0], m[1, 1], m[2, 2] = xyz
    mesh.apply_transform(m)
    return mesh


def rotate(mesh, axis, deg):
    angle = math.radians(deg)
    if axis == 'x':
        R = trimesh.transformations.rotation_matrix(angle, [1, 0, 0])
    elif axis == 'y':
        R = trimesh.transformations.rotation_matrix(angle, [0, 1, 0])
    else:
        R = trimesh.transformations.rotation_matrix(angle, [0, 0, 1])
    mesh.apply_transform(R)
    return mesh


def box(lx, ly, lz, color, metallic=0.0, roughness=0.5):
    m = trimesh.creation.box([lx, ly, lz])
    m.visual = c(*color, metallic=metallic, roughness=roughness)
    return m


def cylinder(r, h, color, metallic=0.0, roughness=0.5, sections=32):
    m = trimesh.creation.cylinder(radius=r, height=h, sections=sections)
    m.visual = c(*color, metallic=metallic, roughness=roughness)
    return m


def cone(r, h, color, metallic=0.0, roughness=0.5, sections=32):
    m = trimesh.creation.cone(radius=r, height=h, sections=sections)
    m.visual = c(*color, metallic=metallic, roughness=roughness)
    return m


def sphere(r, color, metallic=0.0, roughness=0.5):
    m = trimesh.creation.icosphere(radius=r, subdivisions=3)
    m.visual = c(*color, metallic=metallic, roughness=roughness)
    return m


def torus(major_r, minor_r, color, metallic=0.0, roughness=0.5):
    """Approximate torus by revolving a circle."""
    m = trimesh.creation.torus(major_radius=major_r, minor_radius=minor_r)
    m.visual = c(*color, metallic=metallic, roughness=roughness)
    return m


# ════════════════════════════════════════════════════════════════════════════
# AMPLIFIER
# ════════════════════════════════════════════════════════════════════════════

def build_amplifier():
    parts = []

    # Body
    body = box(0.8, 0.5, 1.0, (13, 13, 13), roughness=0.8)
    parts.append(body)

    # Grille (front face, slightly inset)
    grille = box(0.65, 0.04, 0.55, (38, 38, 38), roughness=0.9)
    translate(grille, [0, -0.27, -0.1])
    parts.append(grille)

    # Handle (torus on top)
    handle = torus(0.15, 0.02, (153, 127, 102), metallic=0.9, roughness=0.3)
    rotate(handle, 'x', 90)
    translate(handle, [0, 0, 0.56])
    parts.append(handle)

    # Knobs (4 cylinders on front)
    for x in [-0.25, -0.08, 0.08, 0.25]:
        knob = cylinder(0.04, 0.06, (77, 77, 77), metallic=0.5)
        rotate(knob, 'x', 90)
        translate(knob, [x, -0.27, 0.35])
        parts.append(knob)

    path = os.path.join(BASE_DIR, "Amplifier", "amplifier.glb")
    save(make_scene(*parts), path)


def build_speaker():
    parts = []

    # Outer frame ring (torus)
    frame = torus(0.45, 0.07, (64, 64, 64), metallic=0.8, roughness=0.3)
    parts.append(frame)

    # Speaker cone
    spk_cone = cone(0.38, 0.25, (25, 25, 25), roughness=0.95)
    translate(spk_cone, [0, 0, -0.125])
    parts.append(spk_cone)

    # Dust cap
    cap = sphere(0.08, (20, 20, 20), roughness=0.9)
    scale(cap, [1, 1, 0.4])
    translate(cap, [0, 0, 0.01])
    parts.append(cap)

    path = os.path.join(BASE_DIR, "Amplifier", "speaker.glb")
    save(make_scene(*parts), path)


# ════════════════════════════════════════════════════════════════════════════
# SOUND WAVE
# ════════════════════════════════════════════════════════════════════════════

def build_wave():
    parts = []
    SEGS   = 50
    LAYERS = 5
    width  = 4.0
    height = 0.6
    tube_r = 0.025

    for layer in range(LAYERS):
        amp   = height * (1 - layer * 0.15)
        freq  = 1.5 + layer * 0.3
        phase = layer * 0.4
        z     = layer * 0.06

        # Sample the sine curve
        pts = []
        for i in range(SEGS + 1):
            t = i / SEGS
            x = (t - 0.5) * width
            y = amp * math.sin(2 * math.pi * freq * t + phase)
            pts.append([x, y, z])

        # Build tube segments between consecutive points
        for i in range(len(pts) - 1):
            p0 = np.array(pts[i])
            p1 = np.array(pts[i + 1])
            seg_len = np.linalg.norm(p1 - p0)
            if seg_len < 1e-6:
                continue
            mid = (p0 + p1) / 2
            seg = cylinder(tube_r, seg_len, (0, 204, 255), roughness=0.1)

            # Orient cylinder along p0->p1
            direction = (p1 - p0) / seg_len
            z_axis    = np.array([0, 0, 1])
            if not np.allclose(direction, z_axis):
                cross = np.cross(z_axis, direction)
                cross_norm = np.linalg.norm(cross)
                if cross_norm > 1e-6:
                    cross /= cross_norm
                    dot   = np.clip(np.dot(z_axis, direction), -1, 1)
                    angle = math.acos(dot)
                    Rmat  = trimesh.transformations.rotation_matrix(angle, cross)
                    seg.apply_transform(Rmat)

            translate(seg, mid)
            parts.append(seg)

    path = os.path.join(BASE_DIR, "SoundWave", "wave.glb")
    save(make_scene(*parts), path)


# ════════════════════════════════════════════════════════════════════════════
# DJ
# ════════════════════════════════════════════════════════════════════════════

def build_dj_booth():
    parts = []

    # Tabletop
    top = box(4.0, 0.8, 0.08, (20, 20, 30), roughness=0.4)
    translate(top, [0, 0, 0.75])
    parts.append(top)

    # Side legs
    for lx in [-1.9, 1.9]:
        leg = box(0.1, 0.8, 0.75, (13, 13, 20), metallic=0.3)
        translate(leg, [lx, 0, 0.375])
        parts.append(leg)

    # Front fascia (LED blue glow)
    fascia = box(4.0, 0.04, 0.5, (0, 102, 255), roughness=0.2)
    translate(fascia, [0, -0.42, 0.5])
    parts.append(fascia)

    path = os.path.join(BASE_DIR, "DJ", "dj_booth.glb")
    save(make_scene(*parts), path)


def build_mixer():
    parts = []

    # Body
    body = box(1.2, 0.8, 0.08, (15, 15, 20), roughness=0.7)
    parts.append(body)

    # Channel faders (4 channels)
    for x in [-0.45, -0.15, 0.15, 0.45]:
        track = box(0.04, 0.5, 0.015, (51, 51, 51))
        translate(track, [x, 0, 0.048])
        parts.append(track)

        cap = box(0.055, 0.08, 0.015, (204, 204, 204), metallic=0.3)
        translate(cap, [x, 0, 0.062])
        parts.append(cap)

    # Crossfader
    cf_track = box(0.7, 0.04, 0.015, (51, 51, 51))
    translate(cf_track, [0, -0.3, 0.048])
    parts.append(cf_track)

    cf_cap = box(0.08, 0.06, 0.015, (204, 25, 25))
    translate(cf_cap, [0, -0.3, 0.062])
    parts.append(cf_cap)

    # EQ knobs (3 rows × 4 channels)
    for row, y in enumerate([0.2, 0.1, 0.0]):
        for x in [-0.45, -0.15, 0.15, 0.45]:
            knob = cylinder(0.035, 0.04, (77, 77, 102), metallic=0.5)
            translate(knob, [x, y, 0.06])
            parts.append(knob)

    path = os.path.join(BASE_DIR, "DJ", "mixer.glb")
    save(make_scene(*parts), path)


def build_headphones():
    parts = []

    # Headband (torus arc)
    band = torus(0.22, 0.025, (13, 13, 13), roughness=0.6)
    scale(band, [1, 0.6, 1])
    translate(band, [0, 0, 0.22])
    parts.append(band)

    # Ear cups + pads
    for lx, sign in [(-0.22, -1), (0.22, 1)]:
        cup = cylinder(0.1, 0.06, (18, 18, 18), roughness=0.5)
        rotate(cup, 'y', 90)
        translate(cup, [lx, 0, 0])
        parts.append(cup)

        pad = cylinder(0.095, 0.025, (31, 20, 15), roughness=0.9)
        rotate(pad, 'y', 90)
        translate(pad, [lx + sign * 0.03, 0, 0])
        parts.append(pad)

    path = os.path.join(BASE_DIR, "DJ", "headphones.glb")
    save(make_scene(*parts), path)


# ════════════════════════════════════════════════════════════════════════════
# CROWD
# ════════════════════════════════════════════════════════════════════════════

def build_crowd():
    parts = []

    COLS, ROWS = 7, 3
    for row in range(ROWS):
        for col in range(COLS):
            x = (col - COLS // 2) * 0.35 + row * 0.05
            z = row * 0.1
            # Unique color per person
            r = int(25 + abs(math.sin(x * 2.1)) * 76)
            g = int(13 + abs(math.cos(x * 1.3)) * 51)
            b = int(25 + abs(math.sin(x * 3.7)) * 102)

            body = cylinder(0.08, 0.4, (r, g, b), roughness=0.8)
            translate(body, [x, 0, 0.3 + z])
            parts.append(body)

            head = sphere(0.1, (r, g, b), roughness=0.8)
            translate(head, [x, 0, 0.62 + z])
            parts.append(head)

            for dx, ang in [(-0.15, 45), (0.15, -45)]:
                arm = cylinder(0.03, 0.3, (r, g, b), roughness=0.8)
                rotate(arm, 'z', ang)
                translate(arm, [x + dx, 0, 0.55 + z])
                parts.append(arm)

    path = os.path.join(BASE_DIR, "Crowd", "crowd.glb")
    save(make_scene(*parts), path)


def build_stage():
    parts = []

    # Main platform
    platform = box(4.0, 2.5, 0.2, (15, 10, 20), roughness=0.8)
    translate(platform, [0, 0, 0.1])
    parts.append(platform)

    # Steps (front)
    for i in range(3):
        step = box(4.0, 0.5, 0.06, (25, 18, 31), roughness=0.85)
        translate(step, [0, -(1.5 + i * 0.5), 0.1 - i * 0.06])
        parts.append(step)

    # LED edge trim (purple strip)
    trim = box(4.0, 0.04, 0.02, (128, 0, 255), roughness=0.1)
    translate(trim, [0, -1.27, 0.21])
    parts.append(trim)

    path = os.path.join(BASE_DIR, "Crowd", "stage.glb")
    save(make_scene(*parts), path)


# ════════════════════════════════════════════════════════════════════════════
# LIGHTS
# ════════════════════════════════════════════════════════════════════════════

def build_laser():
    parts = []

    # Housing
    housing = box(0.3, 0.25, 0.15, (13, 13, 20), metallic=0.6, roughness=0.4)
    parts.append(housing)

    # Lens dome (half sphere)
    lens = sphere(0.07, (51, 204, 255, 153), roughness=0.0, metallic=0.1)
    scale(lens, [1, 1, 0.5])
    translate(lens, [0, 0, 0.1])
    parts.append(lens)

    # Beam cone
    beam = cone(0.15, 1.5, (0, 255, 128, 77), roughness=0.0)
    translate(beam, [0, 0, 0.85])
    parts.append(beam)

    path = os.path.join(BASE_DIR, "Lights", "laser.glb")
    save(make_scene(*parts), path)


def build_spotlight():
    parts = []

    # Barrel (inverted cone)
    barrel = cone(0.25, 0.5, (25, 25, 30), metallic=0.7, roughness=0.3)
    rotate(barrel, 'x', 180)
    parts.append(barrel)

    # Lens disc
    lens = cylinder(0.24, 0.04, (230, 230, 153, 204), roughness=0.05)
    translate(lens, [0, 0, 0.27])
    parts.append(lens)

    # Yoke arms
    for lx in [-0.3, 0.3]:
        yoke = cylinder(0.015, 0.5, (38, 38, 38), metallic=0.9, roughness=0.2)
        rotate(yoke, 'y', 90)
        translate(yoke, [lx, 0, 0.1])
        parts.append(yoke)

    # Clamp
    clamp = cylinder(0.04, 0.08, (51, 51, 51), metallic=0.8)
    translate(clamp, [0, 0, 0.55])
    parts.append(clamp)

    path = os.path.join(BASE_DIR, "Lights", "spotlight.glb")
    save(make_scene(*parts), path)


# ════════════════════════════════════════════════════════════════════════════
# CONTACT
# ════════════════════════════════════════════════════════════════════════════

def build_table():
    parts = []

    # Tabletop
    top = box(1.5, 0.7, 0.05, (217, 209, 199), roughness=0.3)
    translate(top, [0, 0, 0.75])
    parts.append(top)

    # Four legs
    for lx, ly in [(-0.65, -0.3), (-0.65, 0.3), (0.65, -0.3), (0.65, 0.3)]:
        leg = cylinder(0.03, 0.7, (77, 77, 89), metallic=0.9, roughness=0.2)
        translate(leg, [lx, ly, 0.375])
        parts.append(leg)

    # Shelf
    shelf = box(1.35, 0.55, 0.03, (179, 173, 163), roughness=0.4)
    translate(shelf, [0, 0, 0.35])
    parts.append(shelf)

    path = os.path.join(BASE_DIR, "Contact", "table.glb")
    save(make_scene(*parts), path)


def build_logo():
    parts = []

    # Shield (gold box)
    shield = box(0.6, 0.08, 0.75, (217, 166, 25), metallic=0.95, roughness=0.15)
    parts.append(shield)

    # Trim ring (gold torus)
    trim = torus(0.42, 0.025, (255, 199, 51), metallic=1.0, roughness=0.1)
    scale(trim, [1, 0.3, 1.35])
    translate(trim, [0, 0.05, 0])
    parts.append(trim)

    # D letter (dark cylinder)
    d = cylinder(0.12, 0.1, (13, 8, 0), roughness=0.3)
    translate(d, [-0.1, 0.06, 0.05])
    parts.append(d)

    # J letter (thin cylinder)
    j = cylinder(0.03, 0.3, (13, 8, 0), roughness=0.3)
    translate(j, [0.12, 0.06, 0.0])
    parts.append(j)

    path = os.path.join(BASE_DIR, "Contact", "logo.glb")
    save(make_scene(*parts), path)


# ════════════════════════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════════════════════════

TASKS = [
    ("Amplifier/amplifier",  build_amplifier),
    ("Amplifier/speaker",    build_speaker),
    ("SoundWave/wave",       build_wave),
    ("DJ/dj_booth",          build_dj_booth),
    ("DJ/mixer",             build_mixer),
    ("DJ/headphones",        build_headphones),
    ("Crowd/crowd",          build_crowd),
    ("Crowd/stage",          build_stage),
    ("Lights/laser",         build_laser),
    ("Lights/spotlight",     build_spotlight),
    ("Contact/table",        build_table),
    ("Contact/logo",         build_logo),
]


def main():
    print("\n=== DJ Events - Phase 3 Asset Generator (Python) ===")

    ensure_dirs()
    passed, failed = 0, 0

    for label, fn in TASKS:
        print(f">> {label}")
        try:
            fn()
            passed += 1
        except Exception as e:
            print(f"  ERROR: {e}")
            failed += 1

    print(f"\n" + "-"*50)
    print(f"  Done!  {passed} exported  |  {failed} failed")
    print(f"  Output: {BASE_DIR}")
    print("-"*50 + "\n")


if __name__ == "__main__":
    main()
