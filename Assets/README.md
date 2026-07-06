# Phase 3 – DJ Events 3D Asset Generator

## Generated Files

```
Assets/
├── generate_all_assets.py     ← Blender Python script
├── run_blender_export.bat     ← Windows double-click runner
│
├── Amplifier/
│   ├── amplifier.glb          ← Amp cabinet with grille, handle, knobs
│   └── speaker.glb            ← Speaker driver (frame + cone + dust cap)
│
├── SoundWave/
│   └── wave.glb               ← Multi-layer sine wave with skin modifier
│
├── DJ/
│   ├── dj_booth.glb           ← DJ desk with legs & LED fascia
│   ├── mixer.glb              ← 4-channel mixer, faders, EQ knobs
│   └── headphones.glb         ← Over-ear headphones with ear cups
│
├── Crowd/
│   ├── crowd.glb              ← 21 crowd figures with raised arms
│   └── stage.glb              ← Elevated stage platform with steps & LED trim
│
├── Lights/
│   ├── laser.glb              ← Laser unit with housing, lens & beam
│   └── spotlight.glb          ← PAR can with barrel, lens & yoke
│
└── Contact/
    ├── table.glb              ← Reception table with shelf
    └── logo.glb               ← Gold shield DJ logo
```

---

## How to Run

### Option A – Command Line (Recommended)

```bash
blender --background --python generate_all_assets.py
```

### Option B – Double-click

1. Open `run_blender_export.bat` in a text editor
2. Set `BLENDER_PATH` to your actual `blender.exe` path
3. Save and double-click

### Option C – Blender Scripting Tab

1. Open Blender
2. Switch to the **Scripting** workspace
3. Click **Open** and select `generate_all_assets.py`
4. Click **▶ Run Script**

---

## Finding Your Blender Path

Run in PowerShell to find Blender:
```powershell
Get-Command blender -ErrorAction SilentlyContinue
# OR search:
Get-ChildItem "C:\Program Files\" -Recurse -Filter "blender.exe" -ErrorAction SilentlyContinue
```

Common paths:
- `C:\Program Files\Blender Foundation\Blender 4.1\blender.exe`
- `C:\Program Files\Blender Foundation\Blender 3.6\blender.exe`

---

## Asset Details

| Asset | Key Parts |
|-------|-----------|
| `amplifier.glb` | Body, grille panel, carry handle (torus), 4 control knobs |
| `speaker.glb` | Outer frame ring (torus), paper cone, dust cap (sphere) |
| `wave.glb` | 5-layer sine wave mesh, Skin modifier for 3D thickness |
| `dj_booth.glb` | Tabletop, left/right legs, LED front fascia |
| `mixer.glb` | Mixer body, 4 channel faders, crossfader, 12 EQ knobs |
| `headphones.glb` | Headband arc (torus), ear cups (cylinders), ear pads |
| `crowd.glb` | 21 figures × (body + head + 2 arms), colorful materials |
| `stage.glb` | Main platform, 3 front steps, purple LED trim strip |
| `laser.glb` | Housing box, lens dome (half-sphere), beam cone |
| `spotlight.glb` | PAR barrel (cone), fresnel lens, yoke arms, clamp |
| `table.glb` | Tabletop, 4 metal legs (cylinders), lower shelf |
| `logo.glb` | Gold shield, trim ring (torus), D & J letter shapes |

---

## Notes

- All materials use **Principled BSDF** with metallic/roughness PBR values
- All exports use `export_apply=True` so transforms are baked into mesh
- GLB format includes geometry + materials in a single binary file
- Compatible with **Three.js**, **Babylon.js**, **Model Viewer**, and **Spline**
