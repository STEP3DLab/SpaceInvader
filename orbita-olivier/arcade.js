import {Flight,FLEET,clamp} from './flight.mjs';
import {Scene} from './scene.mjs';
const $=id=>document.getElementById(id);
const svg=name=>'<svg aria-hidden="true"><use href="#'+name+'"/></svg>';
const scoreText=n=>String(n).padStart(6,'0'), two=n=>String(n).padStart(2,'0');
const store={read(key,otherwise){try{return JSON.parse(localStorage.getItem('orbita-olivier-'+key))??otherwise;}catch{return otherwise;}},write(key,v){try{localStorage.setItem('orbita-olivier-'+key,JSON.stringify(v));}catch{}}};
let runs=store.read('runs',[]);if(!Array.isArray(runs))runs=[];
runs=runs.filter(r=>r&&Number.isFinite(r.score)&&Number.isFinite(r.wave)&&Number.isFinite(r.date)).sort((a,b)=>b.score-a.score).slice(0,7);
let sound=store.read('sound',true)!==false,audio,mode='lobby',sim,scene,raf=0,last=0,callUntil=0,saved=false,dialogType='',drag=null,acc=0,beat=0;
const keys=new Set(),dialog=$('dialog');
let lastReadouts='';
function audioReady(){if(!sound)return;try{if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(AC)audio=new AC();}if(audio?.state==='suspended')audio.resume().catch(()=>{});}catch{}}
function tone(f,end,len,type='sine',volume=.035,delay=0){if(!sound||!audio||audio.state!=='running')return;const t=audio.currentTime+delay,osc=audio.createOscillator(),gain=audio.createGain();osc.type=type;osc.frequency.setValueAtTime(f,t);osc.frequency.exponentialRampToValueAtTime(Math.max(16,end),t+len);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+len);osc.connect(gain).connect(audio.destination);osc.start(t);osc.stop(t+len+.02);}
function soundUI(){$('sound').innerHTML=svg(sound?'volume':'mute')+'<span>Звук '+(sound?'вкл.':'выкл.')+'</span>';$('sound').ariaPressed=String(sound);$('sound').setAttribute('aria-label',sound?'Выключить звук':'Включить звук');}
function toggleSound(){sound=!sound;store.write('sound',sound);soundUI();if(sound){audioReady();tone(380,550,.12);}else if(audio?.state==='running')audio.suspend().catch(()=>{});}
function showDialog(type,kicker,title,html){dialogType=type;$('dialogKicker').textContent=kicker;$('dialogTitle').textContent=title;$('dialogContent').innerHTML=html;if(!dialog.open)dialog.showModal();}
const button=(id,label,cls='primary')=>'<button class="'+cls+'" data-action="'+id+'">'+label+'</button>';
const actions=(...b)=>'<div class="dialog-actions">'+b.join('')+'</div>';
const row=(name,val)=>'<div class="dialog-row"><span>'+name+'</span><b>'+val+'</b></div>';
function help(){showDialog('help','ИНСТРУКТАЖ','Как играть','<p>Держи захватчиков перед носом корабля. Пушки стреляют автоматически. Уничтожь весь флот, чтобы перейти к следующей волне.</p>'+row('Полёт на компьютере','WASD / стрелки')+row('Полёт на телефоне','Веди пальцем')+row('Защитный импульс','Пробел / ⚡')+row('Пауза','P / Esc / Ⅱ')+'<p>Импульс убирает вражеские снаряды и наносит урон кораблям. Перезарядка занимает 8 секунд.</p>'+actions(button('start',svg('play')+'Начать игру')));}
function records(){const data=runs.length?runs.map((v,i)=>'<div class="dialog-row"><span>'+two(i+1)+' · '+new Date(v.date).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'})+' · Волна '+v.wave+'</span><span class="record-score">'+scoreText(v.score)+'</span></div>').join(''):'<p>Здесь появится результат первого завершённого вылета.</p>';showDialog('records','БОРТОВОЙ ЖУРНАЛ','Личные рекорды',data+'<p>Семь лучших вылетов на этом устройстве.</p>'+actions(button('close','Закрыть','secondary')));}
function enemy(i){const f=FLEET[i];showDialog('enemy','АТЛАС / '+f.role.toUpperCase(),f.name,'<img class="enemy-portrait" alt="" src="assets/'+f.id+'.webp"><p>'+f.detail+'</p>'+row('Прочность',f.hp+' ОЗ')+row('За уничтожение',f.points.toLocaleString('ru-RU')+' очков')+actions(button('close','К атласу','secondary')));}
function readouts(){const s=mode==='lobby'?null:sim;const boss=s?.enemies.find(e=>e.kind==='flagship');
 const signature=[s?.wave,s?.score,s?.lives,Math.ceil(s?.cool||0),boss?.hp,runs[0]?.score].join('/');
 if(signature===lastReadouts)return;lastReadouts=signature;
 $('statWave').innerHTML=two(s?.wave||1)+' <small>/ 05</small>';$('statBest').textContent=scoreText(runs[0]?.score||0);const life=s?.lives??3;[...$('shieldPips').children].forEach((p,i)=>p.classList.toggle('off',i>=life));$('shieldPips').setAttribute('aria-label',life+' из 3');if(!s)return;
 $('flightScore').textContent=scoreText(s.score);$('hudWave').textContent=two(s.wave)+'/05';const cool=s.cool>0;$('pulse').disabled=cool;$('pulse').querySelector('span').textContent=cool?Math.ceil(s.cool)+' с':'Импульс';$('bossBar').hidden=!boss;if(boss)$('bossBar').querySelector('b').style.width=100*boss.hp/FLEET[2].hp+'%';}
function info(txt,len=1.65){$('callout').textContent=txt;$('callout').classList.add('on');callUntil=sim.time+len;}
function event(e){scene.event(e);
 switch(e.type){case 'wave':info(e.n===5?'ФЛАГМАН НА ОРБИТЕ':'ВОЛНА '+two(e.n)+' / 05');tone(262,392,.13,'sine',.045);tone(392,523,.17,'sine',.04,.15);break;
 case 'fire':tone(680,160,.067,'triangle',.016);break;
 case 'hurt':tone(128,43,.30,'sawtooth',.065);info('ПОПАДАНИЕ',.85);break;
 case 'kill':tone(e.kind==='flagship'?85:195,33,e.kind==='flagship'?.52:.17,'sawtooth',.034);break;
 case 'pulse':tone(125,760,.32,'sine',.07);break;}
}
function end(){
 mode='result';keys.clear();drag=null;
 if(!saved){runs.push({score:sim.score,wave:sim.wave,date:Date.now()});runs.sort((a,b)=>b.score-a.score||b.date-a.date);runs=runs.slice(0,7);store.write('runs',runs);saved=true;}
 const won=sim.phase==='won';showDialog('result','ИТОГ ВЫЛЕТА',won?'Орбита свободна!':'Щит исчерпан','<p>'+(won?'Флагман-салатница повержен. За каждый уцелевший щит начислено ещё 300 очков.':'Салатный флот прорвал защиту. Можно сразу вернуться на орбиту.')+'</p><div class="final-num">'+scoreText(sim.score)+'</div>'+row('Волна',two(sim.wave)+' / 05')+row('Личный рекорд',scoreText(runs[0]?.score||0))+actions(button('start','Ещё вылет'),button('lobby','В ангар','secondary')));readouts();
}
function frame(now){
 if(mode!=='play')return;const dt=Math.min((now-last)/1000,.065);last=now;acc+=Math.max(0,dt);
 const input={dx:+(keys.has('ArrowRight')||keys.has('KeyD'))-+(keys.has('ArrowLeft')||keys.has('KeyA')),dz:+(keys.has('ArrowUp')||keys.has('KeyW'))-+(keys.has('ArrowDown')||keys.has('KeyS')),target:drag?.target};
 while(acc>=1/60&&sim.phase==='play'){sim.step(1/60,input);acc-=1/60;}
 for(const e of sim.events.splice(0))event(e);
 if(sound&&sim.time>beat){beat=sim.time+.48;const seq=[55,55,65.41,82.41,55,73.42,65.41,49];const note=seq[Math.floor(sim.time/.48)%seq.length];tone(note,note,.27,'triangle',.029);}
 if(sim.time>callUntil)$('callout').classList.remove('on');scene.draw(sim,dt);readouts();
 if(sim.phase!=='play'){end();return;}raf=requestAnimationFrame(frame);
}
function noDialog(){dialogType='';if(dialog.open)dialog.close();}
function start(){
 noDialog();cancelAnimationFrame(raf);keys.clear();drag=null;mode='play';saved=false;sim=new Flight();beat=0;acc=0;$('intro').hidden=true;$('battle').hidden=false;$('stage').classList.add('playing');audioReady();if(!scene)scene=new Scene();else scene.resize();scene.particles.length=0;readouts();$('fx').focus({preventScroll:true});if(innerWidth<=690||innerHeight<=520)$('stage').scrollIntoView({block:'start',behavior:'instant'});last=performance.now();raf=requestAnimationFrame(frame);
}
function pause(){if(mode!=='play')return;mode='pause';cancelAnimationFrame(raf);keys.clear();drag=null;showDialog('pause','БОРТОВОЙ КОМПЬЮТЕР','Пауза',row('Волна',two(sim.wave)+' / 05')+row('Счёт',scoreText(sim.score))+actions(button('resume',svg('play')+'Продолжить'),button('lobby','В ангар','secondary')));}
function resume(){if(mode!=='pause')return;noDialog();mode='play';audioReady();last=performance.now();acc=0;$('fx').focus({preventScroll:true});raf=requestAnimationFrame(frame);}
function lobby(){noDialog();mode='lobby';cancelAnimationFrame(raf);keys.clear();drag=null;$('stage').classList.remove('playing');$('intro').hidden=false;$('battle').hidden=true;$('callout').classList.remove('on');readouts();$('launch').focus({preventScroll:true});}
function dismiss(){if(dialogType==='pause')resume();else if(dialogType==='result')lobby();else noDialog();}
$('launch').onclick=start;$('help').onclick=help;$('sound').onclick=toggleSound;$('pauseGame').onclick=pause;$('pulse').onclick=()=>{if(mode==='play')sim.pulse()};$('closeDialog').onclick=dismiss;
$('recordsNav').onclick=()=>{if(mode==='play')pause();if(mode==='pause'){showDialog('pause','БОРТОВОЙ ЖУРНАЛ','Личные рекорды',(runs.length?runs.map((v,i)=>row(two(i+1)+' · Волна '+v.wave,scoreText(v.score))).join(''):'<p>Завершённые вылеты появятся здесь.</p>')+actions(button('resume','Вернуться в игру')));}else records();};
document.querySelector('a[href="#atlas"]').addEventListener('click',()=>{if(mode==='play')pause();});
document.querySelectorAll('[data-enemy]').forEach(b=>b.onclick=()=>{if(mode==='play'){pause();return;}enemy(Number(b.dataset.enemy));});
$('dialogContent').onclick=e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(a==='start')start();if(a==='resume')resume();if(a==='lobby')lobby();if(a==='close')dismiss();};
dialog.addEventListener('cancel',e=>{e.preventDefault();dismiss()});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss();}});
function key(e,down){if(down&&e.repeat&&['Space','KeyP','Escape','KeyM'].includes(e.code)){e.preventDefault();return;}
 if(down&&e.code==='KeyM'&&!dialog.open){toggleSound();return;}
 if(down&&e.code==='KeyP'&&mode==='pause'){e.preventDefault();resume();return;}
 if(mode!=='play'||dialog.open)return;
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD','Space','Escape','KeyP'].includes(e.code))return;
 e.preventDefault();if(!down){keys.delete(e.code);return;}if(['Escape','KeyP'].includes(e.code)){pause();return;}if(e.code==='Space'){sim.pulse();return;}keys.add(e.code);}
window.addEventListener('keydown',e=>key(e,true));window.addEventListener('keyup',e=>key(e,false));
const surface=$('fx');
surface.addEventListener('pointerdown',e=>{if(mode!=='play'||drag||e.button!==0)return;
 surface.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,target:{x:sim.player.x,z:sim.player.z}};});
surface.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const width=surface.clientWidth,height=surface.clientHeight;
 drag.target.x=clamp(drag.target.x+(e.clientX-drag.x)*23/width,-8.4,8.4);drag.target.z=clamp(drag.target.z-(e.clientY-drag.y)*13/height,9.6,16);drag.x=e.clientX;drag.y=e.clientY;});
for(const name of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(name,e=>{if(drag?.id===e.pointerId)drag=null;});
window.addEventListener('blur',()=>{if(mode==='play')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')pause();});
new ResizeObserver(()=>{if(scene&&mode!=='lobby'){scene.resize();scene.draw(sim,0);}}).observe($('stage'));
soundUI();readouts();
