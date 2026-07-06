"""
DJ Events – Phase 3: Generate All Assets in Blender
=====================================================
Run this script inside Blender's Scripting workspace, OR via command line:
    blender --background --python generate_all_assets.py

Generates and exports all GLB assets into the Assets/ folder structure.
"""

import bpy
import bmesh
import os
import math

# ── Root output directory (same folder as this script) ──────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

ASSET_DIRS = {
    "Amplifier": ["amplifier", "speaker"],
    "SoundWave": ["wave"],
    "DJ":        ["dj_booth", "mixer", "headphones"],
    "Crowd":     ["crowd", "stage"],
    "Lights":    ["laser", "spotlight"],
    "Contact":   ["table", "logo"],
}

# ── Helpers ──────────────────────────────────────────────────────────────────

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col)

def set_material(obj, name, color=(0.2, 0.2, 0.2, 1.0), metallic=0.0, roughness=0.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value   = metallic
    bsdf.inputs["Roughness"].default_value  = roughness
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    return mat

def export_glb(path):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False,
    )
    print(f"  Exported -> {path}")

def ensure_dir(folder):
    os.makedirs(folder, exist_ok=True)

# ════════════════════════════════════════════════════════════════════════════
# AMPLIFIER
# ════════════════════════════════════════════════════════════════════════════

def build_amplifier(out_dir):
    clear_scene()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    body = bpy.context.active_object
    body.name = "AmpBody"
    body.scale = (0.8, 0.5, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    set_material(body, "AmpBlack", (0.05, 0.05, 0.05, 1), roughness=0.8)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.52, -0.1))
    grille = bpy.context.active_object
    grille.name = "Grille"
    grille.scale = (0.65, 0.04, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    set_material(grille, "Grille", (0.15, 0.15, 0.15, 1), roughness=0.9)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.15, minor_radius=0.02, location=(0, 0, 0.56))
    handle = bpy.context.active_object
    handle.name = "Handle"
    handle.rotation_euler[0] = math.radians(90)
    set_material(handle, "HandleMetal", (0.6, 0.5, 0.4, 1), metallic=0.9, roughness=0.3)

    for i, x in enumerate([-0.25, -0.08, 0.08, 0.25]):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.06, location=(x, -0.52, 0.35))
        k = bpy.context.active_object
        k.name = f"Knob_{i}"
        k.rotation_euler[0] = math.radians(90)
        set_material(k, f"Knob_{i}", (0.3, 0.3, 0.3, 1), metallic=0.5)

    export_glb(os.path.join(out_dir, "amplifier.glb"))


def build_speaker(out_dir):
    clear_scene()
    bpy.ops.mesh.primitive_torus_add(major_radius=0.45, minor_radius=0.07, location=(0, 0, 0))
    frame = bpy.context.active_object
    frame.name = "SpeakerFrame"
    set_material(frame, "FrameMetal", (0.25, 0.25, 0.25, 1), metallic=0.8, roughness=0.3)

    bpy.ops.mesh.primitive_cone_add(radius1=0.38, radius2=0.08, depth=0.25, location=(0, 0, -0.12))
    cone = bpy.context.active_object
    cone.name = "Cone"
    set_material(cone, "ConePaper", (0.1, 0.1, 0.1, 1), roughness=0.95)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(0, 0, 0.01))
    cap = bpy.context.active_object
    cap.name = "DustCap"
    cap.scale[2] = 0.4
    bpy.ops.object.transform_apply(scale=True)
    set_material(cap, "DustCap", (0.08, 0.08, 0.08, 1), roughness=0.9)

    export_glb(os.path.join(out_dir, "speaker.glb"))


# ════════════════════════════════════════════════════════════════════════════
# SOUND WAVE
# ════════════════════════════════════════════════════════════════════════════

