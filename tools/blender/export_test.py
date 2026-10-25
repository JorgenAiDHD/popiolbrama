"""Test potoku Blender -> GLB. Uruchom: tools/blender/blender.ps1 tools/blender/export_test.py -- assets/test.glb"""
import sys
import bpy

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'test.glb'

bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, rgb):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*rgb, 1)
    return m


# model w konwencji gry: stopy na y=0 w Three.js (czyli z=0 w Blenderze), twarz do +z w Three.js (czyli -y w Blenderze)
bpy.ops.mesh.primitive_cone_add(vertices=7, radius1=0.4, depth=1.0, location=(0, 0, 0.5))
body = bpy.context.active_object
body.name = 'ciało'
body.data.materials.append(mat('futro', (0.49, 0.42, 0.35)))
bpy.ops.mesh.primitive_uv_sphere_add(segments=7, ring_count=5, radius=0.2, location=(0, -0.3, 0.9))
head = bpy.context.active_object
head.name = 'głowa'
head.data.materials.append(mat('nos', (0.85, 0.63, 0.63)))

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.join()
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_apply=True, export_yup=True)

verts = sum(len(o.data.vertices) for o in bpy.context.scene.objects if o.type == 'MESH')
print(f'EKSPORT OK: {out} wierzchołków={verts}')
