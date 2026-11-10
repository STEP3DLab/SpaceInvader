const tau=2*Math.PI;
const unit=v=>{let n=Math.hypot(...v)||1;return v.map(x=>x/n)};
const colorCache=new Map();
function color(hex){if(!colorCache.has(hex))colorCache.set(hex,[0,2,4].map(i=>parseInt(hex.slice(i+1,i+3),16)/255));return colorCache.get(hex)}
function normal(a,b,c){const x=b.map((v,i)=>v-a[i]),y=c.map((v,i)=>v-a[i]);return unit([x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0]])}
class Builder{
 constructor(){this.data=[]}
 tri(a,b,c,paint,normals){const n=normals||Array(3).fill(normal(a,b,c)),col=color(paint);[a,b,c].forEach((p,i)=>this.data.push(...p,...n[i],...col));}
 quad(a,b,c,d,paint){this.tri(a,b,c,paint);this.tri(a,c,d,paint);}
 ball(center,r,paint,sides=14,rings=9){const at=(a,b)=>{const q=[Math.cos(a)*Math.sin(b),Math.cos(b),Math.sin(a)*Math.sin(b)];return [q.map((v,i)=>center[i]+r[i]*v),unit(q.map((v,i)=>v/r[i]))]};
  for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){const a=tau*i/sides,b=Math.PI*j/rings,A=tau*(i+1)/sides,B=Math.PI*(j+1)/rings;
   const v=[at(a,b),at(A,b),at(A,B),at(a,B)];for(const idx of [[0,1,2],[0,2,3]])this.tri(...idx.map(k=>v[k][0]),paint,idx.map(k=>v[k][1]));}}
 box(x,y,z,w,h,d,paint){
  const p=(i,j,k)=>[x+i*w/2,y+j*h/2,z+k*d/2];
  for(const face of [[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]])this.quad(...face.map(f=>p(...f)),paint);}
 rim(profile,paints,sides=22){for(let j=1;j<profile.length;j++)for(let i=0;i<sides;i++){const a=tau*i/sides,b=tau*(i+1)/sides;const pt=(p,t)=>[Math.cos(t)*p[0],p[1],Math.sin(t)*p[0]];this.quad(pt(profile[j-1],a),pt(profile[j],a),pt(profile[j],b),pt(profile[j-1],b),paints[(j-1)%paints.length]);}}
 wing(side,pts,paint){const top=pts.map(([x,z,y=.05])=>[x*side,y,z]),low=top.map(([x,y,z])=>[x,y-.24,z]);for(let i=1;i<top.length-1;i++){this.tri(top[0],top[i],top[i+1],paint,Array(3).fill([0,1,0]));this.tri(low[i+1],low[i],low[0],'#322945',Array(3).fill([0,-1,0]));}for(let i=0;i<top.length;i++){let k=(i+1)%top.length;this.quad(top[i],low[i],low[k],top[k],'#594b72');}}
}
const globe=(b,x,y,z,r,c)=>b.ball([x,y,z],[r,r,r],c,9,6);
function pea(){const b=new Builder();b.rim([[.01,-.31],[.65,-.3],[1.19,-.12],[1.25,.02],[1.12,.17],[.65,.28],[.01,.28]],['#544c69','#776785','#c8eb70','#443a55','#91a44d','#849756']);
 b.ball([0,.39,-.06],[.6,.55,.57],'#91cf29');for(const s of [-1,1]){b.ball([s*.245,.48,-.55],[.18,.19,.105],'#fff8d6');b.ball([s*.205,.47,-.64],[.084,.108,.035],'#292039');b.box(s*.23,.655,-.58,.34,.065,.09,'#464032');}
 b.ball([0,.93,-.02],[.045,.22,.05],'#64992e');globe(b,.03,1.14,-.02,.112,'#cfff55');for(let i=0;i<9;i++){let a=i*tau/9;globe(b,Math.cos(a)*1.11,.04,Math.sin(a)*1.11,.073,'#baff4b');}
 return b;}
function pickle(){const b=new Builder();b.ball([0,.22,0],[.57,.47,1.32],'#789a38');for(const s of [-1,1]){b.wing(s,[[.25,.7],[1.45,.9],[1.49,.57],[.56,-.57]],'#9359d4');b.wing(s,[[.44,-.3],[.91,-.25],[.53,-.91]],'#ce8bef');b.ball([s*.53,.08,.58],[.21,.25,.52],'#514769');globe(b,s*.53,.11,.99,.16,'#e695ff');}
 b.ball([0,.48,-.63],[.52,.25,.32],'#4a315d');b.ball([0,.51,-.84],[.43,.17,.17],'#d48dff');for(let i=0;i<14;i++){let a=i*2.4;globe(b,Math.sin(a)*.45,.51+.09*Math.cos(a),.95-i*.11,.074,'#aaca52');}
 return b;}
function flagship(){const b=new Builder();b.rim([[.05,-.7],[.92,-.7],[1.65,-.43],[2.17,.05],[2.26,.23],[2.11,.36],[.01,.37]],['#9f6438','#ad7657','#c2a9a4','#ffbc78','#7c5b73','#d6b8a7'],28);
 const food=['#f98427','#e8ca8e','#8fd148','#dc8596','#709b39'];for(let i=0;i<33;i++){let a=i*2.4,r=.52+1.33*Math.sqrt((i+1)/34),x=Math.cos(a)*r,z=Math.sin(a)*r,h=.43+.17*Math.sin(i*2);if(i%3===0)globe(b,x,h,z,.22,food[i%5]);else b.box(x,h,z,.35,.27,.34,food[i%5]);}
 b.ball([0,.63,0],[.78,.61,.71],'#79bfdb');b.rim([[.8,.49],[.84,.59],[.78,.65]],['#e5b781','#b48361']);globe(b,0,1.32,0,.12,'#ffb54e');for(let i=0;i<12;i++){let a=tau*i/12;globe(b,2.02*Math.cos(a),-.09,2.02*Math.sin(a),.15,'#ffae53');}return b;}
function player(){const b=new Builder();b.ball([0,.04,0],[.43,.32,1.49],'#d9dce1',12,8);b.ball([0,.3,.06],[.30,.23,.59],'#8d93d5');b.ball([0,.4,.08],[.23,.14,.44],'#c2e0ef');
 for(const s of [-1,1]){b.wing(s,[[.17,.79,.08],[.47,.57,.11],[1.32,-.77,.01],[1.24,-1.08,.01],[.25,-.7,.08]],'#bab9cc');b.wing(s,[[.45,.29,.15],[.57,.18,.135],[1.19,-.81,.055],[1.03,-.76,.08]],'#bbfa48');b.ball([s*.46,-.015,-.65],[.23,.24,.59],'#504b69');b.ball([s*.46,-.017,-1.15],[.17,.17,.09],'#d3a5ff');b.box(s*.98,.09,-.40,.09,.1,.69,'#716286');}
 return b;}
export const MESHES=Object.fromEntries(Object.entries({pea:pea(),pickle:pickle(),flagship:flagship(),player:player()}).map(([key,b])=>[key,new Float32Array(b.data)]));
