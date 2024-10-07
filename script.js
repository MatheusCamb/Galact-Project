import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Constantes globais
const NASA_API_KEY = 'fGGHWEJEDpRhnRZCtL3MpEtg4x4xvXbeSnVDWbqh'; // Substitua por sua chave de API da NASA

// Cena, câmera e renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 150);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles de câmera
const controls = new OrbitControls(camera, renderer.domElement);

// Iluminação (simulando o Sol)
const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Criar o Sol
const sunGeometry = new THREE.SphereGeometry(21, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Controle de velocidade de rotação
let globalRotationSpeed = 1.0;  // Multiplicador global de velocidade

// Função para criar legendas (Sprites)
function createLabel(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = 'Bold 40px Arial';
  context.fillStyle = 'white';
  context.fillText(text, 0, 50);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);

  sprite.scale.set(15, 7.5, 1);  // Tamanho da legenda
  return sprite;
}

// Dados dos planetas
const planetsData = [
  { name: 'Mercúrio', size: 2, color: 0xaaaaaa, distance: 15, rotationSpeed: 0.01, orbitSpeed: 0.04 },
  { name: 'Vênus', size: 4, color: 0xffcc66, distance: 25, rotationSpeed: 0.008, orbitSpeed: 0.015 },
  { name: 'Terra', size: 4.5, color: 0x3399ff, distance: 35, rotationSpeed: 0.02, orbitSpeed: 0.01 },
  { name: 'Marte', size: 3.5, color: 0xff3300, distance: 45, rotationSpeed: 0.018, orbitSpeed: 0.008 },
  { name: 'Júpiter', size: 10, color: 0xffcc99, distance: 65, rotationSpeed: 0.005, orbitSpeed: 0.002 },
  { name: 'Saturno', size: 9, color: 0xff9966, distance: 85, rotationSpeed: 0.006, orbitSpeed: 0.0018 },
  { name: 'Urano', size: 4.5, color: 0x66ccff, distance: 105, rotationSpeed: 0.01, orbitSpeed: 0.001 },
  { name: 'Netuno', size: 4, color: 0x3366ff, distance: 125, rotationSpeed: 0.007, orbitSpeed: 0.0009 }
];

// Array para armazenar os planetas criados
const planets = [];

// Função para criar planetas, suas órbitas e legendas
function createPlanets() {
  planetsData.forEach(planet => {
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: planet.color });
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.position.x = planet.distance;
    planetMesh.name = planet.name;

    // Adicionar órbita de planeta
    planetMesh.orbitRadius = planet.distance;  // Raio da órbita
    planetMesh.orbitAngle = 0;  // Ângulo inicial da órbita
    planetMesh.orbitSpeed = planet.orbitSpeed;  // Velocidade da órbita

    scene.add(planetMesh);
    planets.push({ mesh: planetMesh, rotationSpeed: planet.rotationSpeed, orbitSpeed: planet.orbitSpeed });

    // Criar a órbita visualizada
    const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.05, planet.distance + 0.05, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: planet.color, side: THREE.DoubleSide }); // Cor da órbita
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    // Adicionar legenda
    const label = createLabel(planet.name);
    planetMesh.label = label; // Associar a legenda ao planeta
    scene.add(label);
  });
}

// Array para armazenar asteroides criados
const asteroids = [];

// Função para obter dados de asteroides da API da NASA
async function fetchAsteroids() {
  const today = new Date().toISOString().split('T')[0]; // Data de hoje no formato YYYY-MM-DD
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&api_key=${NASA_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const asteroidsData = data.near_earth_objects[today];
    
    displayAsteroids(asteroidsData);
  } catch (error) {
    console.error('Erro ao buscar dados da NASA:', error);
  }
}

