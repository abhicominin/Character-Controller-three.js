import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { CameraHelper } from "three";
import { KeyDisplay } from "../../character simulation threejs/src/utils";
import { CharacterControls } from "../../character simulation threejs/src/characterControls";


// SCENE
var scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0xFBC252, 10, 50 );
scene.background = new THREE.Color(0xFBC252);




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
scene.add(camera);




//LIGHT
const dirLight = new THREE.DirectionalLight(0xF0997D, 0.8);
dirLight.position.set(-60, 100, -10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 200;
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
scene.add(dirLight);




// MODEL LOADER

var characterControls

new GLTFLoader().load("./model/Soldier.glb", function (gltf) {
    const model = gltf.scene
    model.traverse( function(object){
        if(object.isMesh)
        {
            object.castShadow = true
            object.material = new THREE.MeshToonMaterial({ color : 0xffffff, wireframe : false})
        }
        scene.add(model)
    })

    var gltfanimations = gltf.animations // getting all gltf animation clips from gltf model
    var mixer = new THREE.AnimationMixer(model) // will convert all animation clips into animation actions using mixer which helps into fading in or fading out animations for smooth animations transition
    var animationmap = new Map()

    gltfanimations.filter( function( a ){ // This function filter out all animations which are not T-Pose

      return a.name != "TPose"
    }).forEach( function( a ){ // For all of those animations which are filtered out and which are not T-Pose will be converted into AnimationClips
      
      animationmap.set(a.name , mixer.clipAction(a))
    })
    
    
    // INSTANTIATING CHARACTERCONTROLS
    characterControls = new CharacterControls( model, mixer, animationmap, orbitControls, camera, 'Idle')

})





// CONTROL KEYS
const keypressed = {}
// UTILITY TO DISPLAY WHICH KEYS ARE PRESSED
const keyDisplayQueue = new KeyDisplay()

// KEY DOWN EVENT
document.addEventListener('keydown', function(event) {
  keyDisplayQueue.down(event.key)
   if( event.shiftKey && characterControls )
   {
    // TOGGLE BETWEEN WALK AND RUN
    characterControls.switchRunToggle()

   }
   else
   {
     keypressed[event.key.toLowerCase()] = true  // Setting the property of the object true on key press down
   }
},false)



// KEY UP EVENT
document.addEventListener('keyup', function(event) {
  keyDisplayQueue.up(event.key)
   keypressed[event.key.toLowerCase()] = false // Setting the property of the object false on fey press up
},false)





// RENDERER
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);


// FLOOR
var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1000,1000),
    new THREE.MeshBasicMaterial({color : 0xFFB100, side : THREE.DoubleSide})
)
floor.rotation.x = Math.PI/2
scene.add(floor)



// CONTROLS
var orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 15;
orbitControls.enablePan = false;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;




// CLOCK
var clock = new THREE.Clock();

// RENDER FUNCTION
function animate() {

  let mixerUpdateDelta = clock.getDelta()
   
  if( characterControls )
  {
    characterControls.update( mixerUpdateDelta , keypressed ) // Passing the delta and keypressed information to the update method of CharacterControls
  }


  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();




//RESIZE EVENT
window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

