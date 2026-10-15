"""Run with Blender --background --python tools/build_characters.py.
Creates editable source and three glTF characters. Units and pivots match main.js.
"""
import bpy, math, random, os
from mathutils import Vector
random.seed(42)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'public','models')
os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
materials={}
def material(color):
 if color not in materials:
  m=bpy.data.materials.new(color);m.diffuse_color=(*[((int(color[i:i+2],16)/255)/12.92 if int(color[i:i+2],16)/255<=.04045 else ((int(color[i:i+2],16)/255+.055)/1.055)**2.4) for i in (1,3,5)],1);m.use_nodes=True
  m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=m.diffuse_color
  m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.87
  materials[color]=m
 return materials[color]
def group(name,parent=None,loc=(0,0,0)):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent;o.location=loc;return o
# Model in native Blender coordinates: X lateral, Y forward, Z up.
def shape(name,parent,loc,scale,color,desc,segments=20,rings=14):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,radius=1)
 o=bpy.context.object;o.name=name;o.parent=parent;o.location=loc;o.scale=scale;o.data.materials.append(material(color));o['description']=desc
 for p in o.data.polygons:p.use_smooth=True
 return o
def link(name,parent,a,b,r,color,desc):
 a,b=Vector(a),Vector(b);o=shape(name,parent,(a+b)/2,(r,r,(b-a).length/2+r),color,desc,16,10);o.rotation_quaternion=(b-a).to_track_quat('Z','Y');o.rotation_mode='QUATERNION';return o
def garment(parent,color,female,brute):
 # Continuous fitted torso, not a stack of spheres. Ring profiles include shoulders and waist.
 profiles=[(1.03,.235,.16),(1.10,.25,.17),(1.25,.245,.175),(1.43,.28,.19),(1.61,.29 if female else .33,.175),(1.70,.23,.14),(1.76,.10,.09)]
 verts=[];faces=[];segments=40
 for row,(z,w,d) in enumerate(profiles):
  for i in range(segments):
   a=i/segments*math.tau;fold=.004*math.sin(a*9+row*.8)+.003*math.sin(a*17-row)
   verts.append(((w+fold)*math.sin(a),(d+fold)*math.cos(a),z+.003*math.sin(a*7)))
 for row in range(len(profiles)-1):
  for i in range(segments):
   a=row*segments+i;b=row*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
 faces.extend([tuple(reversed(range(segments))),tuple((len(profiles)-1)*segments+i for i in range(segments))])
 mesh=bpy.data.meshes.new('fitted continuous garment');mesh.from_pydata(verts,[],faces);mesh.update()
 o=bpy.data.objects.new('torso',mesh);bpy.context.collection.objects.link(o);o.parent=parent;o.data.materials.append(material(color));o['description']='fitted weathered cotton shirt with natural shoulder line, tailored waist, worn seams and subtle cloth folds'
 if brute:o.scale.x=1.2;o['description']='torn sleeveless shirt over broad hunched muscular infected torso'
 for poly in mesh.polygons:poly.use_smooth=True
 mod=o.modifiers.new('Smooth garment contours','SUBSURF');mod.levels=2
 bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 return o

def unify_face(root):
 names={'skull','jaw','cheekbone','ear','nose_bridge','nose_tip','brow'}
 pieces=[o for o in root.children if o.type=='MESH' and o.name.split('.')[0] in names]
 bpy.ops.object.select_all(action='DESELECT')
 for o in pieces:o.select_set(True)
 bpy.context.view_layer.objects.active=pieces[0];bpy.ops.object.join();o=bpy.context.object;o.name='sculpted_face'
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=o.modifiers.new('Unified anatomy','REMESH');mod.mode='VOXEL';mod.voxel_size=.006
 bpy.ops.object.modifier_apply(modifier=mod.name)
 mod=o.modifiers.new('Soften skin transitions','SMOOTH');mod.factor=.6;mod.iterations=4;bpy.ops.object.modifier_apply(modifier=mod.name)
 o['description']='continuous sculpted human face, natural jawline, cheekbones, brow ridge, ears and defined nose, lifelike adult proportions'
 for poly in o.data.polygons:poly.use_smooth=True

