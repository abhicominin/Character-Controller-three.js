import "./style.css";
import { KeyDisplay } from "./utils";
import { CharacterControls } from "./characterControls";
import { CameraHelper } from "three";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass' 
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'

// SCENE
var scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0xFF0032, 10, 50 );
scene.background = new THREE.Color(0xFF0032);

// CAMERA
var camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 5;
camera.position.z = 1;
camera.position.x = 0;

//LIGHT
const dirLight = new THREE.DirectionalLight(0xFF6E31, 0.7)
dirLight.position.set(- 60, 100, - 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = - 50;
dirLight.shadow.camera.left = - 50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 200;
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
scene.add(dirLight);

//FLOOR
const floorgeo = new THREE.PlaneGeometry(1000,1000)
const floormaterial = new THREE.MeshLambertMaterial({color : 0xCD0404, side : THREE.DoubleSide})
const floormesh = new THREE.Mesh(floorgeo,floormaterial)
floormesh.rotation.x = Math.PI/2
floormesh.receiveShadow = true
scene.add(floormesh)

// RENDERER
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// CONTROLS
var orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 15;
orbitControls.enablePan = false;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
orbitControls.update();

// MODEL WITH ANIMATIONS
var characterControls;
new GLTFLoader().load("./model/Soldier.glb", function (gltf) {
  var model = gltf.scene;
  model.traverse(function (object) {
    if (object.isMesh) 
    object.castShadow = true;
    object.material = new THREE.MeshToonMaterial({color : 0xffffff})
  });
  scene.add(model);
  var gltfAnimations = gltf.animations;
  var mixer = new THREE.AnimationMixer(model);
  var animationsMap = new Map();
  gltfAnimations
    .filter(function (a) {
      return a.name != "TPose";
    })
    .forEach(function (a) {
      animationsMap.set(a.name, mixer.clipAction(a));
    });
  characterControls = new CharacterControls(
    model,
    mixer,
    animationsMap,
    orbitControls,
    camera,
    "Idle"
  );
});

// CONTROL KEYS
var keysPressed = {};
var keyDisplayQueue = new KeyDisplay();
document.addEventListener(
  "keydown",
  function (event) {
    keyDisplayQueue.down(event.key);
    if (event.shiftKey && characterControls) {
      characterControls.switchRunToggle();
    } else {
      keysPressed[event.key.toLowerCase()] = true;
    }
  },
  false
);
document.addEventListener(
  "keyup",
  function (event) {
    keyDisplayQueue.up(event.key);
    keysPressed[event.key.toLowerCase()] = false;
  },
  false
);

//CLOCK
var clock = new THREE.Clock();

//POST-PROCESSING
// Creating a effectcomposer
const composer = new EffectComposer(renderer)
// First pass as a RenderPass to render our scene with our camera into the first render target.
composer.addPass(new RenderPass(scene,camera))

//adding the FilmPass
const filmpass = new FilmPass(
  0.35,
  0.025,
  648,
  false
)
filmpass.renderToScreen = false
composer.addPass(filmpass)

//adding the GlitchPass
const glitchpass = new GlitchPass()
glitchpass.renderToScreen = true
composer.addPass(glitchpass)





// ANIMATE
function animate() {
  var mixerUpdateDelta = clock.getDelta();
  if (characterControls) {
    characterControls.update(mixerUpdateDelta, keysPressed);
  }
  orbitControls.update();
  composer.render(mixerUpdateDelta)
  //renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();

// RESIZE HANDLER
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  composer.setSize(window.innerWidth,innerHeight)
  //renderer.setSize(window.innerWidth, window.innerHeight);
  keyDisplayQueue.updatePosition();
}
window.addEventListener("resize", onWindowResize);
