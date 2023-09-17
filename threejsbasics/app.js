// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor('#e5e5e5');
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', (_) => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
const box = new THREE.Mesh(geometry, material);
// box.position.x = -2;
// box.position.y = 2;
// box.position.z = -2;

//shorthand
// box.position.set(2, 2, -2);
// box.rotation.set(45, 0, 0);
// box.scale.set(1, 2, 1);

scene.add(box);

let light = new THREE.PointLight(0xffffff, 1, 500);
light.position.set(10, 0, 25);
scene.add(light);

let render = () => {
  requestAnimationFrame(render);
  box.rotation.x += 0.02;
  box.rotation.y += 0.01;

  box.scale.x -= 0.01;

  renderer.render(scene, camera);
};

render();
// Create a cube and add it to the scene
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// // Animation function
// const animate = () => {
//   requestAnimationFrame(animate);

//   // Rotate the cube
//   cube.rotation.x += 0.01;
//   cube.rotation.y += 0.01;

//   renderer.render(scene, camera);
// };

// // Start the animation
// animate();
