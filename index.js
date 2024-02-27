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
            //console.log(object); // Log the name of the bone
        }
    });

    // Initialize the mixer
    mixer = new THREE.AnimationMixer(model);

    animate();
}, undefined, function(error) {
    console.error(error);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
   
    const delta = clock.getDelta(); // Get the time elapsed since the last frame
    mixer.update(delta); // Update the mixer to progress the animation
   
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    renderer.render(scene, camera);
}

// Resize event listener
window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    controls.update();
});

// Slider event listener and bone rotation
document.getElementById('armLeftSlider').addEventListener('input', function() {
    const sliderValue = parseInt(this.value, 10); // Convert slider value to an integer
    const rotationAngle = mapSliderValueToAngle(sliderValue, 0, Math.PI); // Map the slider value to an angle

    rotateBone('arm_upper_L', -rotationAngle);
});
document.getElementById('armRightSlider').addEventListener('input', function() {
    const sliderValue = parseInt(this.value, 10); // Convert slider value to an integer
    const rotationAngle = mapSliderValueToAngle(sliderValue, 0, Math.PI); // Map the slider value to an angle

    rotateBone('arm_upper_R', rotationAngle);
});

// Function to map the slider value to a rotation angle
function mapSliderValueToAngle(value, minAngle, maxAngle) {
    return minAngle + (value - 1) * (maxAngle - minAngle) / 29; // Slider values are 1 to 30
}

// Function to rotate a specified bone
function rotateBone(boneName, angle) {
    scene.traverse((object) => {
        if (object.isBone && object.name === boneName) {
            // Adjust rotation as needed; here it's the Y-axis
            object.rotation.z = angle;
        }
    });
}
