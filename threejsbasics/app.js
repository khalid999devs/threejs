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

let rayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0xf7f7f7 });
// const box = new THREE.Mesh(geometry, material);
// box.position.x = -2;
// box.position.y = 2;
// box.position.z = -2;

// const geometry1 = new THREE.BoxGeometry(1, 1, 1);
// const material1 = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
// const box1 = new THREE.Mesh(geometry1, material1);

// box1.position.y = 2;
// scene.add(box1)

//shorthand
// box.position.set(2, 2, -2);
// box.rotation.set(45, 0, 0);
// box.scale.set(1, 2, 1);

// scene.add(box);

let meshX = -10;
for (let i = 0; i < 15; i++) {
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = (Math.random() - 0.5) * 10;
  mesh.position.y = (Math.random() - 0.5) * 10;
  mesh.position.z = (Math.random() - 0.5) * 10;
  scene.add(mesh);
  meshX += 1;
}

let light = new THREE.PointLight(0xffffff, 1, 1000);
light.position.set(0, 0, 0);
scene.add(light);

let light1 = new THREE.PointLight(0xffffff, 2, 500);
light1.position.set(0, 0, 25);
scene.add(light1);

let render = () => {
  requestAnimationFrame(render);
  // box.rotation.x += 0.02;
  // box.rotation.y += 0.01;

  // box.scale.x -= 0.01;

  renderer.render(scene, camera);
};

function onMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  rayCaster.setFromCamera(mouse, camera);

  const intersects = rayCaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    const tl = gsap.timeline();
    tl.to(intersects[i].object.scale, {
      x: 2,
      ease: Expo.easeout,
      duration: 1,
    });
    tl.to(intersects[i].object.scale, {
      x: 0.5,
      ease: Expo.easeout,
      duration: 0.5,
    });
    tl.to(intersects[i].object.position, {
      x: 2,
      ease: Expo.easeout,
      duration: 0.5,
    });
    tl.to(
      intersects[i].object.rotation,
      { y: Math.PI * 0.5, ease: Expo.easeout, duration: 0.5 },
      '=-1.5'
    );
  }
}

render();

document.body.addEventListener('mousemove', onMouseMove);
