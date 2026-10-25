"""Ognisko (Dark Souls 2: ognisko) dla Popiółbramy. Uruchom:
tools/blender/blender.ps1 tools/blender/make_ognisko.py assets/ognisko.glb
Konwencja gry: stopy na y=0 w Three.js (z=0 w Blenderze), skala ok. 1 jednostka = 1 m."""
import math
import sys

import bpy

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'ognisko.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, rgb):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*rgb, 1)
    return m


STONE, WOOD, ASH, STEEL, FLAME, CORE = (
    mat('kamień', (0.32, 0.31, 0.30)), mat('drewno', (0.30, 0.18, 0.09)), mat('popiół', (0.55, 0.53, 0.50)),
    mat('stal', (0.62, 0.66, 0.72)), mat('płomień', (1.0, 0.46, 0.08)), mat('żar', (1.0, 0.82, 0.30)),
)


def add(make, material, **kw):
    make(**kw)
    o = bpy.context.active_object
    o.data.materials.append(material)
    return o


# krąg kamieni
for i in range(9):
    a = i / 9 * math.tau
    o = add(bpy.ops.mesh.primitive_ico_sphere_add, STONE, subdivisions=1, radius=0.28,
            location=(math.cos(a) * 0.95, math.sin(a) * 0.95, 0.14))
    o.scale = (1.0, 1.0, 0.62)
    o.rotation_euler = (0.3 * i, 0.2 * i, 0.5 * i)
# warstwa popiołu
add(bpy.ops.mesh.primitive_cylinder_add, ASH, vertices=14, radius=0.8, depth=0.12, location=(0, 0, 0.06))
# polana ustawione w stos
for i in range(5):
    a = i / 5 * math.tau + 0.3
    o = add(bpy.ops.mesh.primitive_cylinder_add, WOOD, vertices=6, radius=0.07, depth=1.1,
            location=(math.cos(a) * 0.22, math.sin(a) * 0.22, 0.42))
    o.rotation_euler = (math.sin(a) * 0.9, -math.cos(a) * 0.9, 0)
# zwinięty miecz wbity w popiół (znak ogniska)
add(bpy.ops.mesh.primitive_cylinder_add, STEEL, vertices=6, radius=0.025, depth=1.5, location=(0, 0, 0.8))
add(bpy.ops.mesh.primitive_cube_add, STEEL, size=1, location=(0, 0, 1.28)).scale = (0.28, 0.04, 0.04)
# płomień: stożek zewnętrzny i żar w środku
add(bpy.ops.mesh.primitive_cone_add, FLAME, vertices=7, radius1=0.42, radius2=0.0, depth=1.25, location=(0, 0, 0.75))
add(bpy.ops.mesh.primitive_cone_add, CORE, vertices=6, radius1=0.22, radius2=0.0, depth=0.8, location=(0, 0, 0.6))

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.join()
obj = bpy.context.active_object
obj.name = 'ognisko'
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_apply=True, export_yup=True)
print(f'EKSPORT OK: {out} wierzchołków={len(obj.data.vertices)}')
