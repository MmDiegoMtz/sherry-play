const holes = document.querySelectorAll(".hole");
const scoreBoard = document.querySelector(".score");
const moles = document.querySelectorAll(".mole");
const button = document.querySelector("#start");
const homeButton = document.getElementById("home-button");
const bgMusic = document.getElementById("bg-music");

let lastHole;
let timeUp = false;
let score = 0;

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];

  if (hole === lastHole) {
    return randomHole(holes);
  }

  lastHole = hole;
  return hole;
}

function peep() {
  const time = randomTime(600, 1400);
  const hole = randomHole(holes);
  hole.classList.add("up");
  setTimeout(() => {
    hole.classList.remove("up");
    if (!timeUp) peep();
  }, time);
}

function startGame() {
  scoreBoard.textContent = 0;
  timeUp = false;
  score = 0;
  button.style.visibility = "hidden";
  peep();
  setTimeout(() => {
    timeUp = true;
    button.innerHTML = "¿Otra vez?";
    button.style.visibility = "visible";
  }, 10000);
}

function bonk(e) {
  if (!e.isTrusted) return;
  score++;
  this.classList.remove("up");
  scoreBoard.textContent = score;
}

moles.forEach((mole) => mole.addEventListener("click", bonk));
button.addEventListener("click", startGame);

// --- Detección de móvil, pantalla completa automática y música de fondo ---

const isMobile = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(
  navigator.userAgent
);

function requestFullscreen() {
  const el = document.documentElement;
  const requestFs =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  if (!requestFs) return Promise.reject();
  const result = requestFs.call(el);
  return result && result.catch ? result : Promise.resolve();
}

function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

function isHomeButtonTarget(e) {
  if (e.target && e.target.closest && e.target.closest("#home-button"))
    return true;
  if (e.composedPath) {
    const path = e.composedPath();
    for (let i = 0; i < path.length; i++) {
      if (path[i].id === "home-button") return true;
    }
  }
  return false;
}

// En móvil, se intenta entrar en pantalla completa apenas carga la página.
// Los navegadores exigen un gesto del usuario para concederla, así que este
// primer intento normalmente se rechaza en silencio, y se reintenta solo en
// el primer toque/clic real (sin pedirle nada extra al usuario).
if (isMobile && !isFullscreen()) {
  requestFullscreen().catch(() => {});
}

let firstInteractionHandled = false;
function handleFirstInteraction() {
  if (firstInteractionHandled) return;
  firstInteractionHandled = true;

  if (isMobile) {
    requestFullscreen().catch(() => {
      // Algunos navegadores móviles (p. ej. iPhone/Safari) bloquean o no
      // soportan pantalla completa; se ignora el error.
    });
  }

  if (bgMusic) {
    bgMusic.volume = 0.5;
    const playPromise = bgMusic.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {
        // Reproducción automática bloqueada; se reintentará en la siguiente interacción.
        firstInteractionHandled = false;
      });
    }
  }
}

document.addEventListener(
  "pointerdown",
  (e) => {
    if (isHomeButtonTarget(e)) return;
    handleFirstInteraction();
  },
  { passive: true }
);

document.addEventListener("keydown", () => {
  handleFirstInteraction();
});