"""Skrzynia (nagroda) dla Popiółbramy. Działa na dwa sposoby:
- CLI:  tools/blender/blender.ps1 tools/blender/make_skrzynia.py assets/skrzynia.glb
- żywy Blender przez MCP:  node tools/blender/mcp-run.mjs tools/blender/make_skrzynia.py assets/skrzynia.glb
W trybie MCP skrypt tworzy obiekty w osobnej kolekcji, eksportuje tylko je i sprząta po sobie (scena użytkownika zostaje).
Konwencja gry: stopy na y=0 w Three.js (z=0 w Blenderze)."""
import math
import sys

import bpy

LIVE = 'OUT' in globals()
out = OUT if LIVE else (sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'skrzynia.glb')
if not LIVE:
    bpy.ops.wm.read_factory_settings(use_empty=True)

coll = bpy.data.collections.new('pb_tmp')
bpy.context.scene.collection.children.link(coll)
made = []


def mat(name, rgb):
    m = bpy.data.materials.new('pb_' + name)
    m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*rgb, 1)
    return m


WOOD, IRON, GOLD, DARK = mat('drewno', (0.42, 0.24, 0.10)), mat('żelazo', (0.30, 0.31, 0.34)), mat('złoto', (0.95, 0.74, 0.22)), mat('cień', (0.18, 0.10, 0.05))


def keep(material):
    o = bpy.context.active_object
    o.data.materials.append(material)
    for c in list(o.users_collection):
        c.objects.unlink(o)
    coll.objects.link(o)
    made.append(o)
    return o


W, D, H = 0.9, 0.6, 0.34
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, H / 2)); o = bpy.context.active_object; o.scale = (W, D, H); keep(WOOD)
# wieko: półwalec wzdłuż osi x
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=D / 2, depth=W, location=(0, 0, H), rotation=(0, math.pi / 2, 0)); keep(WOOD)
# opaski żelazne
for x in (-0.3, 0.3):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, H / 2)); o = bpy.context.active_object; o.scale = (0.08, D + 0.04, H + 0.02); keep(IRON)
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=D / 2 + 0.03, depth=0.08, location=(x, 0, H), rotation=(0, math.pi / 2, 0)); keep(IRON)
# złoty zamek na froncie (front gry = -y w Blenderze)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -D / 2 - 0.02, H + 0.04)); o = bpy.context.active_object; o.scale = (0.14, 0.05, 0.16); keep(GOLD)
# złoty blask w szczelinie wieka
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, H + 0.005)); o = bpy.context.active_object; o.scale = (W - 0.1, D - 0.1, 0.03); keep(GOLD)
# nóżki
for sx in (-1, 1):
    for sy in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * 0.4, sy * 0.25, 0.03)); o = bpy.context.active_object; o.scale = (0.1, 0.1, 0.06); keep(DARK)

bpy.ops.object.select_all(action='DESELECT')
for o in made:
    o.select_set(True)
bpy.context.view_layer.objects.active = made[0]
bpy.ops.object.join()
obj = bpy.context.active_object
obj.name = 'pb_skrzynia'
obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_apply=True, export_yup=True)
verts = len(obj.data.vertices)
if LIVE:
    mesh = obj.data
    bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.meshes.remove(mesh)
    bpy.data.collections.remove(coll)
    for m in [m for m in bpy.data.materials if m.name.startswith('pb_') and m.users == 0]:
        bpy.data.materials.remove(m)
print(f'EKSPORT OK: {out} wierzchołków={verts}')
