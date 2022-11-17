import * as THREE from "./three.module.js";
import { OrbitControls } from "./OrbitControls.js";
import { VRButton } from "./VRButton.js";
import abi from "./abi/metaverse.json" assert { type: "json" };

//Event
window.addEventListener("resize", onWindowResize);
//size
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
//texture
const textureLoader = new THREE.TextureLoader();
//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0000ff);
//camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

//renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);
renderer.setAnimationLoop(tick);
camera.translateZ(30).translateY(0.1);
//Light
const ambientLight = new THREE.AmbientLight(0xbda355);
const directionalLight = new THREE.DirectionalLight(0xffffff);
ambientLight.add(directionalLight);
scene.add(ambientLight);
//Control
const controls = new OrbitControls(camera, renderer.domElement);
//VR
const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);
renderer.xr.enabled = true;
//Ground
const groundTexture = textureLoader.load("src/textures/roughness_map.jpg");
groundTexture.repeat.set(1000, 1000);
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.encoding = THREE.sRGBEncoding;
const groundGeometry = new THREE.PlaneGeometry(16000, 16000);
const groundMaterial = new THREE.MeshPhongMaterial({ map: groundTexture });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotateX(-Math.PI / 2.5);

scene.add(groundMesh);
// //object
// const boxTexture = textureLoader.load("src/textures/crate.gif");
// const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
// const boxMaterial = new THREE.MeshPhongMaterial({ map: boxTexture });
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(boxMesh);
// boxMesh.translateY(1);

// const coneTexture = textureLoader.load("src/textures/hardwood2_diffuse.jpg");
// const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32);
// const coneMaterial = new THREE.MeshPhongMaterial({ map: coneTexture });
// const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
// coneMesh.translateX(-3);
// coneMesh.translateY(1);
// scene.add(coneMesh);

// const cylinderTexture = textureLoader.load("src/textures/brick_roughness.jpg");
// const cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 320);
// const cylinderMaterial = new THREE.MeshPhongMaterial({ map: cylinderTexture });
// const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
// cylinderMesh.translateX(2.5).translateY(1);
// scene.add(cylinderMesh);

function tick() {
  //update control
  // boxMesh.rotateX(0.006);
  // boxMesh.rotateY(0.0005);
  // coneMesh.rotateY(0.005);
  // cylinderMesh.rotateY(0.0021);
  // cylinderMesh.rotateX(0.02);
  nfts.forEach((nft) => {
    nft.rotateX(0.005);
    nft.rotateY(0.01);
  });
  //update controler
  controls.update();
  //update render
  renderer.render(scene, camera);
}

function onWindowResize() {
  //Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  //Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
}
//Setting Web3
//inject web3
const web3 = new Web3(
  Web3.givenProvider ||
    "wss://eth-goerli.g.alchemy.com/v2/d52ObBSKv-JnbN8FGInimdlay_Pm09gQ"
);
//create contract's instance
const contract = new web3.eth.Contract(
  abi,
  "0xA7967C37AadA698b66B0c277E9b03eE7c6600f43"
);
const nfts = [];
//make condition for user
//if user enter wo metamask
let items;
if (Web3.givenProvider == null) {
  items = await contract.methods.items().call();
} else {
  //if user enter w metamask
  const accounts = await web3.eth.requestAccounts();
  items = await contract.methods.owners().call({ from: accounts[0] });
  console.log(accounts);
}
//Create mesh according to Item
items.forEach((item) => {
  let geometry;
  switch (item.itemType) {
    case "1": //Box
      geometry = new THREE.BoxGeometry(item.width, item.height, item.depth);
      break;
    case "2": //Cone
      geometry = new THREE.ConeGeometry(
        item.radius,
        item.height,
        item.radialSegment
      );
      break;
    case "3": //Cylinder
      geometry = new THREE.CylinderGeometry(
        item.radius,
        item.radiusBottom,
        item.height,
        item.radialSegment
      );
      break;
  }
  const texture = textureLoader.load(`src/texture/${item.texture}`);
  const material = new THREE.MeshPhongMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.translateX(item.x).translateY(item.y).translateZ(item.z);
  nfts.push(mesh);
  scene.add(mesh);
});
