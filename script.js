// 1. SCENE, CAMERA, AND RENDERER SETUP
const scene = new THREE.Scene();
// Add subtle fog for depth
scene.fog = new THREE.FogExp2(0x070913, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// 2. CREATE 3D OBJECTS (DATA THEME)

// Object A: The Central "Data Core" (Wireframe Icosahedron)
const coreGeometry = new THREE.IcosahedronGeometry(10, 1);
const coreMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00f2fe, 
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const dataCore = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(dataCore);

// Object B: Inner Glowing Core
const innerGeometry = new THREE.IcosahedronGeometry(4, 0);
const innerMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x4facfe,
    wireframe: false,
    transparent: true,
    opacity: 0.1
});
const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
scene.add(innerCore);

// Object C: Particle System (3D Scatter Plot / Data Cloud)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2500;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles across a wide area
    posArray[i] = (Math.random() - 0.5) * 120;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Create circular/glowing particle look
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.25,
    color: 0x00f2fe,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Object D: Floating "Data Nodes" (Cubes representing Databases/Blocks)
const nodeGroup = new THREE.Group();
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4facfe, 
    wireframe: true 
});

for(let i = 0; i < 40; i++) {
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    
    // Random positions
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(80));
    box.position.set(x, y, z);
    
    // Random rotations
    box.rotation.set(Math.random(), Math.random(), Math.random());
    
    // Random scale to look like different sized data packets
    const scale = Math.random() * 1.5 + 0.5;
    box.scale.set(scale, scale, scale);

    nodeGroup.add(box);
}
scene.add(nodeGroup);

// 3. LIGHTING
const pointLight = new THREE.PointLight(0x00f2fe, 2);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(pointLight, ambientLight);

// 4. INTERACTIVITY (SCROLL & MOUSE)

// Scroll Animation
function moveCamera() {
    const t = document.body.getBoundingClientRect().top;
    
    // Rotate main data core on scroll
    dataCore.rotation.x += 0.01;
    dataCore.rotation.y += 0.01;
    
    innerCore.rotation.z -= 0.02;

    // Move camera through the data cloud
    camera.position.z = 30 + t * -0.01;
    camera.position.x = t * -0.0002;
    camera.rotation.y = t * -0.0002;
}
document.body.onscroll = moveCamera;

// Mouse Parallax Effect
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
});

// 5. ANIMATION LOOP
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Constant gentle rotation of the core
    dataCore.rotation.y = elapsedTime * 0.1;
    dataCore.rotation.z = elapsedTime * 0.05;
    
    innerCore.rotation.y = -elapsedTime * 0.2;

    // Slowly rotate the entire particle cloud
    particlesMesh.rotation.y = -elapsedTime * 0.02;
    
    // Rotate individual data nodes
    nodeGroup.children.forEach((box, index) => {
        box.rotation.x += 0.005;
        box.rotation.y += 0.005;
    });

    // Apply Mouse Parallax smoothly
    particlesMesh.rotation.x += (mouseY * 0.5 - particlesMesh.rotation.x) * 0.05;
    particlesMesh.rotation.y += (mouseX * 0.5 - particlesMesh.rotation.y) * 0.05;
    
    dataCore.position.x += (mouseX * 5 - dataCore.position.x) * 0.05;
    dataCore.position.y += (-mouseY * 5 - dataCore.position.y) * 0.05;

    renderer.render(scene, camera);
}

animate();

// 6. HANDLE WINDOW RESIZE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});