def build_wave(out_dir):
    clear_scene()
    bm = bmesh.new()
    SEGS   = 40
    LAYERS = 5
    width  = 4.0
    height = 0.6

    for layer in range(LAYERS):
        amp   = height * (1 - layer * 0.15)
        freq  = 1.5 + layer * 0.3
        phase = layer * 0.4
        z     = layer * 0.05
        verts = []
        for i in range(SEGS + 1):
            t = i / SEGS
            x = (t - 0.5) * width
            y = amp * math.sin(2 * math.pi * freq * t + phase)
            verts.append(bm.verts.new((x, y, z)))
        for i in range(SEGS):
            bm.edges.new((verts[i], verts[i + 1]))

    mesh = bpy.data.meshes.new("WaveMesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("SoundWave", mesh)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    set_material(obj, "WaveGlow", (0.0, 0.8, 1.0, 1), roughness=0.1, metallic=0.2)

    bpy.ops.object.modifier_add(type='SKIN')
    obj.modifiers["Skin"].use_smooth_shade = True
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.transform.skin_resize(value=(0.03, 0.03, 0.03))
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.modifier_apply(modifier="Skin")

    export_glb(os.path.join(out_dir, "wave.glb"))


# ════════════════════════════════════════════════════════════════════════════
# DJ
# ════════════════════════════════════════════════════════════════════════════

def build_dj_booth(out_dir):
    clear_scene()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.75))
    top = bpy.context.active_object
    top.name = "BoothTop"
    top.scale = (2.0, 0.8, 0.06)
    bpy.ops.object.transform_apply(scale=True)
    set_material(top, "BoothSurface", (0.08, 0.08, 0.12, 1), roughness=0.4)

    for name, lx in [("LegLeft", -1.7), ("LegRight", 1.7)]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(lx, 0, 0.375))
        leg = bpy.context.active_object
        leg.name = name
        leg.scale = (0.1, 0.8, 0.75)
        bpy.ops.object.transform_apply(scale=True)
        set_material(leg, name, (0.05, 0.05, 0.08, 1), metallic=0.3)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.82, 0.5))
    fascia = bpy.context.active_object
    fascia.name = "Fascia"
    fascia.scale = (2.0, 0.04, 0.5)
    bpy.ops.object.transform_apply(scale=True)
    set_material(fascia, "FasciaLED", (0.0, 0.4, 1.0, 1), roughness=0.2)

    export_glb(os.path.join(out_dir, "dj_booth.glb"))


def build_mixer(out_dir):
    clear_scene()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    body = bpy.context.active_object
    body.name = "MixerBody"
    body.scale = (1.2, 0.8, 0.08)
    bpy.ops.object.transform_apply(scale=True)
    set_material(body, "MixerBlack", (0.06, 0.06, 0.08, 1), roughness=0.7)

    for i, x in enumerate([-0.45, -0.15, 0.15, 0.45]):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, 0.09))
        ft = bpy.context.active_object
        ft.scale = (0.04, 0.5, 0.015)
        bpy.ops.object.transform_apply(scale=True)
        set_material(ft, f"Track_{i}", (0.2, 0.2, 0.2, 1))

        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, 0.12))
        fc = bpy.context.active_object
        fc.scale = (0.055, 0.08, 0.015)
        bpy.ops.object.transform_apply(scale=True)
        set_material(fc, f"Cap_{i}", (0.8, 0.8, 0.8, 1), metallic=0.3)

    for row, y in enumerate([0.2, 0.1, 0.0]):
        for i, x in enumerate([-0.45, -0.15, 0.15, 0.45]):
            bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.04, location=(x, y, 0.1))
            knob = bpy.context.active_object
            set_material(knob, f"EQ_{row}_{i}", (0.3, 0.3, 0.4, 1), metallic=0.5)

    export_glb(os.path.join(out_dir, "mixer.glb"))


def build_headphones(out_dir):
    clear_scene()
    bpy.ops.mesh.primitive_torus_add(major_radius=0.22, minor_radius=0.025, location=(0, 0, 0.22))
    band = bpy.context.active_object
    band.name = "Headband"
    band.scale[1] = 0.6
    bpy.ops.object.transform_apply(scale=True)
    set_material(band, "BandBlack", (0.05, 0.05, 0.05, 1), roughness=0.6)

    for side, lx in [("Left", -0.22), ("Right", 0.22)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=0.06, location=(lx, 0, 0))
        cup = bpy.context.active_object
        cup.rotation_euler[1] = math.radians(90)
        set_material(cup, f"Cup{side}", (0.07, 0.07, 0.07, 1), roughness=0.5)

        bpy.ops.mesh.primitive_cylinder_add(radius=0.095, depth=0.025, location=(lx * 1.14, 0, 0))
        pad = bpy.context.active_object
        pad.rotation_euler[1] = math.radians(90)
        set_material(pad, f"Pad{side}", (0.12, 0.08, 0.06, 1), roughness=0.9)

    export_glb(os.path.join(out_dir, "headphones.glb"))


