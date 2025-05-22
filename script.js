// Import de ThreeJS
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let configRound = null;

let rightAnswer = "";
let submitAnswer = "";
let livesRemaining = 3;
let timer = 60;
let score = 0;
let scorePossible = 0;
let gameFound = false;
let palierRound = 1;
let rightCoordMap = { x: null, y: null };
let submitCoordMap = { x: null, y: null };

// Récupération des éléments avec du contenu variable
const timerRound = document.getElementById("timer__count");
const roundPlay = document.getElementById("current-step");
const roundTotal = document.getElementById("total-steps");
const scoreDisplay = document.getElementById("score__count");
const gameAnswer = document.getElementById("title-game");
const gamePoster = document.querySelector("#poster-game img");
const gameMap = document.querySelector("#map-game img");
const roundScore = document.getElementById("earned-points");
const roundScorePossible = document.getElementById("total-points");
const buttonNextRound = document.getElementById("total-points");

// Récupération du champ texte pour le nom du jeu
const guessInput = document.getElementById("guess__input");
const guessScore = document.getElementById("score-guess");

// Récupérations de la map
const mapContent = document.getElementById("map__content");
const mapContainer = document.getElementById("map__container");
const mapImage = document.getElementById("map__image");
const mapPing = document.getElementById("map__ping");
const mapSubmit = document.getElementById("map__submit");
let isDragging = false;
let wasMoved = false;
let previousMouseX = 0;
let previousMouseY = 0;
let previousX = 0;
let previousY = 0;
let previousOffsetX = 0;
let previousOffsetY = 0;
let offsetMapX = 0;
let offsetMapY = 0;

// À la fin du chargement de la page, on lance toutes les fonctions de configuration
window.addEventListener("load", () => {
  console.log("Page loaded");
  initConfig();
  // fetchJSONData();
  // load3DSpace("/img/view/1.jpg");
  // initGame();
  // launchCountdown();
});

// Validation du champ guess
guessInput.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    guessInput.value !== null &&
    guessInput.value !== ""
  ) {
    e.preventDefault();
    submitAnswer = guessInput.value.toUpperCase();
    guessInput.value = "";
    // console.log(submitAnswer);
    // if (submitAnswer === rightAnswer) {
    if (rightAnswer.includes(submitAnswer)) {
      document.getElementById("guess").remove();
      document.getElementById("lifes").remove();
      guessScore.classList.add("reveal");
      gameFound = true;

      if (
        configRound.bonus !== null &&
        configRound.bonus.hasOwnProperty("doublePoints") &&
        configRound.bonus.doublePoints
      ) {
        score += scorePossible * 2;
      } else {
        score += scorePossible;
      }
      roundScore.innerText = score;
      scoreDisplay.innerText = parseInt(scoreDisplay.innerText) + score;

      if (
        configRound.bonus !== null &&
        configRound.bonus.hasOwnProperty("noMap") &&
        configRound.bonus.noMap
      ) {
        document.getElementById("timer").remove();
        document.getElementById("finish-screen").style.display = "flex";
      } else {
        document.getElementById("map").style.display = "block";
      }
    } else {
      livesRemaining--;
      if (livesRemaining >= 1) {
        document
          .querySelector(`#lifes .single-life:nth-child(${livesRemaining + 1})`)
          .classList.add("lost");
      } else {
        document.getElementById("guess").remove();
        document.getElementById("lifes").remove();
        if (
          configRound.bonus === null ||
          !configRound.bonus.hasOwnProperty("noMap") ||
          !configRound.bonus.noMap
        ) {
          document.getElementById("map").remove();
        }
        document.getElementById("timer").remove();
        roundScore.innerText = score;
        document.getElementById("finish-screen").style.display = "flex";
      }
    }
  }
});

