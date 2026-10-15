import * as THREE from 'three';
import './style.css';
import { sphereHit, boxHit } from './combat.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const characterModels = new Map();

const scene = new THREE.Scene();
scene.background = new THREE.Color('#bd8564');
scene.fog = new THREE.Fog('#bd8564', 35, 95);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 150);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.prompt = 'style: photorealistic cinematic survival horror, lifelike human anatomy and facial structure, textured worn fabric and organic fungal horror. Weathered materials, abandoned civilization reclaimed by nature, warm amber dawn light, atmospheric haze, muted olive and rust palette. Dramatic grounded proportions, richly detailed surfaces.';
renderer.backgroundDescription = 'A misty peach and amber dawn sky above an abandoned town, distant hazy ruined skyline, the first sun rising through dusty clouds.';
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#ffd8a0','#394b36',2));
const sun = new THREE.DirectionalLight('#ffce8d',3); sun.position.set(-20,25,-35); sun.castShadow=true; scene.add(sun);
const materials = new Map();
function mat(c) { if(!materials.has(c)) materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.9})); return materials.get(c); }
function box(parent,w,h,d,c,x,y,z,desc) { const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c)); m.position.set(x,y,z); m.castShadow=true;m.receiveShadow=true;m.userData.description=desc; parent.add(m); return m; }
function ball(parent,r,c,x,y,z,desc,sx=1,sy=1,sz=1) {const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.userData.description=desc;parent.add(m);return m;}
function rod(parent,r,h,c,x,y,z,desc) {const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,8),mat(c));m.position.set(x,y,z);m.userData.description=desc;parent.add(m);return m;}
let seed=31; function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
const obstacles=[];
box(scene,100,.3,130,'#464a3b',0,-.2,-20,'cracked dark asphalt covered in weeds, dirt and debris');
for(const x of [-13,13]) box(scene,8,.2,110,'#77715e',x,0,-20,'broken concrete sidewalk overgrown with moss');
for(let z=-65;z<35;z+=7) box(scene,.17,.01,2.8,'#b8a274',0,.012,z,'faded yellow road lane markings');
for(const side of [-1,1]) for(let i=0;i<8;i++) {
 const x=side*(20+rand()*2),z=28-i*13,h=8+rand()*12,w=8+rand()*3;
 box(scene,w,h,11,['#806354','#6d685b','#8a7660'][i%3],x,h/2,z,'abandoned weathered brick apartment building with cracked plaster and climbing ivy');
 box(scene,w+.4,.4,11.4,'#494a40',x,h,z,'crumbling rooftop parapet');
 for(let y=2.3;y<h-1;y+=3)for(let xx=-w/2+1;xx<w/2;xx+=2.4) box(scene,1.2,1.7,.16,'#303c3b',x+xx,y,z+5.6,'dark shattered window with rusted frame');
 box(scene,w-1,2.7,.2,'#49463d',x,1.4,z+5.7,'boarded up storefront with peeling paint');
 for(let k=0;k<4;k++) ball(scene,.8,'#4a5736',x+(rand()-.5)*w,2+rand()*h,z+5.85,'dense ivy clinging to ruined facade',.8,2,.25);
}
function car(x,z,c,angle=0) {
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);
 box(g,2.2,.8,4.3,c,0,.65,0,'abandoned rusted car with dented bodywork');box(g,1.9,.8,2.2,'#465251',0,1.4,-.2,'dusty broken car windows');box(g,2,.15,2.3,c,0,1.85,-.2,'rusted car roof');
 for(const xx of [-1.1,1.1])for(const zz of [-1.35,1.35]){const m=rod(g,.42,.25,'#262d2b',xx,.42,zz,'flat worn rubber tire');m.rotation.z=Math.PI/2;}
 box(g,1.7,.16,.1,'#c9b58a',0,.8,2.2,'broken yellowed headlights');obstacles.push({x,z,r:2.6});
 const hood=box(g,2,.14,1.1,c,0,1.13,1.7,'buckled rusted hood peeling away from crushed engine compartment');hood.rotation.x=-.18;
 const door=box(g,.12,.8,1.5,c,1.2,.9,.15,'hanging bent car door with corroded hinges');door.rotation.y=-.45;
 box(g,1.6,.14,.2,'#555c52',0,.42,2.35,'twisted detached metal bumper');
 for(let i=0;i<4;i++){const shard=box(g,.4,.22,.025,'#697e79',-.65+i*.4,1.5,1,'jagged fragment of broken windshield');shard.rotation.z=(i-1.5)*.17;}
 for(let i=0;i<3;i++)ball(g,.18,'#684737',-.6+i*.6,.9,2.13,'flaking rust and exposed crumpled metal',1.5,.8,.4);
 return g;
}
car(-7,6,'#78634c',.3);car(7,-9,'#555f58',-.35);car(-7,-26,'#8c5c43',.15);car(8,24,'#69726a',-.2);car(6,-46,'#5b5b4a',.6);
car(-8,-11,'#655c45',-.5);car(8,-29,'#745344',.8);car(-8,-44,'#65716a',.4);
const overturned=car(10,-55,'#514e40',.8);overturned.rotation.z=1.25;overturned.position.y=1;
// Dense grass blades are real mesh geometry, so they survive Dewdrop rendering.
const grassGeometry=new THREE.ConeGeometry(.065,.7,4);
const grass=new THREE.InstancedMesh(grassGeometry,mat('#627349'),650);
grass.userData.description='long unruly wild grass blades, dry tips and green stems sprouting densely through broken asphalt and sidewalks';
const grassTransform=new THREE.Object3D();
for(let i=0;i<650;i++){const side=i%2?1:-1,x=side*(4+rand()*11),z=rand()*103-65,h=.5+rand()*1.1;grassTransform.position.set(x,h*.35,z);grassTransform.scale.set(.7+rand(),h,.7+rand());grassTransform.rotation.set((rand()-.5)*.35,rand()*6.28,(rand()-.5)*.35);grassTransform.updateMatrix();grass.setMatrixAt(i,grassTransform.matrix);}scene.add(grass);
for(let i=0;i<35;i++){const side=i%2?1:-1;ball(scene,.6+rand()*.4,'#475b37',side*(10+rand()*4),.4,rand()*100-60,'tangled blackberry thicket and waist high weeds reclaiming the sidewalk',1.3,1.2,1.7);}
for(let i=0;i<120;i++){let x=(rand()-.5)*32,z=rand()*100-65;if(Math.abs(x)<3&&rand()<.7)continue;ball(scene,.3+rand()*.5,'#53633c',x,.18,z,'wild weeds and shrubs growing through cracked pavement',1.6,.8,1.4);}
for(let i=0;i<28;i++)box(scene,.4+rand(),.15+rand()*.3,.6,'#79715e',(rand()-.5)*25,.12,rand()*95-60,'broken masonry rubble');
for(const x of [-11,11])for(let z=-45;z<30;z+=25){rod(scene,.12,7,'#4e493c',x,3.5,z,'rusted streetlight pole');box(scene,2,.15,.2,'#665849',x-.8,6.9,z,'broken streetlight arm');box(scene,.7,.18,.4,'#ddba7b',x-1.7,6.8,z,'dusty amber streetlamp');}
const barricade=new THREE.Group(); scene.add(barricade);for(let i=0;i<5;i++)box(barricade,1.7,1,.7,'#696957',-4+i*2, .5,-62,'weathered concrete quarantine barricade');
function capsule(parent,r,length,c,x,y,z,desc,sx=1,sz=1){
 const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,length,5,12),mat(c));m.position.set(x,y,z);m.scale.set(sx,1,sz);m.castShadow=true;m.userData.description=desc;parent.add(m);return m;
}
function modelParts(g){const legs=[],arms=[];g.traverse(o=>{if(o.name.startsWith('leg_left')||o.name.startsWith('leg_right'))legs.push(o);if(o.name.startsWith('arm_left')||o.name.startsWith('arm_right'))arms.push(o);});return {legs,arms};}
function detailedModel(type){const model=characterModels.get(type);if(!model)return null;const g=new THREE.Group();const mesh=model.clone(true);mesh.rotation.y+=Math.PI;g.add(mesh);if(type==='brute')g.scale.set(1.65,1.5,1.5);return g;}
function person(type,x,z){
 const model=detailedModel(type);
 if(model){model.position.set(x,0,z);model.rotation.y=Math.PI;scene.add(model);return {g:model,...modelParts(model),hp:100,type,cool:0,attack:0,phase:rand()*6};}
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.PI;scene.add(g);
 const infected=type==='infected'||type==='brute',brute=type==='brute',female=type==='mara';
 const coat=female?'#8b473b':infected?'#5e6251':'#5d6750',skin=infected?'#918674':'#b18a70';
 g.userData.description=brute?'An anatomically realistic hulking fungal infected, broad muscular shoulders, hunched spine, ragged sleeveless shirt, ochre shelf fungus erupting across skull and shoulders':infected?'An anatomically realistic emaciated infected adult, sallow skin, torn work clothes, hunched posture and irregular crusted fungal lesions':female?'Mara, realistic adult female survivor with tied back brown hair, weathered rust red cotton jacket, fitted worn jeans, scuffed boots and a canvas backpack':'Rowan, realistic adult male survivor with short dark hair, beard, weathered olive field shirt, worn dark jeans, leather boots and a battered canvas backpack';
 const torso=capsule(g,.24,.38,coat,0,1.38,0,infected?'torn stained fabric stretched over a gaunt ribcage':'creased cotton jacket torso with stitched seams',female?1.25:1.5,.8);
 if(infected)torso.rotation.x=.16;
 ball(g,.22,'#424b43',0,.99,0,'worn trouser waistband and hips',1.4,.7,.8);
 rod(g,.075,.17,skin,0,1.83,.015,'anatomical neck');
 ball(g,.195,skin,0,2.04,.02,'realistic human skull with cheekbones and temples',.84,1.18,.94);
 ball(g,.12,skin,0,1.94,.07,'angular human jaw and chin',.95,.75,.8);
 for(const side of [-1,1]){ball(g,.045,skin,side*.164,2.04,.02,'human ear',.5,1,.7);ball(g,.032,'#37352f',side*.065,2.075,.177,'recessed human eye',1,.45,.4);}
 ball(g,.036,skin,0,2.03,.197,'defined human nose',.8,1.3,1.6);
 ball(g,.042,infected?'#513b31':'#795e4e',0,1.98,.174,infected?'open dark snarling mouth':'human lips',1.1,.3,.45);
 if(!infected){
  ball(g,.19,'#3d3028',0,2.16,-.02,'natural dark brown hair with uneven hairline',.92,.52,1);
  if(female){capsule(g,.065,.22,'#443329',0,2.01,-.19,'tied back brown ponytail');}
  else ball(g,.125,'#524236',0,1.93,.105,'short rough beard along chin and jaw',1,.6,.6);
 }
 const legs=[],arms=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.155,.96,0);g.add(leg);legs.push(leg);
  capsule(leg,.105,.28,'#3d4748',0,-.22,0,'creased denim thigh');ball(leg,.095,'#424a48',0,-.45,.015,'trouser knee');
  capsule(leg,.081,.25,'#394344',0,-.63,0,'worn denim lower leg');capsule(leg,.09,.12,'#39372f',0,-.84,.08,'scuffed leather boot',1,1.65);
  const arm=new THREE.Group();arm.position.set(side*(female?.31:.36),1.64,0);g.add(arm);arms.push(arm);arm.rotation.z=side*.09;
  capsule(arm,.095,.2,coat,0,-.16,0,'creased jacket upper sleeve');ball(arm,.08,coat,0,-.34,.025,'bent elbow');
  capsule(arm,.065,.2,infected?skin:coat,0,-.49,.055,infected?'sinewy exposed forearm with lesions':'rolled cotton sleeve and forearm');
  ball(arm,.075,skin,0,-.68,.065,'anatomical hand and knuckles',.65,1,.55);
  for(let j=0;j<3;j++)capsule(arm,.014,.055,skin,(j-1)*.026,-.745,.08,'finger');
 }
 if(!infected){
  capsule(g,.23,.35,'#514c3b',0,1.4,-.25,'weathered canvas backpack with stitched pockets and frayed edges',1.15,.65);
  capsule(g,.14,.12,'#605842',0,1.19,-.4,'canvas backpack lower pouch',1.5,.45);
  for(const side of [-1,1]){capsule(g,.028,.56,'#3e3d30',side*.22,1.4,.175,'worn backpack shoulder strap');box(g,.11,.17,.05,'#706953',side*.22,1.26,.21,'strap buckle');}
  const gun=new THREE.Group();gun.position.set(.33,1.27,.26);g.add(gun);
  box(gun,.085,.11,.4,'#343a36',0,0,.22,'dark steel rifle receiver');capsule(gun,.045,.22,'#65503a',0,-.025,-.08,'worn wooden rifle stock',1,1.5);
  const barrel=rod(gun,.028,.58,'#343b37',0,.015,.65,'rifle steel barrel');barrel.rotation.x=Math.PI/2;
  box(gun,.07,.17,.12,'#303733',0,-.12,.26,'rifle magazine');
 }else{
  // Asymmetric overlapping flattened lobes form shelf fungus rather than a spherical cap.
  const n=brute?24:11;
  for(let i=0;i<n;i++){
   const crown=i<7,theta=i*2.4,r=crown?.12:.26;
   const xx=Math.sin(theta)*r,yy=crown?2.05+(i%3)*.08:1.25+rand()*.55,zz=crown?.08+Math.cos(theta)*.15:(rand()-.5)*.45;
   const m=ball(g,.1+rand()*.09,['#aa8d58','#897347','#bb9b68'][i%3],xx,yy,zz,'irregular overlapping shelf fungus lobe, rippled leathery ochre edges and dark gills',1.5,.32,1.15);m.rotation.set(rand()*.9,theta,rand()*.8);
  }
  for(const side of [-1,1])capsule(g,.045,.36,'#8b7957',side*.39,1.22,.09,'fibrous fungal cord growing down the arm');
 }
 if(brute)g.scale.set(1.65,1.5,1.5);
 return {g,legs,arms,hp:100,type,cool:0,attack:0,phase:rand()*6};
}
const player=person('rowan',-1,17),buddy=person('mara',1.1,17.6);const enemies=[],effects=[],pickups=[],bullets=[];
let blood=0,recoil=0;
let playing=false,ended=false,paused=false,elapsed=0,kills=0,wave=1,spawnTimer=0,shotCooldown=0,dodge=0,dodgeCooldown=0,reload=0,ammo=12,meds=2,best=0;
try{best=Number(localStorage.getItem('last-light-best'))||0;}catch{}
const keys=new Set();const aim=new THREE.Vector3(0,0,-1);let firing=false;
const hud=document.createElement('div');hud.id='hud';hud.innerHTML=`<div id="blood" aria-hidden="true"><i></i><i></i><i></i><i></i></div><header><div class="wordmark">LAST LIGHT<span>QUARANTINE DISTRICT / 06:12 AM</span></div><div class="stats"><span id="wave">WAVE 01</span><strong id="kills">0</strong><small>INFECTED DOWN</small></div></header><div id="message" role="status"></div><footer><div class="vitals"><label>ROWAN <b id="hp1">100</b></label><div class="track"><i id="bar1"></i></div><label>MARA <b id="hp2">100</b></label><div class="track companion"><i id="bar2"></i></div></div><div class="ammo"><strong id="ammo">12</strong><span>/ ∞<br>RIFLE</span><small id="meds">2 MEDKITS</small></div><div class="controls">WASD / Arrows move · Mouse aim · Hold click fire<br>R reload · Space evade · E heal both · P pause</div></footer><div id="screen"><p class="eyebrow">TWO SURVIVORS. ONE MORE DAWN.</p><h1>LAST<br>LIGHT</h1><p>Hold the district against the infected.<br>Stay together. Keep both survivors alive.</p><button id="start">ENTER THE DISTRICT <span>→</span></button><small>WASD / Arrow keys to move · Mouse to aim · Hold click to fire<br>Mara follows and covers you. Brutes arrive from wave 2.</small></div>`;document.body.appendChild(hud);
const el=id=>document.getElementById(id);
function message(s){el('message').textContent=s;}
function spawn(brute=false){const a=rand()*Math.PI*2,r=18+rand()*7;let x=THREE.MathUtils.clamp(player.g.position.x+Math.sin(a)*r,-10,10),z=THREE.MathUtils.clamp(player.g.position.z+Math.cos(a)*r,-56,30);const e=person(brute?'brute':'infected',x,z);e.hp=brute?150:40;e.speed=brute?1.5:2+wave*.12;enemies.push(e);}
function start(){for(const e of enemies)scene.remove(e.g);enemies.length=0;for(const p of pickups)scene.remove(p);pickups.length=0;player.hp=buddy.hp=100;player.g.position.set(-1,0,17);buddy.g.position.set(1.1,0,17.6);elapsed=kills=0;blood=recoil=0;for(const b of bullets)scene.remove(b.m);bullets.length=0;wave=1;ammo=12;meds=2;reload=shotCooldown=spawnTimer=dodge=dodgeCooldown=0;playing=true;ended=paused=false;el('screen').style.display='none';for(let i=0;i<5;i++)spawn();const brute=person('brute',2,-7);brute.hp=150;brute.speed=1.5;enemies.push(brute);message('Stay close. Mara has your back.');}
el('start').onclick=start;
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='KeyP'&&playing&&!ended){paused=!paused;message(paused?'PAUSED · Press P to return':'Back in the fight.');}if(e.code==='KeyR'&&ammo<12&&!reload)reload=1.5;if(e.code==='KeyE'&&playing&&!paused&&meds>0&&(player.hp<100||buddy.hp<100)){meds--;player.hp=Math.min(100,player.hp+45);buddy.hp=Math.min(100,buddy.hp+45);message('Field dressings applied to both survivors.');}if(e.code==='Space'&&playing&&!paused&&dodgeCooldown<=0){dodge=.28;dodgeCooldown=2.5;}});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();firing=false;});
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-1.3),cursor=new THREE.Vector3(),pointer=new THREE.Vector2(0,0);
let hoveredEnemy=null,pointerUsed=false,hitTimer=0;
const hitUI=document.createElement('div');hitUI.id='hit-feedback';hud.appendChild(hitUI);
addEventListener('pointermove',e=>{pointerUsed=true;pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);hitUI.style.left=e.clientX+'px';hitUI.style.top=e.clientY+'px';});
function updateAim(){
 if(!pointerUsed)return;ray.setFromCamera(pointer,camera);hoveredEnemy=null;let near=100;
 for(const e of enemies){const center=e.g.position.clone().add(new THREE.Vector3(0,e.type==='brute'?1.65:1.3,0)),hit=sphereHit(ray.ray.origin,ray.ray.direction,100,center,e.type==='brute'?1.3:.85);if(hit!==null&&hit<near){hoveredEnemy=e;near=hit;}}
 if(hoveredEnemy){aim.copy(hoveredEnemy.g.position).sub(player.g.position);aim.y=0;aim.normalize();}
 else if(ray.ray.intersectPlane(plane,cursor)){aim.copy(cursor).sub(player.g.position);aim.y=0;aim.normalize();}
}
addEventListener('pointerdown',e=>{if(e.button===0&&e.target===renderer.domElement)firing=true;});addEventListener('pointerup',()=>firing=false);
function move(actor,dir,speed,dt){const p=actor.g.position;p.addScaledVector(dir,speed*dt);p.x=THREE.MathUtils.clamp(p.x,-10.5,10.5);p.z=THREE.MathUtils.clamp(p.z,-57,31);for(const o of obstacles){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz);if(d<o.r+.4){p.x=o.x+dx/(d||1)*(o.r+.4);p.z=o.z+dz/(d||1)*(o.r+.4);}}}
function animatePerson(a,moving,t){const infected=a.type==='infected'||a.type==='brute';const stride=infected?.24:.38;a.g.rotation.x=a.biting>0?Math.sin(a.biting/.55*Math.PI)*.32:a.flinch>0?-.12:0;a.legs.forEach((l,i)=>l.rotation.x=moving?Math.sin(t*(infected?5:8)+a.phase+i*Math.PI)*stride:0);a.arms.forEach((l,i)=>l.rotation.x=infected?-.35+Math.sin(t*4+a.phase+i)*.12:-.55-(a.recoil||0)*1.5+(moving?Math.sin(t*8+a.phase+i*Math.PI)*.1:0));}
function effect(m,life,velocity){effects.push({m,life,velocity});}
function impact(enemy,damage,dir,hitPoint){
 enemy.hp=Math.max(0,enemy.hp-damage);hitTimer=.35;hitUI.textContent=enemy.hp===0?'✕ KILL':`✕ HIT · ${enemy.hp} HP`;enemy.flinch=.24;enemy.g.position.addScaledVector(dir,.18);
 const p=hitPoint||enemy.g.position.clone().add(new THREE.Vector3(0,enemy.type==='brute'?1.8:1.3,0));
 const wound=ball(enemy.g,.1,'#73362d',0,1.3,.22,'visible dark bullet impact wound in torn clothing',1,.7,.4);if(enemy.type==='brute')wound.position.y=1.15;
 const burst=ball(scene,.15,'#ddb179',p.x,p.y,p.z,'brief visible bullet impact burst and fungal fragments');effect(burst,.16);
 for(let i=0;i<5;i++){const drop=ball(scene,.025,'#793c2e',p.x,p.y,p.z,'brief dark red bullet impact droplet');effect(drop,.22,new THREE.Vector3((rand()-.5)*2,rand()*2,-dir.z*1.5));}
 if(enemy.hp<=0){enemies.splice(enemies.indexOf(enemy),1);enemy.g.rotation.x=-.2;effects.push({m:enemy.g,life:3,corpse:true});kills++;if(kills%8===0){const p=box(scene,.6,.4,.6,'#bcc69a',enemy.g.position.x,.3,enemy.g.position.z,'medical supply box with cross');pickups.push(p);}}
}
function shoot(actor,dir,damage){
 const right=new THREE.Vector3(dir.z,0,-dir.x);
 const from=actor.g.position.clone().add(new THREE.Vector3(0,1.29,0)).addScaledVector(right,.32).addScaledVector(dir,.55);
 let flight=dir.clone();if(actor===player&&hoveredEnemy&&enemies.includes(hoveredEnemy)){flight=hoveredEnemy.g.position.clone().add(new THREE.Vector3(0,hoveredEnemy.type==='brute'?1.65:1.3,0)).sub(from).normalize();}
 const projectile=box(scene,.055,.055,.8,'#d0b278',from.x,from.y,from.z,'small copper jacketed rifle bullet with a short faint motion streak');projectile.lookAt(from.clone().add(flight));
 bullets.push({m:projectile,p:from.clone(),velocity:flight.multiplyScalar(55),life:.7,damage});
 const flash=ball(scene,.11,'#ffd48a',from.x,from.y,from.z,'brief orange white rifle muzzle flash',.7,.7,1.5);effect(flash,.065);
 const casing=rod(scene,.025,.085,'#b28c43',from.x,from.y,from.z,'ejected brass cartridge case');effect(casing,.55,right.multiplyScalar(2).add(new THREE.Vector3(0,2,0)));
 actor.recoil=.18;if(actor===player)recoil=.13;
}
function updateBullets(dt){
 for(let i=bullets.length-1;i>=0;i--){const b=bullets[i],before=b.p.clone();b.life-=dt;b.velocity.y-=1.5*dt;b.p.addScaledVector(b.velocity,dt);
 const segment=b.p.clone().sub(before),length=segment.length(),direction=segment.clone().normalize();let target=null,nearest=length,wall=false;
 for(const e of enemies){const center=e.g.position.clone().add(new THREE.Vector3(0,e.type==='brute'?1.65:1.3,0)),hit=sphereHit(before,direction,length,center,e.type==='brute'?1.15:.65);if(hit!==null&&hit<=nearest){nearest=hit;target=e;}}
 for(const o of obstacles){const hit=boxHit(before,direction,length,{x:o.x-1.1,y:.1,z:o.z-2.15},{x:o.x+1.1,y:1.85,z:o.z+2.15});if(hit!==null&&hit<nearest){nearest=hit;target=null;wall=true;}}
 if(target)impact(target,b.damage,direction,before.clone().addScaledVector(direction,nearest));
 if(target||wall||b.life<=0){scene.remove(b.m);b.m.geometry.dispose();bullets.splice(i,1);}else{b.m.position.copy(b.p);b.m.lookAt(b.p.clone().add(direction));}
 }
}
function bite(enemy,victim){
 const amount=enemy.type==='brute'?38:23;victim.hp=Math.max(0,victim.hp-amount);blood=1;victim.flinch=.3;
 const push=victim.g.position.clone().sub(enemy.g.position).normalize();move(victim,push,2,.12);
 message((victim===player?'Rowan':'Mara')+' bitten! −'+amount+' health. Evade or use E to heal.');
}

