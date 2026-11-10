// Positions are in one shared flight plane. Positive Z points into the arena.
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const FLEET=[
 {id:'pea',name:'Горошек',role:'Разведчик',points:100,hp:1,detail:'Летит широкой дугой, потом меняет курс. Перехватывай разведчика в тот момент, когда он разворачивается.'},
 {id:'pickle',name:'Огурец',role:'Перехватчик',points:250,hp:3,detail:'Заходит зигзагом и выпускает парные залпы. Держи его на линии огня и смещайся сразу после выстрела.'},
 {id:'flagship',name:'Салатница',role:'Флагман',points:2000,hp:42,detail:'Командует пятой волной и стреляет веером. Ищи просветы между снарядами, а импульс прибереги для плотного залпа.'}
];
const WAVES=[['pea','pea','pea','pea','pea'],['pea','pickle','pea','pea','pickle','pea'],['pickle','pea','pickle','pea','pickle','pea','pea'],['pickle','pea','pickle','pickle','pea','pickle','pea','pickle'],['flagship']];
export class Flight{
 constructor(random=Math.random){this.random=random;this.time=0;this.wave=0;this.score=0;this.lives=3;this.inv=1;this.cool=0;this.pulseTime=0;this.player={x:0,z:10.5,lean:0};this.enemies=[];this.shots=[];this.bolts=[];this.events=[];this.phase='play';this.id=0;this.nextWave();}
 nextWave(){this.wave++;this.wait=.35;this.spawned=0;this.between=0;this.announced=false;this.events.push({type:'wave',n:this.wave});}
 spawn(kind){
  const n=this.spawned,side=n%2===0?1:-1;const boss=kind==='flagship';
  this.enemies.push({id:this.id++,kind,hp:FLEET.find(f=>f.id===kind).hp,t:0,x:boss?0:side*8,y:0,z:49,phase:(n*1.73+this.wave*.61),home:boss?0:side*(1.8+(n*2.19)%4.8),depth:boss?28:22+(n%3)*4,roll:0,flash:0,shot:boss?3:2.4+this.random()*2});
 }
 volley(e){
  const boss=e.kind==='flagship',pick=e.kind==='pickle',vel=boss?7:6+.38*this.wave;
  let dx=this.player.x-e.x,dz=Math.min(-3,this.player.z-e.z);const ang=Math.atan2(dx,-dz);
  const angles=boss?[-.56,-.28,0,.28,.56]:pick?[-.075,.075]:[0];
  for(const a of angles)this.bolts.push({x:e.x,z:e.z-.8,vx:Math.sin(ang+a)*vel,vz:-Math.cos(ang+a)*vel,boss});
 }
 damage(e,power){
  if(e.hp<=0)return;e.hp-=power;e.flash=.14;
  if(e.hp<=0){let points=FLEET.find(f=>f.id===e.kind).points;this.score+=points;this.events.push({type:'kill',x:e.x,z:e.z,kind:e.kind,points});}
  else this.events.push({type:'hit',x:e.x,z:e.z,kind:e.kind});
 }
 pulse(){
  if(this.phase!=='play'||this.cool>0)return false;
  this.cool=8;this.pulseTime=.72;this.bolts.length=0;this.events.push({type:'pulse',x:this.player.x,z:this.player.z});
  for(const e of this.enemies)if(e.z<45)this.damage(e,e.kind==='flagship'?5:2);
  return true;
 }
 step(dt,input={}){
  if(this.phase!=='play')return;
  this.time+=dt;this.cool=Math.max(0,this.cool-dt);this.pulseTime=Math.max(0,this.pulseTime-dt);this.inv=Math.max(0,this.inv-dt);
  const p=this.player,lastX=p.x,ax=input.dx||0,az=input.dz||0;
  if(input.target){const f=1-Math.exp(-13*dt);p.x+=(input.target.x-p.x)*f;p.z+=(input.target.z-p.z)*f;}
  else {const len=Math.max(1,Math.hypot(ax,az));p.x+=ax*dt*12/len;p.z+=az*dt*8/len;}
  p.x=clamp(p.x,-8.4,8.4);p.z=clamp(p.z,9.6,16);p.lean+=(clamp((p.x-lastX)/dt/17,-.65,.65)-p.lean)*(1-Math.exp(-10*dt));
  this.wait-=dt;const roster=WAVES[this.wave-1];if(this.spawned<roster.length&&this.wait<=0){this.spawn(roster[this.spawned]);this.spawned++;this.wait=1.05-this.wave*.06;}
  for(const e of this.enemies){
   if(e.hp<=0)continue;e.t+=dt;e.flash=Math.max(0,e.flash-dt);
   const u=e.t,prev=e.x,boss=e.kind==='flagship',pick=e.kind==='pickle';
   const pattern= boss? Math.sin(u*.67)*5.3 : pick? (2/Math.PI)*Math.asin(Math.sin(u*1.48+e.phase))*4.4 : Math.sin(u*1.13+e.phase)*3.7;
   const gain=1-Math.exp(-dt*(boss?1.65:2.45));e.x+=(clamp(e.home+pattern,-8.5,8.5)-e.x)*gain;
   const approach=(boss?30:26)*Math.exp(-u*1.1);
   e.z=e.depth+approach+Math.sin(u*(boss?.81:1.18)+e.phase)*(pick?4.1:2.15);e.y=Math.sin(u*2+e.phase)*.23;
   e.roll=clamp((e.x-prev)/dt*.055,-.38,.38);e.shot-=dt;
   if(e.shot<=0&&e.z<36){this.volley(e);e.shot=(boss?1.24:pick?2.65:3.55)+this.random()*.9;}
  }
  this.fire=(this.fire||0)-dt;
  if(this.fire<=0){this.fire=.185;let nearest=null,best=2.0;
   for(const e of this.enemies){const gap=Math.abs(e.x-p.x);if(e.hp>0&&gap<best&&e.z>p.z){nearest=e;best=gap;}}
   const slope=nearest?clamp((nearest.x-p.x)/Math.max(6,nearest.z-p.z),-.14,.14):0;
   this.shots.push({x:p.x,z:p.z+1,vx:slope*34,vz:34});this.events.push({type:'fire'});
  }
  for(const s of this.shots){const old=s.z;s.z+=s.vz*dt;s.x+=s.vx*dt;
   for(const e of this.enemies){const radius=e.kind==='flagship'?2.45:e.kind==='pickle'?.98:.88;
    if(e.hp>0&&Math.abs(s.x-e.x)<radius&&s.z>=e.z-radius&&old<=e.z+radius){this.damage(e,1);s.dead=true;break;}}
  }
  for(const b of this.bolts){b.z+=b.vz*dt;b.x+=b.vx*dt;if(this.inv<=0&&Math.abs(b.z-p.z)<.78&&Math.abs(b.x-p.x)<.65){b.dead=true;this.lives--;this.inv=1.65;this.events.push({type:'hurt',x:p.x,z:p.z});if(!this.lives){this.phase='lost';this.events.push({type:'end'});break;}}}
  this.shots=this.shots.filter(s=>!s.dead&&s.z<58);this.bolts=this.bolts.filter(s=>!s.dead&&s.z>3&&Math.abs(s.x)<18);this.enemies=this.enemies.filter(e=>e.hp>0);
  if(this.phase==='play'&&this.spawned===roster.length&&!this.enemies.length){if(!this.announced){this.bolts.length=0;this.announced=true;this.between=this.wave===5?.68:1.45;}
   this.between-=dt;if(this.between<=0){if(this.wave===5){this.score+=this.lives*300;this.phase='won';this.events.push({type:'end'});}else this.nextWave();}}
 }
}