// Gestion des intéractions sur la map
// Move Map (4 functions)
mapContent.addEventListener("mousedown", (e) => {
  e.preventDefault();
  isDragging = true;
  wasMoved = false;

  previousX = e.clientX;
  previousY = e.clientY;

  previousMouseX = e.clientX;
  previousMouseY = e.clientY;
  // console.log("Mouse down");
});
mapContent.addEventListener("mousemove", (e) => {
  e.preventDefault();
  if (isDragging) {
    offsetMapX = previousX - e.clientX;
    offsetMapY = previousY - e.clientY;

    mapContainer.style.left = `calc(50% - ${previousOffsetX + offsetMapX}px)`;
    mapContainer.style.top = `calc(50% - ${previousOffsetY + offsetMapY}px)`;
    // console.log("Dragging");
    console.log(offsetMapX, offsetMapY);
  }
});
mapContent.addEventListener("mouseup", (e) => {
  e.preventDefault();
  if (isDragging) {
    isDragging = false;

    previousOffsetX += offsetMapX;
    previousOffsetY += offsetMapY;

    if (previousMouseX != e.clientX && previousMouseY != e.clientY) {
      wasMoved = true;
    }
  }
  // console.log("Mouse up");
});
mapContent.addEventListener("mouseout", () => {
  isDragging = false;

  previousOffsetX += offsetMapX;
  previousOffsetY += offsetMapY;
});

// Zoom
mapContent.addEventListener("wheel", (e) => {
  e.preventDefault();

  var zoomIntensity = 0.075; // Intensité du zoom
  var zoomDirection = e.deltaY > 0 ? -1 : 1; // Direction du zoom
  var zoomLevel = parseFloat(mapContainer.style.scale) || 1;
  // var zoomLevel = parseFloat(mapContainer.style.transform.replace('scale(', '').replace(')', '')) || 1;
  var newZoomLevel = zoomLevel + zoomIntensity * zoomDirection;
  mapContainer.style.scale = newZoomLevel;
  // mapContainer.style.transform = 'scale(' + newZoomLevel + ')';

  // console.log(mapContainer.getBoundingClientRect().left);
});
// Ping drop
mapContainer.addEventListener("click", (e) => {
  let mapRect = mapContainer.getBoundingClientRect();

  let pingPositionX = e.clientX - mapRect.left;
  let pingPositionY = e.clientY - mapRect.top;

  if (!wasMoved) {
    mapPing.style.display = "block";
    mapPing.style.left = `${(pingPositionX / mapRect.width) * 100}%`;
    mapPing.style.top = `${(pingPositionY / mapRect.height) * 100}%`;

    submitCoordMap.x = `${(pingPositionX / mapRect.width) * 100}%`;
    submitCoordMap.y = `${(pingPositionY / mapRect.height) * 100}%`;

    // submitCoordMap.x = pingPositionX;
    // submitCoordMap.y = pingPositionY;
  }
});
// Submit Map
mapSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  // let pingPositionX = mapPing.style.left;
  // let pingPositionY = mapPing.style.top;

  document.getElementById("map").remove();
  document.getElementById("timer").remove();
  revealFinishScreen();
});

// Initialisation de la configuration du jeu
function initConfig() {
  const searchParams = new URLSearchParams(window.location.search);
  // console.log(!/\D/.test(searchParams.get('round')));
  if (searchParams.has("round") && !/\D/.test(searchParams.get("round"))) {
    console.log("Launch game");

    // sessionStorage.setItem("runningGame", true);
    // sessionStorage.setItem("currentRound", 1);
    // sessionStorage.setItem("gameFound", false);
    // sessionStorage.setItem("mapSubmit", false);
    // sessionStorage.setItem("timer", 60);
    // sessionStorage.setItem("score", 0);
    // sessionStorage.setItem("history", JSON.stringify([true, false, true, true, true, false, true, false]));

    fetchJSONData();
  } else {
    // console.log(window.location.host + window.location.pathname + "?round=1");
    window.location.replace(window.location.pathname + "?round=1");
    // console.log("Redirection début game");
  }
}

