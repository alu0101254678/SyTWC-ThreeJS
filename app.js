// Importa todas las exportaciones de THREE como el objeto THREE
import * as THREE from 'three';
// Importa GLTFExporter, que se usa para exportar escenas 3D a formato GLTF
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
// Importa OrbitControls, que se usa para controlar la cámara con el ratón
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Declara variables que se usarán en todo el script
let scene, camera, renderer, controls, cube, raycaster, mouse, infoElement;

function init() {
  // Crea una nueva escena 3D
  scene = new THREE.Scene();
  // Crea una nueva cámara con perspectiva
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  // Crea un nuevo renderizador WebGL
  renderer = new THREE.WebGLRenderer();
  // Habilita el mapa de sombras en el renderizador
  renderer.shadowMap.enabled = true;
  // Crea nuevos controles de órbita para la cámara
  controls = new OrbitControls(camera, renderer.domElement);
  // Establece la distancia mínima y máxima para los controles de órbita
  controls.minDistance = 5;
  controls.maxDistance = 20;
  // Obtiene el elemento de información del DOM
  infoElement = document.getElementById('info');
  // Establece el tamaño del renderizador para que coincida con el tamaño de la ventana
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Añade el elemento del DOM del renderizador al cuerpo del documento
  document.body.appendChild(renderer.domElement);

  // Crea una luz direccional y la añade a la escena
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.name = 'directionalLight';
  directionalLight.position.set(1, 1, 1);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Crea una luz ambiental y la añade a la escena
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  ambientLight.name = 'ambientLight';
  scene.add(ambientLight);

  // Crea un suelo y lo añade a la escena
  const floorGeometry = new THREE.PlaneGeometry(2000, 2000);
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.name = 'floor';
  floor.rotation.x = - Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Crea varios objetos aleatorios y los añade a la escena
  for (let i = 0; i < 10; i++) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true; // Habilita la proyección de sombras para el cubo
    scene.add(cube);
    const object = createRandomObject();
    scene.add(object);
  }

  // Añade niebla a la escena
  scene.fog = new THREE.FogExp2(0xffffff, 0.05);

  // Establece la posición inicial de la cámara
  camera.position.z = 5;

  // Crea el raycaster y el vector del ratón
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Añade un controlador de eventos para el clic del ratón
  window.addEventListener('click', onMouseClick);
}

function onWindowResize() {
  // Actualiza el tamaño del renderizador y la cámara cuando se redimensiona la ventana
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  // Solicita el siguiente cuadro de animación y rota el cubo
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Si hay un objeto rotando, actualiza su rotación
  if (rotatingObject) {
    rotatingObject.rotation.x += 0.01;
    rotatingObject.rotation.y += 0.01;
  }

  // Renderiza la escena con la cámara
  renderer.render(scene, camera);
}

// Declara una variable para el objeto que está rotando
let rotatingObject = null;

function createRandomObject() {
  // Define los tipos de geometría que se quieran usar
  // Cada objeto en el array es un tipo de geometría con sus parámetros correspondientes
    // BoxGeometry es un cubo, SphereGeometry es una esfera y ConeGeometry es un cono
    // Los parámetros son los tamaños de cada geometría
    // Math.random() * 0.5 + 0.1 genera un número aleatorio entre 0.1 y 0.6
    // Math.round(Math.random() * 5) + 2 genera un número entero aleatorio entre 2 y 7
  const geometries = [
    { type: 'BoxGeometry', params: [Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1] },
    { type: 'SphereGeometry', params: [Math.random() * 0.5 + 0.1, Math.round(Math.random() * 5) + 2, Math.round(Math.random() * 5) + 2] },
    { type: 'ConeGeometry', params: [Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1, Math.round(Math.random() * 5) + 2] }
  ];

  // Elige un tipo de geometría al azar
  const randomGeometry = geometries[Math.floor(Math.random() * geometries.length)];

  // Crea la geometría con un tamaño aleatorio
  const geometry = new THREE[randomGeometry.type](...randomGeometry.params);

  // Crea un material con un color aleatorio
  const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });

  // Crea el objeto y establece su posición a un valor aleatorio dentro de los límites de la escena
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = true; // Habilita el lanzamiento de sombras para el objeto

  // Calcula la "altura" del objeto
  let height = 0;
  if (randomGeometry.type === 'SphereGeometry') {
    height = randomGeometry.params[0]; // Para esferas, la "altura" es el radio
  } else {
    height = geometry.parameters.height; // Para otros tipos de geometría, usa la altura
  }

  object.position.set(Math.random() * 9 - 4.5, height / 2, Math.random() * 9 - 4.5);

  // Si no hay ningún objeto rotando, haz que este objeto rote
  if (!rotatingObject) {
    rotatingObject = object;
  }

  return object;
}


