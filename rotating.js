// rotating.js
// Uses the Three.js STL example pattern: https://threejs.org/examples/webgl_loader_stl.html
// Exported as a function per your preference.

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/STLLoader.js';

export function initRotatingSTL(container, {
  modelUrl,
  background = 'transparent',      // or a hex like 0x0b1220
  color = 0x3399ff,
  metalness = 0.6,
  roughness = 0.25,
  autoRotate = true,
  rotationSpeed = 0.5,             // deg/sec if autoRotate
  initialCamera = { x: 160, y: 120, z: 260 },
} = {}) {
  if (!container) throw new Error('Missing container element');
  if (!modelUrl) throw new Error('You must pass modelUrl to initRotatingSTL');

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: background === 'transparent' });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  if (background !== 'transparent') renderer.setClearColor(background, 1);
  container.appendChild(renderer.domElement);

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
  );
  camera.position.set(initialCamera.x, initialCamera.y, initialCamera.z);

  // Lights (like the example: hemi + dir for nice highlights)
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
  hemi.position.set(0, 200, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(100, 200, 100);
  scene.add(dir);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0, 0);
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = rotationSpeed; // in deg/sec

  // Ground plane (subtle) – optional
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0x111111, depthWrite: false })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.01;
  plane.receiveShadow = false;
  plane.visible = false; // turn on if you want a ground
  scene.add(plane);

  // Load STL
  const loader = new STLLoader();
  let mesh = null;

  loader.load(
    modelUrl,
    (geometry) => {
      // Normalize size & center
      geometry.computeBoundingBox();
      const bb = geometry.boundingBox;
      const size = new THREE.Vector3().subVectors(bb.max, bb.min);
      const center = new THREE.Vector3().addVectors(bb.min, bb.max).multiplyScalar(0.5);

      geometry.translate(-center.x, -center.y, -center.z);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 100 / maxDim; // fit roughly into view
      geometry.scale(scale, scale, scale);

      const material = new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness,
      });

      mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      scene.add(mesh);

      // Frame the object
      controls.target.set(0, 0, 0);
      controls.update();
    },
    undefined,
    (err) => {
      console.error('[rotating.js] STL load error:', err);
    }
  );

  // Resize (use ResizeObserver for container-based layouts)
  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(container);
  window.addEventListener('orientationchange', onResize);

  // Animate
  let rafId = 0;
  const clock = new THREE.Clock();

  const animate = () => {
    rafId = requestAnimationFrame(animate);
    const dt = clock.getDelta();

    // If you prefer manual rotation instead of controls.autoRotate:
    // if (mesh && autoRotate) mesh.rotation.y += dt * rotationSpeed * (Math.PI / 180);

    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  // Cleanup
  function destroy() {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    window.removeEventListener('orientationchange', onResize);
    controls.dispose();
    renderer.dispose();
    if (mesh) mesh.geometry.dispose();
    container.innerHTML = '';
  }

  return { destroy, scene, camera, renderer, controls };
}