def fungus(parent,loc,r,angle):
 # Corrugated fan with raised center and scalloped rim, closed thick mesh.
 verts=[];faces=[];steps=32
 for layer in range(2):
  for ring in range(6):
   rr=r*(.08+ring*.184)
   for i in range(steps+1):
    theta=-1.4+i/steps*2.8;scallop=1+.1*math.sin(i*2.3)
    verts.append((math.sin(theta)*rr*scallop,math.cos(theta)*rr,.035*math.sin(ring*.7)+.018*math.sin(i*2.3)-(layer*.035)))
 stride=steps+1;count=6*stride
 for layer in range(2):
  for j in range(5):
   for i in range(steps):
    a=layer*count+j*stride+i;faces.append((a,a+1,a+stride+1,a+stride))
 for i in range(steps):
  a=5*stride+i;faces.append((a,a+1,a+1+count,a+count))
 for j in range(5):
  for i in (0,steps):
   a=j*stride+i;faces.append((a,a+stride,a+stride+count,a+count))
 mesh=bpy.data.meshes.new('corrugated shelf fungus');mesh.from_pydata(verts,[],faces);mesh.update()
 o=bpy.data.objects.new('fungal_plate',mesh);bpy.context.collection.objects.link(o);o.parent=parent;o.location=loc;o.rotation_euler=(.4+random.random(),angle,random.random()*6.28)
 o.data.materials.append(material(random.choice(['#aa8351','#b7965c','#7d6643'])));o['description']='thick irregular scalloped fungal shelf with corrugated ochre ridges, layered leathery edges and dark gills'
 for p in mesh.polygons:p.use_smooth=True
 return o
