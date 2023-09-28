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
new OrbitControls(camera, renderer.domElement);

function createBox({ lat, lng, country, population }) {
  // 23.6345° N, 102.5528° W=mexico

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.8),
    new THREE.MeshBasicMaterial({
      color: '#3BF7FF',
      opacity: 0.4,
      transparent: true,
    })
  );

  const latitude_rad = (lat * Math.PI) / 180;
  const longitude_rad = (lng * Math.PI) / 180;

  // console.log(group);
  // let x = radiusEarth * Math.cos(latitude_rad) * Math.cos(longitude_rad);
  // let z = radiusEarth * Math.cos(latitude_rad) * Math.sin(longitude_rad);
  // let y = radiusEarth * Math.sin(latitude_rad);

  let x = radiusEarth * Math.cos(latitude_rad) * Math.sin(longitude_rad);
  let z = radiusEarth * Math.cos(latitude_rad) * Math.cos(longitude_rad);
  let y = radiusEarth * Math.sin(latitude_rad);

  box.position.x = x;
  box.position.y = y;
  box.position.z = z;

  box.lookAt(0, 0, 0); //whre the boxs should be faced
  box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.4));

  group.add(box);

  gsap.to(box.scale, {
    z: 1.4,
    duration: 2,
    yoyo: true,
    repeat: -1, //means Infinity,
    ease: 'linear',
    delay: Math.random(),
  });

  box.country = country;
  box.population = population;
}
function createBoxes(countries) {
  countries.forEach((country) => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.8),
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
    box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.4));

    group.add(box);

    gsap.to(box.scale, {
      z: 1.4,
      duration: 2,
      yoyo: true,
      repeat: -1, //means Infinity,
      ease: 'linear',
      delay: Math.random(),
    });

    box.country = country;
    box.population = population;
  });
}

createBox({
  lat: 23.6345,
  lng: -102.5528,
  country: 'Mexico',
  population: '127.6 million',
});
createBox({
  lat: -14.235,
  lng: -51.9253,
  country: 'Brazil',
  population: '211 million',
});
createBox({
  lat: 20.5937,
  lng: 78.9629,
  country: 'India',
  population: '1.366 billion',
});
createBox({
  lat: 35.8617,
  lng: 104.1954,
  country: 'China',
  population: '1.398 billion',
});
createBox({
  lat: 37.0902,
  lng: -95.7129,
  country: 'USA',
  population: '328.2 million',
});

const mouse = {
  x: undefined,
  y: undefined,
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
  group.rotation.y += 0.001;

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

addEventListener('mousemove', (event) => {
  mouse.x = ((event.clientX - innerWidth / 2) / (innerWidth / 2)) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;

  gsap.set(popUpEl, {
    x: event.clientX,
    y: event.clientY,
  });
});

canvasContainer.addEventListener('click', () => {
  if (IsData.state) {
    // making the click function to the specifiq point work
  }
});
