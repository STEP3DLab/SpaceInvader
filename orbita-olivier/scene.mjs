import {MESHES} from './meshes.mjs';
import {clamp} from './flight.mjs';
const TAU=2*Math.PI,C=.94,S=Math.sqrt(1-C*C),CAM=8.8;
const $=id=>document.getElementById(id);
function rng(seed){return()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
const vertex=`
attribute vec3 pos,norm,col;
uniform vec3 origin;
uniform vec2 angles,screen;
uniform float size,zoom,flash;
varying vec3 tint;
void main(){
 float a=cos(angles.x),b=sin(angles.x),c=cos(angles.y),d=sin(angles.y);
 mat3 turn=mat3(a,0.,-b,0.,1.,0.,b,0.,a);
 mat3 bank=mat3(c,d,0.,-d,c,0.,0.,0.,1.);
 vec3 n=normalize(bank*turn*norm);
 vec3 world=origin+size*(bank*turn*pos);
 vec3 v=world-vec3(0.,8.8,0.);
 float depth=dot(v,vec3(0.,-0.34117444,0.94));
 float up=dot(v,vec3(0.,0.94,0.34117444));
 gl_Position=vec4(2.*zoom*v.x/screen.x,2.*zoom*up/screen.y+.20*depth,depth-2.,depth);
 float light=.36+.72*max(0.,dot(n,normalize(vec3(-.55,.9,-.5))));
 float shine=pow(max(0.,dot(n,normalize(vec3(-.32,.75,-.7)))),16.);
 float rim=max(0.,dot(n,normalize(vec3(.7,.4,.5))));
 tint=mix(col*light+vec3(.75,.80,.84)*shine*.52+vec3(.26,.13,.37)*rim,vec3(1.,.94,.84),flash);
}`;
const fragment='precision mediump float; varying vec3 tint; void main(){gl_FragColor=vec4(tint,1.);}';
class Hardware{
 constructor(canvas){
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power'});if(!gl)throw Error('No WebGL');
  this.gl=gl;const program=gl.createProgram();
  for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));gl.attachShader(program,shader);}
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  this.attrs=['pos','norm','col'].map(k=>gl.getAttribLocation(program,k));this.unif=Object.fromEntries(['origin','angles','screen','size','zoom','flash'].map(k=>[k,gl.getUniformLocation(program,k)]));
  this.buffers={};for(const [name,data] of Object.entries(MESHES)){let buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);this.buffers[name]=buf;}
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
 }
 start(sc){const g=this.gl;g.viewport(0,0,g.canvas.width,g.canvas.height);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.uniform2f(this.unif.screen,sc.w,sc.h);g.uniform1f(this.unif.zoom,sc.f);}
 draw(sc,o){const g=this.gl,u=this.unif;g.bindBuffer(g.ARRAY_BUFFER,this.buffers[o.kind]);this.attrs.forEach((attr,i)=>{g.enableVertexAttribArray(attr);g.vertexAttribPointer(attr,3,g.FLOAT,false,36,i*12);});g.uniform3f(u.origin,o.x*sc.lane,o.y,o.z);g.uniform2f(u.angles,o.angle,o.bank);g.uniform1f(u.size,o.size);g.uniform1f(u.flash,o.flash);g.drawArrays(g.TRIANGLES,0,MESHES[o.kind].length/9);}
}
// A cached projection of the same triangles supports devices without WebGL.
class Software{
 constructor(canvas){this.ctx=canvas.getContext('2d');this.cache=new Map();}
 start(sc){this.ctx.clearRect(0,0,sc.w,sc.h);}
 bake(kind,a,bank){
  const buff=document.createElement('canvas'),size=kind==='flagship'?230:146;buff.width=buff.height=size;
  const ctx=buff.getContext('2d'),scale=size/(kind==='flagship'?5.3:3.5);const mesh=MESHES[kind],faces=[],ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(bank),sb=Math.sin(bank);
  const rot=(x,y,z)=>{let u=ca*x+sa*z;return [cb*u-sb*y,sb*u+cb*y,-sa*x+ca*z]};
  for(let i=0;i<mesh.length;i+=27){let depth=0,br=0,rim=0,shine=0,points=[];
   for(let j=i;j<i+27;j+=9){const [x,y,z]=rot(mesh[j],mesh[j+1],mesh[j+2]),[nx,ny,nz]=rot(mesh[j+3],mesh[j+4],mesh[j+5]);
    points.push([size/2+x*scale,size*.55-(y*.90+z*.436)*scale]);depth+=z*.90-y*.436;
    br+=.36+.72*Math.max(0,-nx*.477+ny*.781-nz*.434);rim+=Math.max(0,.74*nx+.42*ny+.53*nz);shine+=Math.pow(Math.max(0,-.3*nx+.71*ny-.65*nz),16)*.4;}
   const rgb=[0,1,2].map(k=>Math.min(255,Math.round(255*(mesh[i+6+k]*br+[.26,.13,.37][k]*rim+shine)/3)));
   faces.push({points,depth,fill:'rgb('+rgb.join(',')+')'});
  }
  faces.sort((a,b)=>b.depth-a.depth);for(const f of faces){ctx.beginPath();f.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=ctx.strokeStyle=f.fill;ctx.lineWidth=.42;ctx.fill();ctx.stroke();}
  return {buff,span:size/scale};
 }
 draw(sc,o){
  const a=Math.round(o.angle/.2),b=Math.round(o.bank/.19),key=[o.kind,a,b].join('/');
  if(!this.cache.has(key))this.cache.set(key,this.bake(o.kind,a*.2,b*.19));
  const {buff,span}=this.cache.get(key),p=sc.project(o.x,o.y,o.z),d=p.s*span*o.size,ctx=this.ctx;ctx.drawImage(buff,p.x-d*.5,p.y-d*.55,d,d);
  if(o.flash>.2){ctx.fillStyle='#fff1aa';ctx.beginPath();ctx.arc(p.x,p.y,3,0,TAU);ctx.fill();}
 }
}
function glow(c,x,y,r,color){let g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}
function line(c,a,b,color,w){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineWidth=w;c.strokeStyle=color;c.stroke();}
export class Scene{
 constructor(){
  this.star=$('stars');this.model=$('models');this.fx=$('fx');this.bg=this.star.getContext('2d');this.front=this.fx.getContext('2d');this.particles=[];this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{this.renderer=new Hardware(this.model);}catch{this.useSoftware();}
  this.model.addEventListener('webglcontextlost',e=>{e.preventDefault();this.useSoftware();this.resize();});
  let r=rng(516);this.dust=Array.from({length:95},()=>({x:r()*2-1,y:r(),s:r(),rate:.4+r()}));this.resize();
 }
 useSoftware(){if(!this.model.getContext('2d')){const c=document.createElement('canvas');c.id='models';this.model.replaceWith(c);this.model=c;}this.renderer=new Software(this.model);}
 resize(){
  const w=this.fx.clientWidth,h=this.fx.clientHeight;if(!w||!h)return;this.w=w;this.h=h;this.f=h*.98;this.lane=w/h*.54;this.unit=clamp(this.lane*.65+.34,.66,1.08);
  const d=Math.min(devicePixelRatio||1,1.8);
  for(const c of [this.star,this.model,this.fx]){c.width=Math.round(w*d);c.height=Math.round(h*d);}
  [this.bg,this.front,this.renderer.ctx].filter(Boolean).forEach(c=>c.setTransform(d,0,0,d,0,0));
  this.backdrop=document.createElement('canvas');this.backdrop.width=w;this.backdrop.height=h;this.makeBackdrop();
 }
 project(x,y,z){let depth=(CAM-y)*S+z*C,s=this.f/depth;return {x:this.w*.5+x*this.lane*s,y:this.h*.40-((y-CAM)*C+z*S)*s,s};}
 makeBackdrop(){
  const c=this.backdrop.getContext('2d'),w=this.w,h=this.h,r=rng(6951);const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0c0c20');g.addColorStop(.42,'#28183c');g.addColorStop(.71,'#171024');g.addColorStop(1,'#0c0c17');c.fillStyle=g;c.fillRect(0,0,w,h);
  for(let i=0;i<65;i++){const x=r()*w,y=h*(.5-.35*x/w+.28*(r()-.5));glow(c,x,y,Math.max(10,w*(.02+.13*r())),i%2?'#7e51a817':'#8744c41d');}
  for(let i=0;i<w*h/630;i++){let x=r()*w,y=r()*h,rad=r();c.fillStyle=rad>.89?'#d7bfed':'#a39bb4';c.globalAlpha=.28+r()*.62;c.fillRect(x,y,rad>.89?1.7:1,rad>.89?1.7:1);}
  c.globalAlpha=1;const x=w*.82,y=h*.14,rr=Math.min(w*.115,h*.125);
  c.save();c.translate(x,y);c.rotate(-.28);c.strokeStyle='#8768ad66';c.lineWidth=rr*.095;c.beginPath();c.ellipse(0,0,rr*1.7,rr*.25,0,0,TAU);c.stroke();
  const pg=c.createRadialGradient(-rr*.44,-rr*.65,0,0,0,rr*1.35);pg.addColorStop(0,'#a982c0');pg.addColorStop(.25,'#765387');pg.addColorStop(.66,'#3a294e');pg.addColorStop(1,'#21182f');c.fillStyle=pg;c.beginPath();c.arc(0,0,rr,0,TAU);c.fill();c.save();c.clip();for(let k=-5;k<5;k++){c.strokeStyle=k%2?'#b08cc520':'#31203b36';c.lineWidth=rr*.08;c.beginPath();c.ellipse(0,k*rr*.23-rr*.11,rr*1.5,rr*.24,0,.12,Math.PI-.1);c.stroke();}c.restore();c.beginPath();c.ellipse(0,0,rr*1.7,rr*.25,0,0,Math.PI);c.strokeStyle='#c79ade8c';c.lineWidth=rr*.07;c.stroke();c.restore();
 }
 event(e){
  if(e.type!=='kill'&&e.type!=='hurt'&&e.type!=='hit')return;const count=e.type==='hit'?4:e.kind==='flagship'?90:23;const tones=e.type==='hurt'?['#83c6ff','#f2d3fe']:e.kind==='pickle'?['#ce91f4','#f7d8ff']:e.kind==='flagship'?['#ffb466','#fbe2ab']:['#beff53','#dfffa6'];
  for(let i=0;i<count;i++){const a=Math.random()*TAU,sp=1.1+Math.random()*6;this.particles.push({x:e.x,y:.3,z:e.z,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:Math.random()*3,life:.3+Math.random()*.62,t:0,col:tones[i%2]});}
 }
 draw(sim,dt){
  if(!this.w)return;const t=sim.time,w=this.w,h=this.h,c=this.bg,fx=this.front,p=sim.player;
  c.drawImage(this.backdrop,0,0,w,h);for(const d of this.dust){const phase=(d.y+t*.029*d.rate)%1,rad=(.1+phase*phase)*h*.87;const x=w*.5+d.x*rad*w/h,y=h*.15+phase*phase*h*.85;line(c,{x,y},{x:x+d.x*2*phase,y:y+phase*2},'#c5a9dc77',d.s+0.3);}
  for(let x=-13;x<=13;x+=2)line(c,this.project(x,-1.2,6),this.project(x,-1.2,48),'#9c6bd11f',1);
  for(let k=0;k<10;k++){const z=6+((k*4.2-t*2.5)%42+42)%42;line(c,this.project(-13,-1.2,z),this.project(13,-1.2,z),'#9c6bd11c',1);}
  for(const e of sim.enemies){const q=this.project(e.x,-.8,e.z),r=q.s*(e.kind==='flagship'?2.5:1.05)*this.unit;glow(c,q.x,q.y,r*1.35,e.kind==='flagship'?'#ff985955':e.kind==='pickle'?'#d193ff55':'#a6ff4040');}
  const objs=sim.enemies.map(e=>({kind:e.kind,x:e.x,y:e.y,z:e.z,angle:Math.sin(e.t*.88+e.phase)*.42,bank:e.roll,size:this.unit*(e.kind==='flagship'?1.47:1.18),flash:e.flash/.14*.8}));
  if(sim.inv<.01||Math.floor(t*10)%2===0){objs.push({kind:'player',x:p.x,y:0,z:p.z,angle:p.lean*.26,bank:-p.lean*.66,size:this.unit,flash:0});}
  const pp=this.project(p.x,-.09,p.z);for(const s of [-1,1]){const a=this.project(p.x+s*.44*this.unit/this.lane,0,p.z-1.11*this.unit);const b=this.project(p.x+s*.44*this.unit/this.lane,-.15,p.z-(1.5+.27*Math.sin(t*30))*this.unit);line(c,a,b,'#ba7dff',Math.max(2,pp.s*.19));glow(c,a.x,a.y,pp.s*.32,'#b687ff99');}
  this.renderer.start(this);objs.sort((a,b)=>b.z-a.z).forEach(o=>this.renderer.draw(this,o));
  fx.clearRect(0,0,w,h);fx.lineCap='round';
  for(const shot of sim.shots){const a=this.project(shot.x,0,shot.z),b=this.project(shot.x-shot.vx*.035,0,shot.z-.95);line(fx,a,b,'#9dfd3b6b',Math.max(3,a.s*.17));line(fx,a,b,'#ddff91',Math.max(1.4,a.s*.058));}
  for(const b of sim.bolts){const a=this.project(b.x,.07,b.z),tail=this.project(b.x-b.vx*.10,.07,b.z-b.vz*.10);line(fx,tail,a,'#f48bada8',Math.max(2,a.s*.16));glow(fx,a.x,a.y,Math.max(4,a.s*.41),'#ff795dbb');fx.fillStyle='#ffe1bd';fx.beginPath();fx.arc(a.x,a.y,Math.max(2,a.s*.12),0,TAU);fx.fill();}
  if(sim.pulseTime>0){const f=1-sim.pulseTime/.72;fx.save();fx.strokeStyle='rgba(194,255,91,'+(1-f)*.9+')';fx.lineWidth=2+(1-f)*3;fx.beginPath();fx.ellipse(pp.x,pp.y,Math.max(1,f*w*1.33),Math.max(1,f*h*1.2),0,0,TAU);fx.stroke();fx.restore();}
  for(const v of this.particles){v.t+=dt;v.x+=v.vx*dt;v.y+=v.vy*dt;v.z+=v.vz*dt;v.vy-=3.4*dt;const q=this.project(v.x,v.y,v.z);fx.globalAlpha=clamp(1-v.t/v.life,0,1);fx.fillStyle=v.col;const m=clamp(q.s*.094,1.2,4);fx.fillRect(q.x,q.y,m,m);}
  fx.globalAlpha=1;this.particles=this.particles.filter(v=>v.t<v.life);
  if(sim.inv>1.28&&sim.lives<3){fx.strokeStyle='rgba(216,156,255,'+((sim.inv-1.28)*1.7)+')';fx.lineWidth=5;fx.strokeRect(2,2,w-4,h-4);}
 }
}