// Função para criar asteroides no cenário Three.js
function displayAsteroids(asteroidsData) {
  asteroidsData.forEach(asteroidData => {
    const size = asteroidData.estimated_diameter.kilometers.estimated_diameter_min * 30; // Ajuste de escala
    const distance = asteroidData.close_approach_data[0].miss_distance.kilometers / 100000; // Ajuste para o sistema

    const geometry = new THREE.SphereGeometry(size, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xfffffff });
    const asteroidMesh = new THREE.Mesh(geometry, material);
    
    // Adicionar órbita para asteroides
    asteroidMesh.orbitRadius = distance;
    asteroidMesh.orbitAngle = Math.random() * Math.PI * 2; // Ângulo aleatório inicial para cada asteroide
    asteroidMesh.orbitSpeed = 0.005 + Math.random() * 0.01; // Velocidade aleatória para cada asteroide

    asteroidMesh.position.set(
      asteroidMesh.orbitRadius * Math.cos(asteroidMesh.orbitAngle), 
      0,
      asteroidMesh.orbitRadius * Math.sin(asteroidMesh.orbitAngle)
    );

    asteroidMesh.name = asteroidData.name;
    scene.add(asteroidMesh);
    asteroids.push(asteroidMesh);

    // Adicionar legenda para o asteroide
    const label = createLabel(asteroidData.name);
    asteroidMesh.label = label; // Associar a legenda ao asteroide
    scene.add(label);
  });
}

// Criar um elemento de caixa de diálogo
const dialogBox = document.createElement('div');
dialogBox.style.position = 'absolute';
dialogBox.style.top = '10px';
dialogBox.style.left = '10px';
dialogBox.style.padding = '10px';
dialogBox.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
dialogBox.style.border = '1px solid black';
dialogBox.style.display = 'none'; // Inicialmente escondido
document.body.appendChild(dialogBox);

// Função para exibir dados do objeto
function showObjectData(object) {
  // Obtenha dados do asteroide se for um
  const isAsteroid = asteroids.some(asteroid => asteroid.name === object.name);
  const type = isAsteroid ? 'NEO' : 'Planeta';
  const size = isAsteroid ? (object.geometry.parameters.radius * 0.1).toFixed(2) + ' km' : (object.geometry.parameters.radius * 10).toFixed(2) + ' km'; // Escala para visualização
  const riskOfCollision = isAsteroid ? (Math.random() < 0.1 ? 'Sim' : 'Não') : 'Não';

  dialogBox.innerHTML = `
    <strong>Nome:</strong> ${object.name}<br>
    <strong>Tamanho:</strong> ${size}<br>
    <strong>Tipo:</strong> ${type}<br>
    <strong>Risco de colisão:</strong> ${riskOfCollision}<br>
  `;
  dialogBox.style.display = 'block';
}

// Raycaster para detecção de cliques
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  // Atualiza as coordenadas do mouse
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Calcula objetos a partir do mouse
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([...planets.map(p => p.mesh), ...asteroids]);

  // Se um objeto for clicado, mostra seus dados
  if (intersects.length > 0) {
    const selectedObject = intersects[0].object;
    showObjectData(selectedObject);
  } else {
    dialogBox.style.display = 'none'; // Esconder a caixa se nada for clicado
  }
});

// Função de animação
function animate() {
  requestAnimationFrame(animate);
  
  // Rotação do Sol
  sun.rotation.y += globalRotationSpeed * 0.01;

  // Atualizar planetas
  planets.forEach(planet => {
    const { mesh, rotationSpeed } = planet;
    mesh.rotation.y += rotationSpeed; // Rotação do planeta
    mesh.orbitAngle += planet.orbitSpeed; // Atualiza o ângulo da órbita
    mesh.position.set(
      mesh.orbitRadius * Math.cos(mesh.orbitAngle), 
      0, 
      mesh.orbitRadius * Math.sin(mesh.orbitAngle)
    );

    // Atualizar posição da legenda
    mesh.label.position.copy(mesh.position);
    mesh.label.position.y += 5; // Ajustar altura da legenda
  });

  // Atualizar asteroides
  asteroids.forEach(asteroid => {
    asteroid.orbitAngle += asteroid.orbitSpeed; // Atualiza o ângulo da órbita
    asteroid.position.set(
      asteroid.orbitRadius * Math.cos(asteroid.orbitAngle), 
      0, 
      asteroid.orbitRadius * Math.sin(asteroid.orbitAngle)
    );

    // Atualizar posição da legenda
    asteroid.label.position.copy(asteroid.position);
    asteroid.label.position.y += 5; // Ajustar altura da legenda
  });

  controls.update();
  renderer.render(scene, camera);
}

createPlanets();
fetchAsteroids();
animate();

// Redimensionamento da tela
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