let selectedObject = null;
let originalColor = null;


function onMouseClick(event) {
  // Convierte las coordenadas del ratón a coordenadas normalizadas del espacio de la cámara
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Actualiza el rayo con la cámara y las coordenadas del ratón
  raycaster.setFromCamera(mouse, camera);

  // Calcula los objetos que intersectan con el rayo
  const intersects = raycaster.intersectObjects(scene.children);

  // Si hay un objeto seleccionado, restablece su color
  if (selectedObject) {
    selectedObject.material.color.set(originalColor);
  }

  // Si hay alguna intersección, cambia el color del primer objeto intersectado
  if (intersects.length > 0 && intersects[0].object.name !== 'floor') {
    originalColor = intersects[0].object.material.color.getHex();
    intersects[0].object.material.color.set(0xff0000);
    selectedObject = intersects[0].object;
    // Muestra información sobre el objeto seleccionado
    infoElement.textContent = getObjectInfo(selectedObject);
  } else {
    selectedObject = null;
    originalColor = null;
    infoElement.textContent = '';
  }
}

function getObjectInfo(object) {
  const geometryType = object.geometry.type;
  const vertexCount = object.geometry.attributes.position.count;
  const faceCount = vertexCount / 3;

  // Determina si el objeto es regular o irregular
  let isRegular;
  if (geometryType === 'BoxGeometry') {
    isRegular = object.geometry.parameters.width === object.geometry.parameters.height &&
      object.geometry.parameters.height === object.geometry.parameters.depth;
  } else if (geometryType === 'SphereGeometry') {
    isRegular = true;
  } else if (geometryType === 'ConeGeometry') {
    isRegular = object.geometry.parameters.radiusTop === 0;
  } else {
    isRegular = 'Unknown';
  }

  return `Type: ${geometryType}, Face count: ${faceCount}, Regular: ${isRegular}`;
}

// Esta función se encarga de descargar el objeto seleccionado en formato GLTF
function downloadObject() {
  // Comprueba si hay un objeto seleccionado
  if (selectedObject) {
    // Crea un nuevo exportador GLTF
    const exporter = new GLTFExporter();

    // Cambia el color del objeto de vuelta a su color original antes de exportarlo
    selectedObject.material.color.set(originalColor);

    // Parsea el objeto seleccionado a GLTF
    exporter.parse(selectedObject, function (gltf) {
      // Crea un nuevo Blob con los datos GLTF en formato JSON
      const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
      // Crea una URL para el Blob
      const url = URL.createObjectURL(blob);
      // Crea un nuevo enlace para descargar el Blob
      const link = document.createElement('a');
      link.href = url;
      link.download = 'object.gltf';
      // Agrega el enlace al cuerpo del documento
      document.body.appendChild(link);
      // Hace clic en el enlace para iniciar la descarga
      link.click();
      // Elimina el enlace después de la descarga
      document.body.removeChild(link);
    });

    // Cambia el color del objeto de vuelta a rojo después de exportarlo
    selectedObject.material.color.set(0xff0000);
  } else {
    // Si no hay un objeto seleccionado, muestra un mensaje en la consola
    console.log('No object selected');
  }
}

// Esta función se encarga de crear una nueva escena
function createNewScene() {
  // Recoge todos los objetos que quieres eliminar
  const objectsToRemove = [];
  for (const object of scene.children) {
    // Comprueba si el objeto es una malla y no es el cubo verde, las luces o el suelo
    if (object.type === 'Mesh' && object !== cube && !['directionalLight', 'ambientLight', 'floor'].includes(object.name)) {
      // Si el objeto cumple con las condiciones, añádelo a la lista de objetos a eliminar
      objectsToRemove.push(object);
    }
  }

  // Elimina los objetos
  for (const object of objectsToRemove) {
    // Elimina cada objeto de la escena
    scene.remove(object);
  }

  // Restablece el objeto rotando
  rotatingObject = null;

  // Crea una nueva escena con objetos aleatorios
  for (let i = 0; i < 10; i++) {
    // Crea un objeto aleatorio y añádelo a la escena
    const object = createRandomObject();
    scene.add(object);
  }
}

// Cuando el documento esté cargado, inicializa la escena, comienza la animación y añade los controladores de eventos para los botones
document.addEventListener('DOMContentLoaded', (event) => {
  init(); // Inicializa la escena
  animate(); // Comienza la animación
  // Añade un controlador de eventos para el botón de descarga que llama a la función downloadObject cuando se hace clic en el botón
  document.getElementById('downloadButton').addEventListener('click', downloadObject);
  // Añade un controlador de eventos para el botón de nueva escena que llama a la función createNewScene cuando se hace clic en el botón
  document.getElementById('newSceneButton').addEventListener('click', createNewScene);
});