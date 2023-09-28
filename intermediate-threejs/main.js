// import './style.css';
import './tailwind.css';
import gsap from 'gsap';
import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import countries from './countries.json';

const canvasContainer = document.getElementById('canvas-container');
const radiusEarth = 5;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  canvasContainer.offsetWidth / canvasContainer.offsetHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector('canvas'),
});

renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
renderer.setPixelRatio(devicePixelRatio);

//create a sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load('/globe.jpeg'),
      },
    },
  })
);
scene.add(sphere);
sphere.rotation.y = -Math.PI / 2;

//create atmosphere
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(radiusEarth, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
);
atmosphere.scale.set(1.12, 1.12, 1.12);
scene.add(atmosphere);

//create a sphere
// const sphere = new THREE.Mesh(
//   new THREE.SphereGeometry(5, 50, 50),
//   new THREE.MeshBasicMaterial({
//     map: new THREE.TextureLoader().load('/globe.jpeg'),
//   })
// );

const group = new THREE.Group();
group.add(sphere);
scene.add(group);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});

const starVertices = [];
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = -Math.random() * 3000;

  starVertices.push(x, y, z);
}

starGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starVertices, 3)
);

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

camera.position.z = 15;
// new OrbitControls(camera, renderer.domElement);

function createBoxes(countries) {
  countries.forEach((country) => {
    const scale = country.population / 1000000000;
    const zScale = 0.8 * scale;

    const lat = country.latlng[0];
    const lng = country.latlng[1];

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(
        Math.max(0.1, 0.2 * scale),
        Math.max(0.1, 0.2 * scale),
        Math.max(zScale, 0.4 * Math.random())
      ),
      new THREE.MeshBasicMaterial({
        color: '#3BF7FF',
        opacity: 0.4,
        transparent: true,
      })
    );

    const latitude_rad = (lat * Math.PI) / 180;
    const longitude_rad = (lng * Math.PI) / 180;

    let x = radiusEarth * Math.cos(latitude_rad) * Math.sin(longitude_rad);
    let z = radiusEarth * Math.cos(latitude_rad) * Math.cos(longitude_rad);
    let y = radiusEarth * Math.sin(latitude_rad);

    box.position.x = x;
    box.position.y = y;
    box.position.z = z;

    box.lookAt(0, 0, 0); //whre the boxs should be faced
    box.geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 0, -zScale / 2)
    );

    group.add(box);

    gsap.to(box.scale, {
      z: 1.4,
      duration: 2,
      yoyo: true,
      repeat: -1, //means Infinity,
      ease: 'linear',
      delay: Math.random(),
    });

    box.country = country.name.common;
    box.population = new Intl.NumberFormat().format(country.population);
  });
}
createBoxes(countries);

group.rotation.offset = {
  x: 0,
  y: 0,
};

const mouse = {
  x: undefined,
  y: undefined,
  down: false,
  xPrev: undefined,
  yPrev: undefined,
};

const raycaster = new THREE.Raycaster();
const popUpEl = document.getElementById('popUpEl');
const populationEl = document.getElementById('populationEl');
const populationValueEl = document.getElementById('populationValueEl');

const IsData = {
  state: false,
  country: '',
};

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // group.rotation.y += 0.001;

  // if (mouse.x) {
  //   gsap.to(group.rotation, {
  //     x: -mouse.y * 0.3,
  //     y: mouse.x * 0.5,
  //     duration: 2,
  //   });
  // }

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(
    group.children.filter((mesh) => mesh.geometry.type === 'BoxGeometry')
  );

  group.children.forEach((mesh) => (mesh.material.opacity = 0.4));

  gsap.set(popUpEl, {
    display: 'none',
  });

  IsData.state = false;
  IsData.country = '';

  for (let i = 0; i < intersects.length; i++) {
    const box = intersects[i].object;

    box.material.opacity = 1;
    gsap.set(popUpEl, {
      display: 'block',
    });
    populationEl.textContent = box.country;
    populationValueEl.textContent = box.population;

    IsData.state = true;
    IsData.country = box.country;
  }
}

animate();

canvasContainer.addEventListener('mousedown', ({ clientX, clientY }) => {
  mouse.down = true;
  mouse.xPrev = clientX;
  mouse.yPrev = clientY;
});

addEventListener('mousemove', (event) => {
  event.preventDefault();
  if (innerWidth >= 1024) {
    mouse.x = ((event.clientX - innerWidth / 2) / (innerWidth / 2)) * 2 - 1;
    mouse.y = -(event.clientY / innerHeight) * 2 + 1;
  } else {
    const offset = canvasContainer.getBoundingClientRect().top;

    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = -((event.clientY - offset) / innerHeight) * 2 + 1;
  }

  gsap.set(popUpEl, {
    x: event.clientX,
    y: event.clientY,
  });

  if (mouse.down) {
    const deltaX = event.clientX - mouse.xPrev;
    const deltaY = event.clientY - mouse.yPrev;

    group.rotation.offset.x += deltaY * 0.005;
    group.rotation.offset.y += deltaX * 0.005;

    gsap.to(group.rotation, {
      y: group.rotation.offset.y,
      x: group.rotation.offset.x,
      duration: 2,
    });

    // group.rotation.y += deltaX * 0.005;
    // group.rotation.x += deltaY * 0.005;

    mouse.xPrev = event.clientX;
    mouse.yPrev = event.clientY;
  }
});

canvasContainer.addEventListener('click', () => {
  if (IsData.state) {
    // making the click function to the specifiq point work
  }
});

addEventListener('mouseup', (e) => {
  mouse.down = false;
});

canvasContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  camera.position.z = camera.position.z += e.deltaY * 0.01;
});

addEventListener('resize', (e) => {
  camera.aspect = canvasContainer.offsetWidth / canvasContainer.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
});

addEventListener(
  'touchmove',
  (event) => {
    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;

    const doesIntersect = raycaster.intersectObject(sphere);

    if (doesIntersect.length > 0) mouse.down = true;

    if (mouse.down) {
      const offset = canvasContainer.getBoundingClientRect().top;

      mouse.x = (event.clientX / innerWidth) * 2 - 1;
      mouse.y = -((event.clientY - offset) / innerHeight) * 2 + 1;

      gsap.set(popUpEl, {
        x: event.clientX,
        y: event.clientY,
      });

      const deltaX = event.clientX - mouse.xPrev;
      const deltaY = event.clientY - mouse.yPrev;

      group.rotation.offset.x += deltaY * 0.005;
      group.rotation.offset.y += deltaX * 0.005;

      gsap.to(group.rotation, {
        y: group.rotation.offset.y,
        x: group.rotation.offset.x,
        duration: 2,
      });

      // group.rotation.y += deltaX * 0.005;
      // group.rotation.x += deltaY * 0.005;

      mouse.xPrev = event.clientX;
      mouse.yPrev = event.clientY;
    }
  },
  { passive: false }
);

addEventListener('touchend', (e) => {
  mouse.down = false;
});