# ════════════════════════════════════════════════════════════════════════════
# CROWD
# ════════════════════════════════════════════════════════════════════════════

def build_crowd(out_dir):
    clear_scene()

    def add_person(x, z_offset=0):
        c = (0.1 + abs(math.sin(x)) * 0.3,
             0.05 + abs(math.cos(x * 1.3)) * 0.2,
             0.1 + abs(math.sin(x * 2.1)) * 0.4, 1.0)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.4, location=(x, 0, 0.3 + z_offset))
        body = bpy.context.active_object
        set_material(body, f"Body_{x:.2f}", c, roughness=0.8)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.1, location=(x, 0, 0.62 + z_offset))
        head = bpy.context.active_object
        set_material(head, f"Head_{x:.2f}", c, roughness=0.8)
        for dx, angle in [(-0.15, 45), (0.15, -45)]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.3, location=(x + dx, 0, 0.55 + z_offset))
            arm = bpy.context.active_object
            arm.rotation_euler[2] = math.radians(angle)
            set_material(arm, f"Arm_{x:.2f}_{dx}", c, roughness=0.8)

    cols, rows = 7, 3
    for row in range(rows):
        for col in range(cols):
            add_person((col - cols // 2) * 0.35 + row * 0.05, row * 0.1)

    export_glb(os.path.join(out_dir, "crowd.glb"))


def build_stage(out_dir):
    clear_scene()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.1))
    platform = bpy.context.active_object
    platform.scale = (4.0, 2.5, 0.2)
    bpy.ops.object.transform_apply(scale=True)
    set_material(platform, "StageDark", (0.06, 0.04, 0.08, 1), roughness=0.8)

    for i in range(3):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -(1.5 + i * 0.5), -0.1 + i * -0.06))
        step = bpy.context.active_object
        step.scale = (4.0, 0.5, 0.06)
        bpy.ops.object.transform_apply(scale=True)
        set_material(step, f"StepMat_{i}", (0.1, 0.07, 0.12, 1), roughness=0.85)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -1.26, 0.21))
    trim = bpy.context.active_object
    trim.scale = (4.0, 0.04, 0.02)
    bpy.ops.object.transform_apply(scale=True)
    set_material(trim, "TrimGlow", (0.5, 0.0, 1.0, 1), roughness=0.1)

    export_glb(os.path.join(out_dir, "stage.glb"))


# ════════════════════════════════════════════════════════════════════════════
# LIGHTS
# ════════════════════════════════════════════════════════════════════════════

def build_laser(out_dir):
    clear_scene()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    housing = bpy.context.active_object
    housing.scale = (0.3, 0.25, 0.15)
    bpy.ops.object.transform_apply(scale=True)
    set_material(housing, "Housing", (0.05, 0.05, 0.08, 1), metallic=0.6, roughness=0.4)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, location=(0, 0, 0.1))
    lens = bpy.context.active_object
    lens.scale[2] = 0.5
    bpy.ops.object.transform_apply(scale=True)
    set_material(lens, "Lens", (0.2, 0.8, 1.0, 0.6), roughness=0.0, metallic=0.1)

    bpy.ops.mesh.primitive_cone_add(radius1=0.005, radius2=0.15, depth=1.5, location=(0, 0, 0.85))
    beam = bpy.context.active_object
    set_material(beam, "Beam", (0.0, 1.0, 0.5, 0.3), roughness=0.0)

    export_glb(os.path.join(out_dir, "laser.glb"))


def build_spotlight(out_dir):
    clear_scene()
    bpy.ops.mesh.primitive_cone_add(radius1=0.25, radius2=0.12, depth=0.5, location=(0, 0, 0))
    barrel = bpy.context.active_object
    barrel.rotation_euler[0] = math.radians(180)
    set_material(barrel, "Barrel", (0.1, 0.1, 0.12, 1), metallic=0.7, roughness=0.3)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.24, depth=0.04, location=(0, 0, 0.27))
    lens = bpy.context.active_object
    set_material(lens, "SpotLens", (0.9, 0.9, 0.6, 0.8), roughness=0.05)

    for lx in [-0.3, 0.3]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.015, depth=0.5, location=(lx, 0, 0.1))
        yoke = bpy.context.active_object
        yoke.rotation_euler[2] = math.radians(90)
        set_material(yoke, f"Yoke_{lx}", (0.15, 0.15, 0.15, 1), metallic=0.9, roughness=0.2)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.08, location=(0, 0, 0.55))
    clamp = bpy.context.active_object
    set_material(clamp, "Clamp", (0.2, 0.2, 0.2, 1), metallic=0.8)

    export_glb(os.path.join(out_dir, "spotlight.glb"))


