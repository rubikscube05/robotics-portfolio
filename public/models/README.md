Place verified local GLB/GLTF assets here: drone.glb, squid.glb, rover.glb, interceptor.glb. The app falls back to generic engineering geometry when a file is absent.

## interceptor.glb

Expected orientation: nose pointing along +Z, origin roughly centered, real-world scale in meters. The landing page auto-scales/centers the loaded model to ~1.4 m.

The landing-page interceptor loads this file first. Current file:

- "ODIN Win Hit - QUAD FPV Tailsitter interceptor" by FLIGHTCLUB (@flightclubua)
  https://sketchfab.com/3d-models/odin-win-hit-quad-fpv-tailsitter-interceptor-34702bf0ad434de5ac4c452a0a0b5242
  License: CC BY 4.0 (attribution required; credited in the site footer).
- Downloaded 2026-10-12 from Sketchfab (trimmed-texture GLB variant, ~26.9 MB,
  14 meshes, 3 embedded PNGs, no Draco/KTX2). Source mesh ~500k triangles, so
  consider decimating it externally if the scene must run on weak GPUs.
