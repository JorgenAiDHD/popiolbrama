"""Kuźnia (przystań) dla Popiółbramy: szopa, kowadło, miech, komin z żarem. Uruchom:
tools/blender/blender.ps1 tools/blender/make_kuznia.py assets/kuznia.glb
Konwencja gry: stopy na y=0 w Three.js (z=0 w Blenderze), front do +z Three.js (-y w Blenderze)."""
import math
import sys

import bpy

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'kuznia.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, rgb):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*rgb, 1)
    return m


STONE, WOOD, DARK, IRON, ROOF, EMBER = (
    mat('kamień', (0.34, 0.33, 0.32)), mat('drewno', (0.34, 0.2, 0.1)), mat('cień', (0.12, 0.09, 0.07)),
    mat('żelazo', (0.26, 0.27, 0.3)), mat('dach', (0.22, 0.16, 0.12)), mat('żar', (1.0, 0.5, 0.1)),
)


def add(make, material, loc, scale=None, rot=None, **kw):
    make(location=loc, **kw)
    o = bpy.context.active_object
    if scale:
        o.scale = scale
    if rot:
        o.rotation_euler = rot
    o.data.materials.append(material)
    return o


# podłoga i ściana tylna z kamienia
add(bpy.ops.mesh.primitive_cube_add, STONE, (0, 0, 0.1), (3.2, 2.4, 0.2), size=1)
add(bpy.ops.mesh.primitive_cube_add, STONE, (0, 1.1, 1.0), (3.0, 0.25, 2.0), size=1)
# słupy i dach pochyły
for sx in (-1.4, 1.4):
    add(bpy.ops.mesh.primitive_cube_add, WOOD, (sx, -0.9, 1.0), (0.18, 0.18, 2.0), size=1)
add(bpy.ops.mesh.primitive_cube_add, ROOF, (0, 0.1, 2.15), (3.5, 2.8, 0.15), rot=(0.18, 0, 0), size=1)
# palenisko z żarem
add(bpy.ops.mesh.primitive_cube_add, STONE, (0.8, 0.6, 0.45), (1.0, 0.8, 0.5), size=1)
add(bpy.ops.mesh.primitive_cube_add, EMBER, (0.8, 0.6, 0.72), (0.8, 0.6, 0.08), size=1)
# komin
add(bpy.ops.mesh.primitive_cube_add, STONE, (0.8, 1.0, 2.2), (0.5, 0.5, 2.4), size=1)
# kowadło: podstawa pnia, korpus, róg
add(bpy.ops.mesh.primitive_cylinder_add, WOOD, (-0.7, -0.2, 0.35), vertices=8, radius=0.35, depth=0.5)
add(bpy.ops.mesh.primitive_cube_add, IRON, (-0.7, -0.2, 0.78), (0.8, 0.36, 0.28), size=1)
add(bpy.ops.mesh.primitive_cone_add, IRON, (-1.2, -0.2, 0.8), rot=(0, -math.pi / 2, 0), vertices=6, radius1=0.16, depth=0.4)
# miech
add(bpy.ops.mesh.primitive_cube_add, DARK, (0.1, 0.9, 0.7), (0.5, 0.35, 0.3), size=1)
# młot oparty o pień
add(bpy.ops.mesh.primitive_cylinder_add, WOOD, (-1.1, -0.65, 0.7), rot=(0.25, 0.1, 0), vertices=6, radius=0.04, depth=1.2)
add(bpy.ops.mesh.primitive_cube_add, IRON, (-1.1, -0.73, 1.25), (0.28, 0.14, 0.14), size=1)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.join()
obj = bpy.context.active_object
obj.name = 'kuznia'
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_apply=True, export_yup=True)
print(f'EKSPORT OK: {out} wierzchołków={len(obj.data.vertices)}')
