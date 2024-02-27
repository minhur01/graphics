// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Light blue background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Create a large plane
const geometry = new THREE.SphereGeometry(50, 20, 20);
const material = new THREE.MeshBasicMaterial();

// You can use Canvas to create a gradient texture
const canvas = document.createElement('canvas');
canvas.width = 2; // Width can be minimal, as we're just defining colors
canvas.height = 2; // Height 2 to define a top and bottom color

const ctx = canvas.getContext('2d');
// Create gradient (replace colors as needed for your split)
const gradient = ctx.createLinearGradient(0, 0, 0, 2);
gradient.addColorStop(0, 'red'); // Top color
gradient.addColorStop(1, 'blue'); // Bottom color

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 2, 2);

// Use canvas as texture
const texture = new THREE.CanvasTexture(canvas);
material.map = texture;
material.side = THREE.DoubleSide; // Ensure the inside of the sphere is also textured

const sphere = new THREE.Mesh(geometry, material);
sphere.position.x = 100; 
sphere.position.y = 200; 
sphere.position.z = -500; // Position the sphere in the scene
scene.add(sphere);



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