# ════════════════════════════════════════════════════════════════════════════
# CONTACT
# ════════════════════════════════════════════════════════════════════════════

def build_table(out_dir):
    clear_scene()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.75))
    top = bpy.context.active_object
    top.scale = (1.5, 0.7, 0.05)
    bpy.ops.object.transform_apply(scale=True)
    set_material(top, "TableTop", (0.85, 0.82, 0.78, 1), roughness=0.3)

    for i, (lx, ly) in enumerate([(-0.65, -0.3), (-0.65, 0.3), (0.65, -0.3), (0.65, 0.3)]):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.7, location=(lx, ly, 0.375))
        leg = bpy.context.active_object
        set_material(leg, f"Leg_{i}", (0.3, 0.3, 0.35, 1), metallic=0.9, roughness=0.2)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.35))
    shelf = bpy.context.active_object
    shelf.scale = (1.35, 0.55, 0.03)
    bpy.ops.object.transform_apply(scale=True)
    set_material(shelf, "Shelf", (0.7, 0.68, 0.64, 1), roughness=0.4)

    export_glb(os.path.join(out_dir, "table.glb"))


def build_logo(out_dir):
    clear_scene()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    shield = bpy.context.active_object
    shield.scale = (0.6, 0.08, 0.75)
    bpy.ops.object.transform_apply(scale=True)
    set_material(shield, "ShieldGold", (0.85, 0.65, 0.1, 1), metallic=0.95, roughness=0.15)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.42, minor_radius=0.025, location=(0, 0.05, 0))
    trim = bpy.context.active_object
    trim.scale = (1.0, 0.3, 1.35)
    bpy.ops.object.transform_apply(scale=True)
    set_material(trim, "TrimGold", (1.0, 0.78, 0.2, 1), metallic=1.0, roughness=0.1)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.1, location=(-0.1, 0.1, 0.05))
    d_letter = bpy.context.active_object
    set_material(d_letter, "LetterD", (0.05, 0.03, 0.0, 1), roughness=0.3)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.3, location=(0.12, 0.1, 0.0))
    j_stem = bpy.context.active_object
    set_material(j_stem, "LetterJ", (0.05, 0.03, 0.0, 1), roughness=0.3)

    export_glb(os.path.join(out_dir, "logo.glb"))


# ════════════════════════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════════════════════════

def main():
    print("\n=== DJ Events Phase 3 Asset Generator ===\n")
    tasks = [
        ("Amplifier/amplifier",  build_amplifier,  "Amplifier"),
        ("Amplifier/speaker",    build_speaker,    "Amplifier"),
        ("SoundWave/wave",       build_wave,       "SoundWave"),
        ("DJ/dj_booth",          build_dj_booth,   "DJ"),
        ("DJ/mixer",             build_mixer,      "DJ"),
        ("DJ/headphones",        build_headphones, "DJ"),
        ("Crowd/crowd",          build_crowd,      "Crowd"),
        ("Crowd/stage",          build_stage,      "Crowd"),
        ("Lights/laser",         build_laser,      "Lights"),
        ("Lights/spotlight",     build_spotlight,  "Lights"),
        ("Contact/table",        build_table,      "Contact"),
        ("Contact/logo",         build_logo,       "Contact"),
    ]

    for label, fn, subfolder in tasks:
        out_dir = os.path.join(SCRIPT_DIR, subfolder)
        ensure_dir(out_dir)
        print(f"Building {label} ...")
        try:
            fn(out_dir)
        except Exception as e:
            print(f"  ERROR in {label}: {e}")

    print("\nAll assets exported successfully!")
    print(f"Output root: {SCRIPT_DIR}\n")


if __name__ == "__main__" or True:
    main()
