import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"
import {
	CSS3DRenderer,
	CSS3DObject
} from "three/examples/jsm/renderers/CSS3DRenderer.js"
import dat from "dat.gui"

function initThree() {
	const scene = new THREE.Scene();
	const scene2 = new THREE.Scene();

	const camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		10000
	);

	camera.position.set(0, 0, 2500);
	scene.add(camera);

	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true,
	});
	renderer.shadowMap.enabled = true;
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const labelRenderer = new CSS3DRenderer()
	labelRenderer.setSize(window.innerWidth, window.innerHeight);
	labelRenderer.domElement.style.position = 'absolute';
	labelRenderer.domElement.style.top = 0;
	document.body.appendChild(labelRenderer.domElement);

	scene.add(new THREE.AxesHelper(1000))

	const controls = new OrbitControls(camera, labelRenderer.domElement);
	controls.enableDamping = true;

	const clock = new THREE.Clock()

	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		labelRenderer.setSize(window.innerWidth, window.innerHeight);
	});

	return {
		scene,
		scene2,
		camera,
		renderer,
		labelRenderer,
		controls,
		clock,
	}
}

const gltfLoader = new GLTFLoader()

const textureLoader = new THREE.TextureLoader()

const gui = new dat.GUI()

const {
	scene,
	scene2,
	camera,
	renderer,
	labelRenderer,
	controls,
	clock
} = initThree();

const ambientLight = new THREE.AmbientLight("#ffffff", 1)
scene.add(ambientLight)

const position = new THREE.Vector3(0, 900, 300);
const rotation = new THREE.Euler(0, 0, 0);

const container = document.createElement('div');
container.style.width = '1000px';
container.style.height = '1000px';
container.style.opacity = '1';
container.style.background = '#1d2e2f';
const iframe = document.createElement('iframe');
iframe.src = "https://www.youtube.com/"
iframe.style.width = "1000px"
iframe.style.height = "1000px"
container.appendChild(iframe);

const object = new CSS3DObject(container);
// copy monitor position and rotation
object.position.copy(position);
object.rotation.copy(rotation);
// Add to CSS scene
scene2.add(object);

// Create GL plane
const material = new THREE.MeshStandardMaterial();
material.side = THREE.DoubleSide;
material.opacity = 0;
material.transparent = true;
// NoBlending allows the GL plane to occlude the CSS plane
material.blending = THREE.NoBlending;
// Create plane geometry
const geometry = new THREE.PlaneGeometry(1000, 1000);
// Create the GL plane mesh
const mesh = new THREE.Mesh(geometry, material);
// Copy the position, rotation and scale of the CSS plane to the GL plane
mesh.position.copy(object.position);
mesh.rotation.copy(object.rotation);
mesh.scale.copy(object.scale);
// Add to gl scene
scene.add(mesh);

gltfLoader.load("./models/computer_setup.glb", model => {
	const texture = textureLoader.load("./models/baked_computer.jpg");
	texture.flipY = false;
	texture.encoding = THREE.sRGBEncoding;
	const material = new THREE.MeshBasicMaterial({
		map: texture,
	});
	model.scene.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			child.scale.set(900, 900, 900);
			child.material.map = texture;
			child.material = material;
		}
	});
	scene.add(model.scene)
})

function render() {
	const elapsedTime = clock.getElapsedTime();
	controls.update();
	renderer.render(scene, camera);
	labelRenderer.render(scene2, camera)
	requestAnimationFrame(render);
}

render();