// Récupérations des datas de fichier de configuration (JSON)
function fetchJSONData() {
  fetch("./configGame.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log("Get datas");
      initGame(data);
    })
    .catch((error) => console.error("Unable to fetch data:", error));
}

// Chargement de la vue 3D
function load3DSpace(img360 = "/img/img360.jpg") {
  // Configuration de la vue 3D //
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color("#1c1624"));
  document.getElementById("preview-game").appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // scene.background = new THREE.TextureLoader().load(img360);

  const camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 0.1);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.minDistance = 100;
  controls.maxDistance = 400;
  controls.zoomSpeed = 5;
  // controls.enableRotate = false;
  controls.enablePan = false;
  // controls.enableDamping = true;
  controls.rotateSpeed = -0.5;
  controls.panSpeed = -0.5;

  const geometry = new THREE.SphereGeometry(600, 64, 32);
  geometry.scale(-1, 1, 1);
  const texture = new THREE.TextureLoader().load(img360);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
  // const ambientLight = new THREE.AmbientLight(0xffffff, 0.25); // Couleur blanche, intensité de 0.5
  scene.add(sphere);
  // scene.add(ambientLight);

  controls.update();

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  console.log("3D view loaded");
}

// Initialisation de la manche
function initGame(datas) {
  console.log("Init game");

  // console.log(datas);
  let roundSelected = parseInt(
    new URLSearchParams(window.location.search).get("round")
  );
  // console.log(roundSelected);
  // console.log(datas.rounds.length);
  if (roundSelected < 1 || roundSelected > datas.rounds.length) {
    console.error("Round introuvable (inférieur à 1 ou supérieur à la limite)");
    window.location.replace(window.location.pathname + "?round=1");
  } else {
    console.log("OK");

    roundPlay.innerText = roundSelected.toString().padStart(2, "0");
    roundTotal.innerText = datas.rounds.length.toString().padStart(2, "0");

    configRound = datas.rounds[roundSelected - 1];
    console.log(configRound);

    rightAnswer = configRound.acceptTerms;
    palierRound = configRound.level;

    gameAnswer.innerText = configRound.game;
    gamePoster.src = configRound.posterImg;
    gameMap.src = configRound.mapImg;
    mapImage.src = configRound.mapImg;

    switch (configRound.level) {
      case 1:
        scorePossible = 100;
        break;

      case 2:
        scorePossible = 150;
        break;

      case 3:
        scorePossible = 250;
        break;

      default:
        scorePossible = 100;
        break;
    }
    if (
      configRound.bonus !== null &&
      configRound.bonus.hasOwnProperty("doublePoints") &&
      configRound.bonus.doublePoints
    ) {
      scorePossible *= 2;
    }
    guessScore.innerText = `+${scorePossible}`;
    roundScorePossible.innerText = scorePossible * 2;

    load3DSpace(configRound.viewImg);

    console.log(configRound.bonus);
    if (configRound.bonus !== null) {
      console.log(Object.keys(configRound.bonus).length);
    }
    if (
      configRound.bonus !== null &&
      configRound.bonus.hasOwnProperty("fastTime")
    ) {
      console.log("Fast time");
      timer = 30;
    } else {
      console.log("Normal time");
      timer = 60;
    }

    if (
      configRound.bonus !== null &&
      configRound.bonus.hasOwnProperty("noMap") &&
      configRound.bonus.noMap
    ) {
      document.getElementById("map").remove();
      document.getElementById("map-game").remove();
    } else {
      rightCoordMap.x = configRound.mapLocation.x;
      rightCoordMap.y = configRound.mapLocation.y;
    }

    if (roundSelected >= datas.rounds.length) {
      document
        .getElementById("next-round")
        .setAttribute("href", `/ending.html`);
      document.getElementById("next-round").innerText = "Récap";
    } else {
      document
        .getElementById("next-round")
        .setAttribute(
          "href",
          `${window.location.pathname}?round=${roundSelected + 1}`
        );
    }

    if (
      configRound.bonus === null ||
      Object.keys(configRound.bonus).length == 0
    ) {
      document.getElementById("bonus-round-screen").remove();
      launchCountdown();
    } else {
      document.getElementById("bonus-round-screen").style.zIndex = 9999;
      if (!configRound.bonus.doublePoints) {
        document.querySelector("#all-bonus .bonus.doublePoints").remove();
      }
      if (!configRound.bonus.noMap) {
        document.querySelector("#all-bonus .bonus.noMap").remove();
      }
      if (!configRound.bonus.fastTime) {
        document.querySelector("#all-bonus .bonus.fastTime").remove();
      }
      if (!configRound.bonus.oneTry) {
        document.querySelector("#all-bonus .bonus.oneTry").remove();
      }
      if (!configRound.bonus.noZoom) {
        document.querySelector("#all-bonus .bonus.noZoom").remove();
      }
      if (!configRound.bonus.viewLock) {
        document.querySelector("#all-bonus .bonus.viewLock").remove();
      }
    }
  }

  // console.log("Game inited");
}

