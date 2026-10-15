// Swept collision prevents fast rounds skipping enemies between frames.
export function sphereHit(origin, direction, length, center, radius) {
 const x=center.x-origin.x,y=center.y-origin.y,z=center.z-origin.z;
 const along=x*direction.x+y*direction.y+z*direction.z;
 const disc=radius*radius-(x*x+y*y+z*z-along*along);
 if(disc<0)return null;
 const root=Math.sqrt(disc),hit=Math.max(0,along-root);
 return along+root>=0&&hit<=length?hit:null;
}
export function boxHit(origin,direction,length,min,max){
 let enter=0,leave=length;
 for(const axis of ['x','y','z']){
  if(Math.abs(direction[axis])<1e-8){if(origin[axis]<min[axis]||origin[axis]>max[axis])return null;continue;}
  const a=(min[axis]-origin[axis])/direction[axis],b=(max[axis]-origin[axis])/direction[axis];
  enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));if(enter>leave)return null;
 }
 return enter;
}
