// theme toggle
const themeBtn=document.getElementById('theme-toggle');
if(themeBtn){
  themeBtn.addEventListener('click',()=>{
    const isDark=document.documentElement.getAttribute('data-theme')==='dark';
    document.documentElement.setAttribute('data-theme',isDark?'light':'dark');
    localStorage.setItem('theme',isDark?'light':'dark');
  });
}
if(localStorage.getItem('theme')==='dark'){
  document.documentElement.setAttribute('data-theme','dark');
}
// back to top
const backBtn=document.getElementById('back-to-top');
window.addEventListener('scroll',()=>{
  if(window.scrollY>300){backBtn.style.display='block';}else{backBtn.style.display='none';}
});
backBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

// translations
let currentLang='ru';
const translations={
  en:{tagline:'Making the future tangible: from 3D idea to prototype',nav:['About','Skills','Portfolio','Contacts'],back:'Back to top'},
  ru:{tagline:'Делаю будущее осязаемым: от 3D-идеи до работающего прототипа',nav:['Обо мне','Навыки','Портфолио','Контакты'],back:'Наверх'}
};
const langBtn=document.getElementById('lang-switch');
function applyLang(){
  const t=translations[currentLang];
  document.querySelector('.tagline').textContent=t.tagline;
  document.querySelectorAll('#nav a').forEach((a,i)=>a.textContent=t.nav[i]);
  backBtn.textContent=t.back;
  langBtn.textContent=currentLang==='ru'?'EN':'RU';
  document.documentElement.lang=currentLang;
}
langBtn.addEventListener('click',()=>{currentLang=currentLang==='ru'?'en':'ru';applyLang();});
applyLang();

// three.js cube
if(window.THREE){
  const container=document.getElementById('cube-container');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(45,1,0.1,1000);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(window.devicePixelRatio);
  const size=container.clientWidth;
  renderer.setSize(size,size);
  container.innerHTML='';
  container.appendChild(renderer.domElement);
  camera.position.z=3;

  const loader=new THREE.TextureLoader();
  const textures=[
    'Avatar_Ganshin.jpg',
    'https://images.unsplash.com/photo-1606851092212-6fb5d3642a5b?auto=format&w=512&h=512&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&w=512&h=512&q=80',
    'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&w=512&h=512&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&w=512&h=512&q=80',
    'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&w=512&h=512&q=80'
  ];
  const materials=textures.map(src=>new THREE.MeshPhongMaterial({map:loader.load(src)}));
  const cube=new THREE.Mesh(new THREE.BoxGeometry(),materials);
  scene.add(new THREE.AmbientLight(0xffffff,0.8));
  const light=new THREE.DirectionalLight(0xffffff,0.5);
  light.position.set(3,3,3);
  scene.add(light);
  scene.add(cube);

  function resize(){
    const s=container.clientWidth;
    renderer.setSize(s,s);
    camera.aspect=1;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize',resize);

  function animate(){
    requestAnimationFrame(animate);
    cube.rotation.x+=0.01;
    cube.rotation.y+=0.01;
    renderer.render(scene,camera);
  }
  animate();
}
