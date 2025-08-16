// rotating.js
// rotating.js
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function showOverlay(container, msg) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute; inset:0; display:grid; place-items:center;
    background:rgba(0,0,0,.6); color:#fff; font:600 14px/1.4 system-ui;
    text-align:center; padding:16px; z-index:10;
  `;
  el.textContent = msg;
  container.appendChild(el);
}

export function initRotatingOBJ(
  container,
  {
    objUrl,
    mtlUrl = null,
    bgColor = null,        // null => transparent
    autoRotate = true,
    rotationSpeed = 1.2,   // rad/sec
    targetSize = 140,
    exposure = 1.0
  } = {}
) {
  if (!container) throw new Error('Missing container');
  if (!objUrl) throw new Error('Missing objUrl');

  // — Renderer —
  const alpha = bgColor === null;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  if (!alpha) renderer.setClearColor(bgColor, 1);
  container.appendChild(renderer.domElement);

  // — Scene & Camera —
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 5000);
  camera.position.set(0, 0, targetSize * 2.2);

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(150, 200, 100);
  scene.add(dir);

  // Fallback primitive so you see something immediately
  let fallback = new THREE.Mesh(
    new THREE.IcosahedronGeometry(30, 1),
    new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0.35 })
  );
  scene.add(fallback);

  // — Loaders —
  const objLoader = new OBJLoader();
  const mtlLoader = new MTLLoader();

  let model = null;

  function addAndFit(root) {
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);

    root.position.sub(center);                    // center at origin
    const scale = (targetSize / Math.max(size.x, size.y, size.z || 1));
    root.scale.setScalar(scale);

    scene.add(root);
    model = root;
  }

  function loadOBJ() {
    objLoader.load(
      objUrl,
      (obj) => {
        if (fallback) { scene.remove(fallback); fallback.geometry.dispose(); fallback = null; }
        obj.traverse((o) => {
          if (o.isMesh && !o.material) {
            o.material = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.1, roughness: 0.7 });
          }
        });
        addAndFit(obj);
      },
      undefined,
      (err) => {
        console.error('[rotating] OBJ load error:', err);
        showOverlay(container, 'OBJ failed to load.\nOpen DevTools → Console/Network.');
      }
    );
  }

  if (mtlUrl) {
    mtlLoader.load(
      mtlUrl,
      (mtl) => { mtl.preload(); objLoader.setMaterials(mtl); loadOBJ(); },
      undefined,
      (err) => { console.warn('[rotating] MTL load failed, continuing without:', err); loadOBJ(); }
    );
  } else {
    loadOBJ();
  }

  // — Resize —
  const onResize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(container);
  window.addEventListener('orientationchange', onResize);

  // — Animate —
  let raf = 0;
  const clock = new THREE.Clock();
  const animate = () => {
    raf = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    if (autoRotate && model) model.rotation.y += rotationSpeed * dt;
    else if (fallback) {
      fallback.rotation.y += rotationSpeed * dt;
      fallback.rotation.x += (rotationSpeed * 0.5) * dt;
    }
    renderer.render(scene, camera);
  };
  animate();

  // — Cleanup —
  function destroy() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener('orientationchange', onResize);
    if (model) model.traverse((o) => {
      if (o.isMesh) {
        o.geometry?.dispose?.();
        if (o.material?.isMaterial) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose?.();
        } else if (Array.isArray(o.material)) {
          o.material.forEach((m) => { if (m?.map) m.map.dispose(); m?.dispose?.(); });
        }
      }
    });
    if (fallback) { fallback.geometry.dispose(); fallback = null; }
    pmrem.dispose?.();
    renderer.dispose();
    container.innerHTML = '';
  }

  return { destroy, scene, camera, renderer };
}