function end(){ended=true;playing=false;best=Math.max(best,kills);try{localStorage.setItem('last-light-best',best);}catch{}el('screen').innerHTML=`<p class="eyebrow">THE DISTRICT FALLS SILENT</p><h1>DAWN<br>ENDS</h1><p>${kills} infected down · Wave ${wave}<br>Survived ${Math.floor(elapsed/60)}:${String(Math.floor(elapsed%60)).padStart(2,'0')} · Best ${best}</p><button id="again">TRY ANOTHER DAWN →</button><small>Keep moving and use medkits before either survivor falls.</small>`;el('screen').style.display='flex';el('again').onclick=start;}
function updateHud(){el('hp1').textContent=Math.ceil(player.hp);el('hp2').textContent=Math.ceil(buddy.hp);el('bar1').style.width=player.hp+'%';el('bar2').style.width=buddy.hp+'%';el('ammo').textContent=reload?'…':ammo;el('meds').textContent=meds+' MEDKITS';el('kills').textContent=kills;el('wave').textContent='WAVE '+String(wave).padStart(2,'0');}
let last=0;
renderer.setAnimationLoop(ms=>{const dt=Math.min((ms-last)/1000,.05);last=ms;const t=ms/1000;
 if(playing&&!paused&&!ended){elapsed+=dt;updateAim();hitTimer=Math.max(0,hitTimer-dt);blood=Math.max(0,blood-dt*1.1);recoil=Math.max(0,recoil-dt);for(const a of [player,buddy,...enemies]){a.recoil=Math.max(0,(a.recoil||0)-dt);a.flinch=Math.max(0,(a.flinch||0)-dt);}updateBullets(dt);shotCooldown-=dt;dodgeCooldown-=dt;dodge=Math.max(0,dodge-dt);if(reload>0){reload-=dt;if(reload<=0)ammo=12;}
 const nw=1+Math.floor(elapsed/30);if(nw>wave){wave=nw;message('WAVE '+wave+' · '+(wave>=2?'A brute is closing in.':'More infected incoming.'));if(wave>=2)spawn(true);}
 spawnTimer-=dt;if(spawnTimer<=0&&enemies.length<20){spawn();spawnTimer=Math.max(.7,2.5-wave*.2);}
 const dir=new THREE.Vector3((keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),0,(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0));dir.normalize();if(dodge>0&&dir.lengthSq()===0)dir.copy(aim);move(player,dir,dodge>0?14:5,dt);player.g.rotation.y=Math.atan2(aim.x,aim.z);animatePerson(player,dir.lengthSq()>0,t);
 if(firing&&shotCooldown<=0&&!reload&&ammo>0){ammo--;shotCooldown=.19;shoot(player,aim,22);if(ammo===0){reload=1.5;message('Reloading. Keep moving.');}}
 const follow=player.g.position.clone().add(new THREE.Vector3(1.9,0,.6)).sub(buddy.g.position);const moving=follow.length()>1.1;if(moving)move(buddy,follow.normalize(),4.8,dt);animatePerson(buddy,moving,t);buddy.cool-=dt;
 let closest=null,distance=18;for(const e of enemies){const d=e.g.position.distanceTo(buddy.g.position);if(d<distance){closest=e;distance=d;}}if(closest){const v=closest.g.position.clone().sub(buddy.g.position).normalize();buddy.g.rotation.y=Math.atan2(v.x,v.z);if(buddy.cool<=0){shoot(buddy,v,18);buddy.cool=.65;}}
 for(const e of [...enemies]){
 e.attack-=dt;const victim=e.g.position.distanceTo(player.g.position)<e.g.position.distanceTo(buddy.g.position)?player:buddy;
 const v=victim.g.position.clone().sub(e.g.position),d=v.length(),range=e.type==='brute'?2.2:1.35;e.g.rotation.y=Math.atan2(v.x,v.z);
 if(e.biting>0){e.biting-=dt;if(!e.biteApplied&&e.biting<.27){e.biteApplied=true;const target=e.biteTarget;if(target&&e.g.position.distanceTo(target.g.position)<range+.3&&!(target===player&&dodge>0))bite(e,target);}}
 else if(d<range&&e.attack<=0){e.biting=.55;e.biteApplied=false;e.biteTarget=victim;e.attack=1.25;message('Infected lunging. Space to evade!');}
 else if(d>range*.8)move(e,v.normalize(),e.speed,dt);
 animatePerson(e,d>range,t);
 }
 for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.rotation.y+=dt;if(p.position.distanceTo(player.g.position)<1.5){meds++;scene.remove(p);pickups.splice(i,1);message('Medkit recovered. Press E to heal both.');}}
 if(player.hp<=0||buddy.hp<=0)end();
 }
 for(let i=effects.length-1;i>=0;i--){if(!paused){effects[i].life-=dt;if(effects[i].corpse){effects[i].m.rotation.x=THREE.MathUtils.lerp(effects[i].m.rotation.x,-Math.PI/2,Math.min(1,dt*8));effects[i].m.position.y=.25;}if(effects[i].velocity){effects[i].velocity.y-=9.8*dt;effects[i].m.position.addScaledVector(effects[i].velocity,dt);effects[i].m.rotation.z+=dt*5;}}if(effects[i].life<=0){scene.remove(effects[i].m);effects[i].m.geometry?.dispose();effects.splice(i,1);}}
 const desired=player.g.position.clone().add(new THREE.Vector3(.65,3.15,6.2));camera.position.lerp(desired,1-Math.exp(-dt*5));camera.lookAt(player.g.position.x+.65,1.65,player.g.position.z-7);hitUI.style.opacity=hitTimer>0?'1':'0';el('blood').style.opacity=String(Math.min(.9,blood*.85+(player.hp<30?.22:0)));if(recoil>0){camera.position.y+=Math.sin(t*80)*recoil*.3;}updateHud();renderer.render(scene,camera);
});
camera.position.set(-.35,3.15,23.2);camera.lookAt(-.35,1.65,10);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

const loader=new GLTFLoader();
Promise.all(['rowan','mara','brute'].map(async type=>{try{const gltf=await loader.loadAsync(`/models/${type}.glb`);const root=gltf.scene.children[0];root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});characterModels.set(type,root);}catch(error){console.warn('Character asset unavailable, using built-in model',type,error);}})).then(()=>{
 for(const actor of [player,buddy,...enemies]){const replacement=detailedModel(actor.type);if(!replacement)continue;replacement.position.copy(actor.g.position);replacement.rotation.copy(actor.g.rotation);scene.remove(actor.g);scene.add(replacement);actor.g=replacement;Object.assign(actor,modelParts(replacement));}
});