document.getElementById("play-round").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("bonus-round-screen").remove();
  launchCountdown();
});

document.getElementById("next-round").addEventListener("click", (e) => {
  e.preventDefault();
  let href = document.getElementById("next-round").getAttribute("href");
  sessionStorage.setItem('score', score);
  window.location.href = href;
});

// Lancement du timer pour l'écran d'attente
function launchCountdown() {
  let countdownTime = 3;
  const countdownScreen = document.getElementById("countdown-screen");
  const countdown = document.querySelector(
    "#countdown-screen #countdown #countdown__count"
  );

  const countdownInterval = setInterval(() => {
    countdownTime--;
    if (countdownTime > 0) {
      countdown.innerText = countdownTime;
    } else {
      clearInterval(countdownInterval);
      countdown.innerText = "GO";
      console.log("Launch game");
      countdownScreen.style.opacity = 0;
      countdownScreen.style.pointerEvents = "none";
      setTimeout(() => {
        countdownScreen.remove();

        launchTimerGame();
      }, 1000);
    }
  }, 1000);
}

// Lancement du timer pour la manche
function launchTimerGame() {
  let timerTimeInitial = 60;
  let timerTimeRemains = 60;
  const timer = document.getElementById("timer");
  const timerCount = document.querySelector("#timer #timer__count");
  const inputGuess = document.getElementById("guess");
  const lifesDisplay = document.getElementById("lifes");
  const mapGuess = document.getElementById("map");

  const timerInterval = setInterval(() => {
    timerTimeRemains -= 0.01;
    if (timerTimeRemains >= 0 && timer) {
      timerCount.innerText = Math.ceil(timerTimeRemains);
      timer.setAttribute(
        "style",
        `--progress: ${100 - (timerTimeRemains / timerTimeInitial) * 100}%;`
      );
    } else {
      clearInterval(timerInterval);
      console.log("Timeout");
      timer.remove();
      inputGuess.remove();
      lifesDisplay.remove();
      mapGuess.remove();
      revealFinishScreen();
    }
  }, 10);
}

function revealFinishScreen() {
  const finishScreen = document.getElementById("finish-screen");
  finishScreen.style.display = "flex";
  
  console.log(rightCoordMap);
  console.log(submitCoordMap);

  const pingAnswer = document.getElementById('ping-answer');
  const pingPlayer = document.getElementById('ping-player');
  const distance = document.getElementById('distance');

  pingAnswer.style.display = "block";
  pingAnswer.style.left = rightCoordMap.x;
  pingAnswer.style.top = rightCoordMap.y;

  if (gameFound && submitCoordMap.x !== null && submitCoordMap.y !== null) {
    pingPlayer.style.display = "block";
    pingPlayer.style.left = submitCoordMap.x;
    pingPlayer.style.top = submitCoordMap.y;
  }
}