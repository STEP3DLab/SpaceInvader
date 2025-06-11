import * as THREE from 'https://cdn.skypack.dev/three@0.160.0';
import { STLLoader } from 'https://cdn.skypack.dev/three@0.160.0/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { WEBGL } from 'https://cdn.skypack.dev/three@0.160.0/examples/jsm/WebGL.js';

const container = document.getElementById('glHeader');
if (!container) return;

if (!WEBGL.isWebGLAvailable()) {
  const img = document.createElement('img');
  img.src = 'assets/img/model.png';
  img.alt = '3D model fallback image';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  container.appendChild(img);
} else {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 40);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.015 / (Math.PI * 2) * 60; // convert rad/frame to deg/sec approx

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 10, 10);
  scene.add(light);

  const loader = new STLLoader();
  loader.load('webgl-cover/model.stl', geometry => {
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    animate();
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  container.addEventListener('pointermove', e => {
    const x = (e.clientX / container.clientWidth - 0.5) * 2;
    const y = (e.clientY / container.clientHeight - 0.5) * 2;
    camera.rotation.x = y * 0.3;
    camera.rotation.y = -x * 0.3;
  });

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', ev => {
      if (ev.beta != null && ev.gamma != null) {
        camera.rotation.x = THREE.MathUtils.degToRad(ev.beta) / 60;
        camera.rotation.y = THREE.MathUtils.degToRad(ev.gamma) / 60;
      }
    });
  }
}
