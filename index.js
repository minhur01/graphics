// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Light blue background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);




// OrbitControls for camera interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // An optional feature that adds inertia to camera movement
controls.dampingFactor = 0.25;
controls.enableZoom = true;




// Lighting
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);




// Camera position
camera.position.z = 5;




// GLTFLoader
const loader = new THREE.GLTFLoader();
let mixer; // Declare the mixer globally
const clock = new THREE.Clock(); // Clock to handle animation timing




loader.load('./assets/toothless_rigged_fk.glb', function(gltf) {
    const model = gltf.scene;
    scene.add(model);




    model.traverse((object) => {
        if (object.isBone) {
            console.log(object); // Log the name of the bone
        }
    });




    // Initialize the mixer
    mixer = new THREE.AnimationMixer(model);




    // Arm rotation animation for "arm_upper_R"
    const armRotationClip = createArmRotationAnimation('arm_upper_R');
    const armAction = mixer.clipAction(armRotationClip);
    armAction.play();




    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
       
        const delta = clock.getDelta(); // Get the time elapsed since the last frame
        mixer.update(delta); // Update the mixer to progress the animation
       
        controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
        renderer.render(scene, camera);
    }
   
    animate();
}, undefined, function(error) {
    console.error(error);
});




// Function to create arm rotation animation
function createArmRotationAnimation(boneName) {
    // Define keyframe data for rotation (using Quaternion rotations)
    const times = [0, 1, 2]; // Keyframe times in seconds
    const values = [
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI).toArray(),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 4).toArray(),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI).toArray(),
    ].flat();




    // Create a QuaternionKeyframeTrack for bone rotation
    const rotationKF = new THREE.QuaternionKeyframeTrack(`${boneName}.quaternion`, times, values);




    // Create an Animation Clip
    const animationClip = new THREE.AnimationClip('ArmRotationAnimation', -1, [rotationKF]);




    return animationClip;
}




// Resize event listener
window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    controls.update();
});


document.getElementById('numberSlider').addEventListener('input', function() {
    const value = this.value;
    document.getElementById('sliderValue').textContent = value;
});