for kind in ['rowan','mara','brute']:
 brute=kind=='brute';female=kind=='mara';root=group(kind)
 coat='#646b4f' if kind=='rowan' else '#8c4a3d' if female else '#545848';skin='#b89379' if not brute else '#8a7964';pants='#374346'
 root['description']='anatomically detailed adult survivor in weathered practical clothing' if not brute else 'terrifying hulking fungal infected with thick corrugated growths obscuring its face'
 shape('pelvis',root,(0,0,1.02),(.25,.17,.18),pants,'worn denim waistband with natural anatomical hips')
 garment(root,coat,female,brute)
 shape('neck',root,(0,0,1.82),(.075,.075,.13),skin,'anatomical neck with tendons')
 shape('skull',root,(0,.015,2.04),(.155,.16,.215),skin,'realistic human skull with cheekbones, forehead and temples',32,24)
 shape('jaw',root,(0,.06,1.93),(.115,.12,.1),skin,'anatomical lower jaw and chin')
 for side in [-1,1]:
  shape('cheekbone',root,(side*.09,.13,2.025),(.06,.035,.065),skin,'defined human cheekbone')
  shape('ear',root,(side*.158,.0,2.035),(.029,.025,.055),skin,'human ear with outer helix')
  shape('eye_socket',root,(side*.063,.155,2.07),(.043,.013,.025),'#695f52','recessed eye socket')
  shape('eye',root,(side*.063,.165,2.07),(.025,.012,.012),'#b2aa91','realistic human eye')
  shape('iris',root,(side*.063,.176,2.07),(.009,.005,.009),'#3a3b31','dark iris and pupil')
  shape('brow',root,(side*.064,.154,2.106),(.055,.022,.019),skin,'anatomical brow ridge')
  shape('eyebrow',root,(side*.064,.175,2.111),(.05,.005,.008),'#46372c','natural eyebrow')
 shape('nose_bridge',root,(0,.172,2.052),(.024,.034,.058),skin,'defined bridge of nose')
 shape('nose_tip',root,(0,.201,2.022),(.036,.035,.025),skin,'anatomical nose tip and nostrils')
 shape('mouth',root,(0,.158,1.98),(.048,.013,.009),'#7e5748','natural closed human lips')
 if not brute:
  shape('hair',root,(0,-.012,2.17),(.16,.162,.097),'#403126','dark textured hair with irregular natural hairline')
  for i in range(12):shape('hair_lock',root,((random.random()-.5)*.23,(random.random()-.5)*.2,2.19),(.045,.07,.045),'#48382b','individual natural brown hair locks',12,8)
  if female:shape('ponytail',root,(0,-.19,2.04),(.065,.08,.16),'#49362b','tied back brown ponytail')
  else:shape('beard',root,(0,.105,1.925),(.113,.065,.055),'#584437','rough short stubble beard on jaw')
 for side in [-1,1]:
  leg=group('leg_left' if side<0 else 'leg_right',root,(side*.15,0,.98))
  link('thigh',leg,(0,0,-.03),(0,.02,-.41),.105,pants,'anatomical denim thigh with creased fabric')
  shape('knee',leg,(0,.03,-.43),(.095,.1,.09),pants,'denim knee with seam')
  link('calf',leg,(0,0,-.46),(0,0,-.77),.076,pants,'anatomical trouser calf')
  shape('boot',leg,(0,.06,-.86),(.10,.18,.115),'#453d31','scuffed leather lace up boot')
  shape('sole',leg,(0,.065,-.935),(.105,.185,.03),'#2e312a','rubber boot tread')
  for i in range(4):link('boot_lace',leg,(-.06,.10+i*.019,-.79),(.06,.10+i*.019,-.79),.006,'#82745d','boot lace')
  arm=group('arm_left' if side<0 else 'arm_right',root,(side*(.31 if female else .35),0,1.67))
  shape('shoulder',arm,(0,0,-.055),(.13,.13,.14),coat,'anatomical shoulder in creased sleeve' if not brute else 'swollen infected shoulder')
  link('upper_arm',arm,(0,0,-.09),(side*.025,.025,-.32),.084,coat,'tailored cotton sleeve' if not brute else 'exposed muscular infected upper arm')
  shape('elbow',arm,(side*.025,.03,-.34),(.075,.08,.075),coat,'bent anatomical elbow')
  link('forearm',arm,(side*.025,.03,-.37),(side*.035,.075,-.61),.06,skin if brute else coat,'anatomical forearm')
  shape('palm',arm,(side*.035,.08,-.68),(.053,.025,.07),skin,'human palm and knuckles')
  for i in range(4):
   xx=side*.035+(i-1.5)*.024
   link('finger',arm,(xx,.09,-.72),(xx,.115,-.80-(.01 if i in (1,2) else 0)),.012,skin,'individual finger with knuckle')
  link('thumb',arm,(side*.035-.055,.085,-.66),(side*.035-.07,.12,-.715),.015,skin,'anatomical thumb')
  if brute:
   for i in range(5):fungus(arm,(side*.04,.04,-.12-i*.1),.12,random.random())
 if not brute:
  shape('backpack',root,(0,-.26,1.44),(.255,.14,.34),'#514d3c','battered canvas backpack with stitched seams and worn pockets')
  shape('pack_pocket',root,(0,-.38,1.26),(.19,.06,.13),'#655c45','stitched canvas backpack pocket with flap')
  for side in [-1,1]:
   link('strap',root,(side*.20,.17,1.15),(side*.22,.16,1.68),.022,'#443f31','worn woven backpack strap')
   link('back_strap',root,(side*.20,-.405,1.19),(side*.20,-.40,1.70),.016,'#86795a','backpack vertical stitched webbing')
  for i in range(5):shape('shirt_fold',root,(0,.173,1.15+i*.085),(.23,.012,.017),coat,'natural folded cotton cloth seam',16,8)
  gun=group('rifle',root,(.33,.28,1.27))
  link('stock',gun,(0,-.2,0),(0,.05,0),.055,'#69533b','weathered wooden rifle stock')
  link('receiver',gun,(0,.04,0),(0,.37,0),.045,'#323a36','steel rifle receiver')
  link('barrel',gun,(0,.35,.015),(0,.97,.015),.02,'#303633','rifle steel barrel')
 else:
  shape('snarling_mouth',root,(0,.19,1.96),(.078,.045,.085),'#453028','gaping infected mouth beneath fungal crown')
  for i in range(7):shape('tooth',root,((i-3)*.019,.228,2.00),(.007,.01,.018),'#b4a589','broken uneven infected tooth',8,6)
  for i in range(90):
   head=i<38;theta=i*2.4
   loc=(math.sin(theta)*(.17 if head else .38),.03+math.cos(theta)*(.17 if head else .22),(1.99+(i%6)*.055) if head else (.98+random.random()*.77))
   fungus(root,loc,.13+random.random()*.16,theta)
  for side in [-1,1]:
   for i in range(6):link('tendril',root,(side*.25,.18,1.35-i*.045),(side*.30,.16,1.30-i*.045),.013,'#ad956a','fibrous fungal mycelium tendril across torn clothing')
 if not brute:
  # Hair extends down the back of the skull instead of sitting like a round cap.
  shape('rear_hair',root,(0,-.112,2.075),(.145,.065,.14),'#403126','natural short hair covering the back of the skull')
  for side in [-1,1]:
   link('collar',root,(side*.065,.09,1.76),(side*.16,.17,1.67),.022,coat,'folded cotton shirt collar')
   shape('chest_pocket',root,(side*.14,.18,1.5),(.075,.012,.085),coat,'stitched fabric chest pocket')
  for i in range(5):shape('button',root,(0,.19,1.15+i*.105),(.008,.007,.008),'#7c7967','small shirt button',8,6)
 unify_face(root)
 roots=list(root.children_recursive)+[root]
 bpy.ops.object.select_all(action='DESELECT')
 for o in roots:o.select_set(True)
 bpy.context.view_layer.objects.active=root
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,kind+'.glb'),use_selection=True,export_format='GLB',export_extras=True,export_yup=True)
 root.location.x={'rowan':-2,'mara':0,'brute':2}[kind]
os.makedirs(os.path.join(ROOT,'assets'),exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'assets','last-light-characters.blend'))
print('LAST LIGHT: exported Rowan, Mara, fungal brute and editable Blender source')
