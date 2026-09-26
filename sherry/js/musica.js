/* ==========================================================================
   AVENTURA MUSICAL DE SNOOPY — musica.js
   Siete niveles, siete canciones y una fotografía que solo se ve completa
   al final. Todo lo editable (imágenes, textos, canciones) está arriba.
   ========================================================================== */

/* ==========================================================================
   1. CONTENIDO EDITABLE
   ========================================================================== */

const SAVE_KEY = "aventuraMusicalSnoopy";
const URL_BOSQUE = "index.html";

const FOTO_FINAL = "https://i.ibb.co/LD6VKNN3/foto.png";
const TOTAL_FRAGMENTOS = 7;

// Todas las imágenes del juego en un solo lugar. Si dejas una vacía (""),
// el juego dibuja automáticamente una versión hecha por código.
const IMAGENES = {
    florAmarilla: "https://i.ibb.co/8D2JVLxg/Chat-GPT-Image-21-sept-2026-08-47-59.png",
    florAzul: "https://i.ibb.co/TBGYRDcN/Chat-GPT-Image-21-sept-2026-08-47-25.png",
    florNaranja: "https://i.ibb.co/Rk0DZDK8/Chat-GPT-Image-21-sept-2026-08-44-51.png",
    florRosa: "https://i.ibb.co/cXg8HjNP/Chat-GPT-Image-21-sept-2026-08-49-23.png",
    maceta: "https://i.ibb.co/qYPM2ZXw/Chat-GPT-Image-21-sept-2026-09-01-01.png",
    almohadaMorada: "https://i.ibb.co/S7xhPXqS/Chat-GPT-Image-21-sept-2026-08-55-29.png",
    almohadaRosa: "https://i.ibb.co/WvfWpn9X/Chat-GPT-Image-21-sept-2026-08-55-21.png",
    bloqueLibros: "https://i.ibb.co/GvmDnWyT/Chat-GPT-Image-21-sept-2026-18-56-47.png",
    piano: "https://i.ibb.co/35Z48Kgx/5bbf71ae040a.png",
    fuente: "https://i.ibb.co/nNq4ySVt/Chat-GPT-Image-21-sept-2026-08-56-58.png",
    radio: "https://i.ibb.co/tTf2LB35/c560930084cd.png",
    roca: "https://i.ibb.co/B5fsxpYf/Chat-GPT-Image-21-sept-2026-19-05-42.png",
    arbusto: "https://i.ibb.co/j9tZ4Tdq/Chat-GPT-Image-21-sept-2026-19-20-49.png",
    // Caja musical decorativa del nivel 3 (distinta del cofre interactivo).
    cajaMusicalDecor: "https://i.ibb.co/gZvtwMDx/647bcbd36799.png",
};

// Las 4 imágenes del cofre de los recuerdos (nivel 3): cerrado, ~25%, ~50%
// y completamente abierto. Se muestran en secuencia rápida al reunir las
// tres piezas, simulando la apertura con fotogramas reales en vez de una
// animación CSS.
const COFRE_ESTADOS = [
    "https://i.ibb.co/FbpDVQnZ/1.png",
    "https://i.ibb.co/3yJykXHH/2.png",
    "https://i.ibb.co/PzjpH1GC/3.png",
    "https://i.ibb.co/27PZ1nc7/4.png",
];

const MENSAJES_CANCIONES = {
    cancion1: "Tú haces que muera mi orgullo, que pierda el control y que solo quiera una cosa: quedarme contigo y sentirte cada vez más cerca de mí.",
    cancion2: "Si pudiera elegir cualquier lugar del universo, te elegiría a ti.",
    cancion3: "Solo mirarte me hace sentir que te encontré por una razón, y cada día descubro una nueva razón para quedarme contigo.",
    cancion4: "Contigo soy feliz, tú le das sentido a mi presente y cuando pienso en mi futuro, te imagino a mi lado.",
    cancion5: "De todas las personas del mundo, qué bonito fue encontrarte a ti. Mi persona favorita, la que ilumina mi vida como una constelación.",
    cancion6: "Ya casi llegamos al final, pero todavía queda un último recuerdo esperando ser descubierto. No te estaba buscando, pero te encontré, y desde entonces mi mundo tiene una luz que antes no conocía.",
    cancion7: "Después de recorrer cada rincón, encontrar cada pista y guardar cada recuerdo, llegó el momento de descubrir lo que estaba esperando al final, porque entre todo lo que la vida nos ha dado, lo más bonito ha sido encontrarnos y descubrir que juntos brillamos mucho más.",
};

const MENSAJE_FINAL = "Cada nivel fue una excusa para contarte lo mismo de siete maneras distintas: me gusta muchísimo caminar la vida contigo.";

const NIVELES = [
    { numero: 1, titulo: "El jardín de los recuerdos", objetivo: "Encuentra la única flor amarilla", cancion: "audio/canciones/cancion.mp3", fondo: "audio/level.mp3", mensaje: MENSAJES_CANCIONES.cancion1 },
    { numero: 2, titulo: "El camino de Snoopy", objetivo: "Toca las piedras en orden, del 1 al 6", cancion: "audio/canciones/cancion2.mp3", fondo: "audio/level1.mp3", mensaje: MENSAJES_CANCIONES.cancion2 },
    { numero: 3, titulo: "La caja de los recuerdos", objetivo: "Encuentra las tres piezas y ábrela", cancion: "audio/canciones/cancion3.mp3", fondo: "audio/level2.mp3", mensaje: MENSAJES_CANCIONES.cancion3 },
    { numero: 4, titulo: "Los recuerdos ocultos", objetivo: "Encuentra las cuatro parejas", cancion: "audio/canciones/cancion4.mp3", fondo: "audio/level3.mp3", mensaje: MENSAJES_CANCIONES.cancion4 },
    { numero: 5, titulo: "La constelación del corazón", objetivo: "Encuentra las doce estrellas del cielo", cancion: "audio/canciones/cancion5.mp3", fondo: "audio/level4.mp3", mensaje: MENSAJES_CANCIONES.cancion5 },
    { numero: 6, titulo: "Las tres pistas", objetivo: "Encuentra las tres pistas", cancion: "audio/canciones/cancion6.mp3", fondo: "audio/level5.mp3", mensaje: MENSAJES_CANCIONES.cancion6 },
    { numero: 7, titulo: "El último recuerdo", objetivo: "Llega al final del laberinto", cancion: "audio/canciones/cancion7.mp3", fondo: "audio/level6.mp3", mensaje: MENSAJES_CANCIONES.cancion7 },
];

const REACCIONES_FALLO = [
    "Aquí no hay nada...",
    "Casi, pero no.",
    "Sigue buscando.",
    "Mmm... no era esto.",
    "Prueba en otro lado.",
];


/* ==========================================================================
   2. ESTADO Y GUARDADO AUTOMÁTICO
   ========================================================================== */

function estadoLimpio() {
    return {
        nivelActual: 1,
        nivelesCompletados: [],
        cancionesDesbloqueadas: [],
        fragmentosObtenidos: [],
        progresoNivel: {},
        juegoCompletado: false,
    };
}

let estadoJuego = estadoLimpio();

function guardar() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(estadoJuego));
    } catch (err) {
        console.warn("No se pudo guardar el progreso:", err);
    }
}

function cargar() {
    try {
        const crudo = localStorage.getItem(SAVE_KEY);
        if (!crudo) return;
        const datos = JSON.parse(crudo);
        if (!datos || typeof datos !== "object") return;

        estadoJuego = {
            nivelActual: Math.min(7, Math.max(1, Number(datos.nivelActual) || 1)),
            nivelesCompletados: Array.isArray(datos.nivelesCompletados) ? datos.nivelesCompletados : [],
            cancionesDesbloqueadas: Array.isArray(datos.cancionesDesbloqueadas) ? datos.cancionesDesbloqueadas : [],
            fragmentosObtenidos: Array.isArray(datos.fragmentosObtenidos) ? datos.fragmentosObtenidos : [],
            progresoNivel: datos.progresoNivel && typeof datos.progresoNivel === "object" ? datos.progresoNivel : {},
            juegoCompletado: datos.juegoCompletado === true,
        };
    } catch (err) {
        console.warn("No se pudo leer el progreso guardado:", err);
    }
}

function progresoDe(nivel) {
    if (!estadoJuego.progresoNivel[nivel]) estadoJuego.progresoNivel[nivel] = {};
    return estadoJuego.progresoNivel[nivel];
}

function tieneFragmento(i) {
    return estadoJuego.fragmentosObtenidos.includes(i);
}


/* ==========================================================================
   3. UTILIDADES
   ========================================================================== */

const $ = (id) => document.getElementById(id);

function nodo(html) {
    const contenedor = document.createElement("div");
    contenedor.innerHTML = html.trim();
    return contenedor.firstElementChild;
}

function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function azar(min, max) { return min + Math.random() * (max - min); }
function azarEntero(max) { return Math.floor(Math.random() * max); }

function mezclar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function formatoTiempo(segundos) {
    if (!isFinite(segundos) || segundos < 0) segundos = 0;
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60);
    return m + ":" + String(s).padStart(2, "0");
}

let temporizadorMensaje = null;
function avisar(texto) {
    const el = $("mensajeFlotante");
    el.textContent = texto;
    el.classList.remove("oculto");
    clearTimeout(temporizadorMensaje);
    temporizadorMensaje = setTimeout(() => el.classList.add("oculto"), 2400);
}


/* ==========================================================================
   3.5. ESTILOS EXTRA (inyectados en JS)
   Todo lo nuevo que necesita CSS propio se agrega aquí mismo, para no
   depender de que musica.css tenga estas clases: así los niveles
   modificados funcionan sin tener que tocar el archivo de estilos.
   ========================================================================== */

function inyectarEstilosMejoras() {
    if ($("estilosMejoras")) return;
    const estilo = document.createElement("style");
    estilo.id = "estilosMejoras";
    estilo.textContent = `
        /* --- Nivel 2: fase de memorización --- */
        .piedra-numerada.oculta .piedra-numero { opacity: 0; transform: scale(.4); }
        .piedra-numerada.memorizando .piedra-numero {
            animation: parpadeoMemoria 900ms ease-in-out infinite;
        }
        @keyframes parpadeoMemoria { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
        .piedra-numerada.revelada .piedra-numero {
            opacity: 1 !important; transform: scale(1.25) !important;
            transition: transform 260ms ease, opacity 200ms ease;
        }
        .piedra-numero { transition: opacity 260ms ease, transform 260ms ease; }

        /* --- Nivel 3: destello de luz al abrir el cofre --- */
        .luz-cofre-estallido {
            position: absolute; left: 50%; top: 42%; width: 40px; height: 40px;
            transform: translate(-50%, -50%) scale(0); border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,.98) 0%, rgba(255,222,150,.85) 28%, rgba(255,200,120,.4) 55%, rgba(255,200,120,0) 75%);
            pointer-events: none; opacity: 0; z-index: 30;
        }
        .luz-cofre-estallido.brillar {
            animation: estallidoLuz 1500ms cubic-bezier(.2,.7,.3,1) forwards;
        }
        @keyframes estallidoLuz {
            0% { opacity: 0; transform: translate(-50%,-50%) scale(0); }
            18% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
            45% { opacity: .95; transform: translate(-50%,-50%) scale(11); }
            100% { opacity: 0; transform: translate(-50%,-50%) scale(15); }
        }
        .rayo-cofre {
            position: absolute; left: 50%; top: 42%; width: 4px; height: 130px;
            background: linear-gradient(180deg, rgba(255,240,200,.95), rgba(255,240,200,0));
            transform-origin: 50% 0%; pointer-events: none; opacity: 0; z-index: 29;
        }
        .rayo-cofre.brillar { animation: rayoCofre 1200ms ease-out forwards; }
        @keyframes rayoCofre {
            0% { opacity: 0; transform: translate(-50%,0) rotate(var(--ang,0deg)) scaleY(.2); }
            25% { opacity: .9; transform: translate(-50%,0) rotate(var(--ang,0deg)) scaleY(1); }
            100% { opacity: 0; transform: translate(-50%,0) rotate(var(--ang,0deg)) scaleY(1.4); }
        }

        /* --- Nivel 5: estrella secreta del centro del corazón --- */
        .estrella-secreta {
            position: absolute; left: 50%; top: 46%; width: 26px; height: 26px;
            transform: translate(-50%,-50%) scale(0); border: 0; background: transparent;
            cursor: pointer; padding: 0; z-index: 25; opacity: 0;
            transition: transform 500ms cubic-bezier(.3,1.6,.4,1), opacity 400ms ease;
        }
        .estrella-secreta.visible { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        .estrella-secreta svg { width: 100%; height: 100%; filter: drop-shadow(0 0 10px rgba(255,220,140,.9)); animation: pulsoSecreta 1100ms ease-in-out infinite; }
        @keyframes pulsoSecreta { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }

        /* --- Nivel 6: pistas que se revelan en orden --- */
        .punto.pista-bloqueada { opacity: 0; pointer-events: none; }
        .punto.pista-senuelo { }

        /* --- Nivel 7: transición de casillas visitadas --- */
        .celda.visitada-camino { }
    `;
    document.head.appendChild(estilo);
}

/* ==========================================================================
   4. SNOOPY (sprite pixelado, reutilizado del bosque)
   ========================================================================== */

const SNOOPY_PERFIL_CUERPO = [
    "....................",
    ".........BBBBB......",
    "........BWWWWWB.....",
    ".......BWWWWWWWB....",
    "....BBBWWWWWWWWWB...",
    "...BWWWWBWWWWBWBB...",
    ".BBWWWWWBWWWBWBBWB..",
    ".BBWWWWWWWWWBWBBBB..",
    "..BWWWWWWWWWBWBBBB..",
    "...BWWWWWWWWBWBBBB..",
    "....BBWWWWWWBWBBBB..",
    "......BBBWWBWBWBB...",
    "........RRR...BB....",
    ".......BWWWB........",
    "......BWWBWB........",
    "......BWWBWB........",
    ".....BWWWBWWB.......",
    ".....BWWWBWWB.......",
    ".....BWWWWBB........",
    "......BWWWWBB.......",
    ".......BWWWWWB......",
];

const SNOOPY_PERFIL_PATAS = [
    ["......BWWWBBBBB.....", ".....BWWWB.BBBBB....", "....BWWWWB..BBBBB...", "...BBBBBBB...BBBBB.."],
    ["......BWWWBBBBB.....", "......BWWWBBBBB.....", "......BWWWBBBBB.....", ".....BBBBBB........."],
    [".....BBBBBWWWB......", "....BBBBB.BWWWB.....", "...BBBBB..BWWWWB....", "..BBBBB...BBBBBBB..."],
    [".....BBBBBWWWB......", ".....BBBBBWWWB......", "....BBBBB.BWWWB.....", "...BBBBBB..........."],
];

const SNOOPY_CABEZA_FRENTE = [
    "....................",
    "....................",
    ".......BBBBBB.......",
    "....BBBWWWWWWBBB....",
    "...BBBBWWWWWWBBBB...",
    "...BBBBWWWWWWBBBB...",
    "...BBBBWBWWBWBBBB...",
    "...BBBBWBWWBWBBBB...",
    "...BBBBWWWWWWBBBB...",
    "....BBBWWBBWWBBB....",
    "....BBBWWBBWWBBB....",
    ".....BBWWWWWWBB.....",
    "......BBBBBBBB......",
];

const SNOOPY_CABEZA_ESPALDA = [
    "....................",
    "....................",
    ".......BBBBBB.......",
    "....BBBWWWWWWBBB....",
    "...BBBBWWWWWWBBBB...",
    "...BBBBWWWWWWBBBB...",
    "...BBBBWWWWWWBBBB...",
    "...BBBBWWWWWWBBBB...",
    "...BBBBWWWWWWBBBB...",
    "....BBBWWWWWWBBB....",
    "....BBBWWWWWWBBB....",
    ".....BBWWWWWWBB.....",
    "......BBBBBBBB......",
];

const SNOOPY_TORSO_FRONTAL = [
    "......RRRRRRRR......",
    ".....BWWWWWWWWB.....",
    ".....BWWWWWWWWB.....",
    ".....BWWWWWWWWB.....",
    ".....BWWWWWWWWB.....",
    ".....BWWWWWWWWB.....",
    "......BWWWWWWB......",
    "......BWWWWWWB......",
];

const SNOOPY_PATAS_FRONTALES = [
    ["......BWWBBWWB......", "......BWWBBWWB......", "......BWWBBBBB......", ".....BBBB..........."],
    ["......BWWBBWWB......", "......BWWBBWWB......", "......BWWBBWWB......", ".....BBBB..BBBB....."],
    ["......BWWBBWWB......", "......BWWBBWWB......", "......BBBBBWWB......", "...........BBBB....."],
    ["......BWWBBWWB......", "......BWWBBWWB......", "......BWWBBWWB......", ".....BBBB..BBBB....."],
];

function armarCuadrosSnoopy(cuerpo, patasPorCuadro, torso) {
    return patasPorCuadro.map((patas) => (torso ? [...cuerpo, ...torso, ...patas] : [...cuerpo, ...patas]));
}

const SNOOPY_FRAMES = {
    izquierda: armarCuadrosSnoopy(SNOOPY_PERFIL_CUERPO, SNOOPY_PERFIL_PATAS),
    derecha: armarCuadrosSnoopy(SNOOPY_PERFIL_CUERPO, SNOOPY_PERFIL_PATAS),
    abajo: armarCuadrosSnoopy(SNOOPY_CABEZA_FRENTE, SNOOPY_PATAS_FRONTALES, SNOOPY_TORSO_FRONTAL),
    arriba: armarCuadrosSnoopy(SNOOPY_CABEZA_ESPALDA, SNOOPY_PATAS_FRONTALES, SNOOPY_TORSO_FRONTAL),
};

const SNOOPY_COLORES = { B: "#33383b", W: "#f2f5f7", R: "#9c1020" };
const SNOOPY_FPS = 7;

const snoopysActivos = new Set();

class Snoopy {
    constructor(canvas, opciones = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.pixel = opciones.pixel || 3;
        this.direccion = opciones.direccion || "abajo";
        this.caminando = false;
        this.ajustarTamano();
        snoopysActivos.add(this);
    }

    ajustarTamano() {
        const dpr = window.devicePixelRatio || 1;
        const ancho = 20 * this.pixel;
        const alto = 25 * this.pixel;
        this.canvas.width = ancho * dpr;
        this.canvas.height = alto * dpr;
        this.canvas.style.width = ancho + "px";
        this.canvas.style.height = alto + "px";
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.ancho = ancho;
        this.alto = alto;
    }

    dibujar(tiempo) {
        const cuadros = SNOOPY_FRAMES[this.direccion] || SNOOPY_FRAMES.abajo;
        const indice = this.caminando ? Math.floor(tiempo * SNOOPY_FPS) % cuadros.length : 1;
        const grilla = cuadros[indice];
        const ctx = this.ctx;
        const p = this.pixel;

        ctx.clearRect(0, 0, this.ancho, this.alto);
        ctx.save();
        if (this.direccion === "derecha") {
            ctx.translate(this.ancho, 0);
            ctx.scale(-1, 1);
        }
        for (let fila = 0; fila < grilla.length; fila++) {
            const linea = grilla[fila];
            for (let col = 0; col < linea.length; col++) {
                const c = linea[col];
                if (c === ".") continue;
                ctx.fillStyle = SNOOPY_COLORES[c];
                ctx.fillRect(col * p, fila * p, p + 0.4, p + 0.4);
            }
        }
        ctx.restore();
    }

    destruir() { snoopysActivos.delete(this); }
}

function bucleSnoopy(ts) {
    const t = ts / 1000;
    for (const s of snoopysActivos) s.dibujar(t);
    requestAnimationFrame(bucleSnoopy);
}
requestAnimationFrame(bucleSnoopy);

function tamanoSnoopy() {
    if (window.innerWidth < 700 || window.innerHeight < 420) return 2.6;
    if (window.innerWidth < 1000) return 3.2;
    return 4;
}

function crearSnoopyEscena(contenedor, opciones = {}) {
    const envoltorio = nodo('<div class="snoopy-escena"><canvas></canvas></div>');
    envoltorio.style.left = (opciones.x != null ? opciones.x : 50) + "%";
    envoltorio.style.bottom = (opciones.y != null ? opciones.y : 14) + "%";
    contenedor.appendChild(envoltorio);

    const sprite = new Snoopy(envoltorio.querySelector("canvas"), {
        pixel: opciones.pixel || tamanoSnoopy(),
        direccion: opciones.direccion,
    });

    let temporizadorGlobo = null;
    let temporizadorClase = null;

    const api = {
        elemento: envoltorio,
        sprite,
        mirar(direccion) { sprite.direccion = direccion; },
        irA(x, y, direccion) {
            if (direccion) sprite.direccion = direccion;
            else sprite.direccion = (parseFloat(envoltorio.style.left) > x) ? "izquierda" : "derecha";
            sprite.caminando = true;
            envoltorio.style.left = x + "%";
            if (y != null) envoltorio.style.bottom = y + "%";
            return esperar(850).then(() => { sprite.caminando = false; });
        },
        celebrar() { api._clase("salta", 640); },
        negar() { api._clase("niega", 540); },
        decir(texto, ms = 2200) {
            clearTimeout(temporizadorGlobo);
            const anterior = envoltorio.querySelector(".globo");
            if (anterior) anterior.remove();

            const globo = nodo('<div class="globo"></div>');
            globo.textContent = texto;
            envoltorio.appendChild(globo);
            ajustarGlobo(globo);

            temporizadorGlobo = setTimeout(() => globo.remove(), ms);
        },
        _clase(clase, ms) {
            clearTimeout(temporizadorClase);
            envoltorio.classList.remove(clase);
            void envoltorio.offsetWidth;
            envoltorio.classList.add(clase);
            temporizadorClase = setTimeout(() => envoltorio.classList.remove(clase), ms);
        },
        destruir() { sprite.destruir(); },
    };

    return api;
}

// Evita que el globo de diálogo se salga por los bordes de la pantalla:
// se mide dónde quedó y se desplaza lo justo para que entre completo.
function ajustarGlobo(globo) {
    requestAnimationFrame(() => {
        if (!globo.isConnected) return;
        const margen = 10;
        const caja = globo.getBoundingClientRect();
        let ajuste = 0;
        if (caja.left < margen) ajuste = margen - caja.left;
        else if (caja.right > window.innerWidth - margen) ajuste = (window.innerWidth - margen) - caja.right;
        if (ajuste !== 0) globo.style.setProperty("--ajuste", Math.round(ajuste) + "px");
    });
}


/* ==========================================================================
   5. AUDIO Y REPRODUCTORES
   ========================================================================== */

const SILENCIO = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=";

// "audio" reproduce la CANCIÓN de recompensa de cada nivel (la que se
// escucha con la frase y el fragmento de foto, y en la pantalla final).
const audio = new Audio();
audio.preload = "auto";
audio.volume = 0.8;
audio.loop = true;

// "audioFondo" reproduce el SONIDO AMBIENTE de cada nivel mientras se
// está jugando (audio/level.mp3, audio/level1.mp3, ...). Es independiente
// de la canción de recompensa: no tiene controles propios ni se mezcla
// con ella (una se detiene cuando empieza la otra).
const audioFondo = new Audio();
audioFondo.preload = "auto";
audioFondo.loop = true;
audioFondo.volume = 0.5;

let audioDesbloqueado = false;
let cancionActual = "";
let fondoActual = "";

function desbloquearAudio() {
    if (audioDesbloqueado) return;
    audioDesbloqueado = true;
    for (const el of [audio, audioFondo]) {
        try {
            el.src = SILENCIO;
            const p = el.play();
            if (p && typeof p.then === "function") {
                p.then(() => { el.pause(); el.currentTime = 0; }).catch(() => {});
            }
        } catch (err) { /* bloqueado por el navegador */ }
    }
}

function reproducirCancion(ruta, autoreproducir = true) {
    if (cancionActual !== ruta) {
        cancionActual = ruta;
        audio.src = ruta;
        audio.load();
    }
    refrescarControles();
    if (!autoreproducir) return;
    const p = audio.play();
    if (p && typeof p.then === "function") p.catch(() => refrescarControles());
}

// Sonido ambiente del nivel: empieza (o cambia) al entrar a un nivel y se
// detiene al salir de él, sin interfaz de controles propia.
function reproducirFondo(ruta) {
    if (!ruta) { audioFondo.pause(); return; }
    if (fondoActual !== ruta) {
        fondoActual = ruta;
        audioFondo.src = ruta;
        audioFondo.load();
    }
    const p = audioFondo.play();
    if (p && typeof p.then === "function") p.catch(() => {});
}

function detenerFondo() {
    audioFondo.pause();
}

const controles = [];

function pintarRango(input) {
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    input.style.setProperty("--relleno", ((input.value - min) / (max - min)) * 100 + "%");
}

function refrescarControles() {
    for (const c of controles) c.refrescar();
}

function crearControl(ids) {
    const btnPlay = $(ids.play);
    const btnReiniciar = $(ids.reiniciar);
    const barra = $(ids.progreso);
    const actual = $(ids.actual);
    const total = $(ids.total);
    const volumen = $(ids.volumen);

    let arrastrando = false;

    btnPlay.addEventListener("click", () => {
        if (!cancionActual) return;
        if (audio.paused) {
            const p = audio.play();
            if (p && typeof p.then === "function") p.catch(() => avisar("Toca de nuevo para reproducir"));
        } else {
            audio.pause();
        }
        refrescarControles();
    });

    btnReiniciar.addEventListener("click", () => {
        audio.currentTime = 0;
        const p = audio.play();
        if (p && typeof p.then === "function") p.catch(() => {});
        refrescarControles();
    });

    barra.addEventListener("input", () => {
        arrastrando = true;
        pintarRango(barra);
        if (isFinite(audio.duration) && audio.duration > 0) {
            actual.textContent = formatoTiempo((barra.value / 1000) * audio.duration);
        }
    });

    barra.addEventListener("change", () => {
        if (isFinite(audio.duration) && audio.duration > 0) {
            audio.currentTime = (barra.value / 1000) * audio.duration;
        }
        arrastrando = false;
    });

    volumen.addEventListener("input", () => {
        audio.volume = volumen.value / 100;
        pintarRango(volumen);
    });

    const control = {
        refrescar() {
            btnPlay.querySelector(".material-symbols-outlined").textContent = audio.paused ? "play_arrow" : "pause";
            const duracion = isFinite(audio.duration) ? audio.duration : 0;
            total.textContent = formatoTiempo(duracion);
            if (!arrastrando) {
                actual.textContent = formatoTiempo(audio.currentTime);
                barra.value = duracion > 0 ? Math.round((audio.currentTime / duracion) * 1000) : 0;
                pintarRango(barra);
            }
            volumen.value = Math.round(audio.volume * 100);
            pintarRango(volumen);
        },
    };

    controles.push(control);
    control.refrescar();
    return control;
}

audio.addEventListener("timeupdate", refrescarControles);
audio.addEventListener("loadedmetadata", refrescarControles);
audio.addEventListener("durationchange", refrescarControles);
audio.addEventListener("play", refrescarControles);
audio.addEventListener("pause", refrescarControles);
audio.addEventListener("ended", refrescarControles);
audio.addEventListener("error", () => {
    if (cancionActual && cancionActual !== SILENCIO) avisar("No se encontró " + cancionActual);
});
audioFondo.addEventListener("error", () => {
    if (fondoActual && fondoActual !== SILENCIO) console.warn("No se encontró el sonido ambiente: " + fondoActual);
});


/* ==========================================================================
   6. FRAGMENTOS DE LA FOTOGRAFÍA
   La foto se mantiene pixelada durante todo el juego: solo se ve nítida
   en la escena final, para que sea sorpresa.
   ========================================================================== */

let proporcionFoto = 4 / 3;

function precargarImagen(url) {
    return new Promise((resolve) => {
        if (!url) { resolve(false); return; }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

async function precargarFoto() {
    const img = await precargarImagen(FOTO_FINAL);
    if (img && img.naturalWidth && img.naturalHeight) {
        proporcionFoto = img.naturalWidth / img.naturalHeight;
        return true;
    }
    return false;
}

// La foto se corta en 7 franjas verticales iguales. El porcentaje de
// background-position se calcula aquí mismo, en JS, y se aplica como
// estilo directo (nada de calc()/var() en CSS): así el primer fragmento
// (índice 0) y todos los demás muestran siempre la franja correcta,
// sin depender de que el navegador resuelva bien esa combinación.
function posicionFragmento(indice) {
    return (indice * (100 / (TOTAL_FRAGMENTOS - 1))).toFixed(4) + "% center";
}

function crearFragmento(indice, estado) {
    const el = nodo('<div class="fragmento"></div>');
    el.style.backgroundImage = 'url("' + FOTO_FINAL + '")';
    el.style.backgroundSize = "700% 100%";
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundPosition = posicionFragmento(indice);
    el.style.setProperty("--i", String(indice));
    el.classList.add(estado);
    return el;
}

function estadoFragmento(numero) {
    if (estadoJuego.juegoCompletado) return "libre";
    return tieneFragmento(numero) ? "pixelado" : "bloqueado";
}

function pintarTiraFragmentos() {
    const tira = $("tiraFragmentos");
    tira.innerHTML = "";
    for (let i = 1; i <= TOTAL_FRAGMENTOS; i++) {
        const s = document.createElement("span");
        if (tieneFragmento(i)) s.classList.add("tiene");
        tira.appendChild(s);
    }
}

function pintarMosaicoProgreso() {
    const mosaico = $("mosaicoProgreso");
    mosaico.innerHTML = "";
    for (let i = 1; i <= TOTAL_FRAGMENTOS; i++) {
        mosaico.appendChild(crearFragmento(i - 1, estadoFragmento(i)));
    }
    const obtenidos = estadoJuego.fragmentosObtenidos.length;
    $("textoProgresoFoto").textContent = obtenidos + " de " + TOTAL_FRAGMENTOS +
        " fragmentos. La fotografía se ve completa al final.";
}


/* ==========================================================================
   7. HUD
   ========================================================================== */

function pintarHud(nivel) {
    $("hud").classList.remove("oculto");
    $("hudNumeroNivel").textContent = String(nivel.numero);
    $("hudTitulo").textContent = nivel.titulo;
    $("hudObjetivo").textContent = nivel.objetivo;
    pintarTiraFragmentos();
}

function actualizarObjetivo(texto) {
    $("hudObjetivo").textContent = texto;
}


/* ==========================================================================
   8. PIEZAS GRÁFICAS
   ========================================================================== */

function svgArbusto(tono = "#4F7A55", tono2 = "#68996B") {
    return `<svg viewBox="0 0 90 64" width="90" height="64">
        <ellipse cx="45" cy="58" rx="34" ry="6" fill="rgba(20,10,35,.22)"/>
        <circle cx="28" cy="38" r="20" fill="${tono}"/>
        <circle cx="60" cy="40" r="18" fill="${tono}"/>
        <circle cx="44" cy="28" r="22" fill="${tono2}"/>
        <circle cx="36" cy="30" r="8" fill="rgba(255,255,255,.14)"/>
    </svg>`;
}

function svgPiedra() {
    return `<svg viewBox="0 0 70 46" width="70" height="46">
        <ellipse cx="35" cy="41" rx="26" ry="5" fill="rgba(20,10,35,.22)"/>
        <path d="M8 38 Q6 18 24 12 Q44 4 58 16 Q68 26 60 38 Z" fill="#B9AFCB"/>
        <path d="M18 34 Q20 20 34 16 Q30 26 26 34 Z" fill="rgba(255,255,255,.35)"/>
    </svg>`;
}

function svgHongo() {
    return `<svg viewBox="0 0 56 56" width="56" height="56">
        <ellipse cx="28" cy="50" rx="18" ry="4" fill="rgba(20,10,35,.2)"/>
        <rect x="23" y="26" width="10" height="24" rx="5" fill="#F3E7D5"/>
        <path d="M4 28 Q8 6 28 6 Q48 6 52 28 Z" fill="#D85B9F"/>
        <circle cx="18" cy="20" r="4" fill="#FFF3E2"/>
        <circle cx="34" cy="16" r="3.4" fill="#FFF3E2"/>
        <circle cx="41" cy="24" r="2.8" fill="#FFF3E2"/>
    </svg>`;
}

function svgRadio() {
    return `<svg viewBox="0 0 96 74" width="96" height="74">
        <ellipse cx="48" cy="70" rx="34" ry="5" fill="rgba(20,10,35,.25)"/>
        <path d="M62 24 L86 6" stroke="#8A6B4A" stroke-width="3" stroke-linecap="round"/>
        <circle cx="87" cy="5" r="3" fill="#FFD27A"/>
        <rect x="10" y="22" width="76" height="44" rx="8" fill="#B0764A"/>
        <rect x="16" y="28" width="38" height="32" rx="6" fill="#3E285E"/>
        <g fill="rgba(255,243,226,.5)">
            <rect x="20" y="33" width="30" height="3" rx="1.5"/>
            <rect x="20" y="41" width="30" height="3" rx="1.5"/>
            <rect x="20" y="49" width="30" height="3" rx="1.5"/>
        </g>
        <circle cx="70" cy="38" r="8" fill="#FFD27A"/>
        <circle cx="70" cy="56" r="6" fill="#F3E7D5"/>
    </svg>`;
}

function svgFarolito() {
    return `<svg viewBox="0 0 44 96" width="44" height="96">
        <rect x="19" y="30" width="6" height="62" rx="3" fill="#463466"/>
        <ellipse cx="22" cy="93" rx="12" ry="4" fill="rgba(20,10,35,.28)"/>
        <path d="M10 28 L22 6 L34 28 Z" fill="#5A4483"/>
        <rect x="12" y="26" width="20" height="18" rx="5" fill="#FFD27A"/>
        <circle cx="22" cy="35" r="24" fill="rgba(255,210,122,.25)"/>
    </svg>`;
}

function svgBrillo(radio = 28) {
    return `<svg viewBox="0 0 ${radio * 2} ${radio * 2}" width="${radio * 2}" height="${radio * 2}">
        <circle cx="${radio}" cy="${radio}" r="${radio - 4}" fill="rgba(255,210,122,.2)"/>
        <circle cx="${radio}" cy="${radio}" r="${radio / 2}" fill="rgba(255,210,122,.55)"/>
    </svg>`;
}

function svgFlorDibujada(color) {
    const petalos = [0, 1, 2, 3, 4, 5].map((i) => {
        const ang = (Math.PI * 2 / 6) * i;
        const x = 30 + Math.cos(ang) * 13;
        const y = 30 + Math.sin(ang) * 13;
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="7" fill="${color}"/>`;
    }).join("");
    return `<svg viewBox="0 0 60 60" width="60" height="60">${petalos}
        <circle cx="30" cy="30" r="7.5" fill="#FFD27A"/></svg>`;
}

function svgPieza(color) {
    return `<svg viewBox="0 0 40 40" width="32" height="32">
        <path d="M20 3 L35 14 L29 33 L11 33 L5 14 Z" fill="${color}" stroke="rgba(62,40,94,.5)" stroke-width="2"/>
        <path d="M20 10 L27 16 L24 27 L20 27 Z" fill="rgba(255,255,255,.4)"/>
    </svg>`;
}

function svgLibrosDibujados() {
    return `<svg viewBox="0 0 90 64" width="90" height="64">
        <rect x="12" y="34" width="66" height="12" rx="3" fill="#D85B9F"/>
        <rect x="16" y="22" width="58" height="12" rx="3" fill="#8E6BB5"/>
        <rect x="20" y="46" width="52" height="12" rx="3" fill="#FFD27A"/>
        <rect x="30" y="12" width="14" height="12" rx="3" fill="#6E9B72"/>
    </svg>`;
}

const CIELOS = {
    atardecer: "radial-gradient(60% 55% at 72% 24%, rgba(255,210,122,.85), rgba(255,160,130,.25) 45%, transparent 70%), linear-gradient(180deg, #7B4E92 0%, #D3739B 42%, #F5A46F 72%, #FFD9A3 100%)",
    bosque: "radial-gradient(70% 60% at 50% 10%, rgba(255,243,226,.5), transparent 60%), linear-gradient(180deg, #A8CBA0 0%, #7FAE82 48%, #4F7A55 100%)",
    habitacion: "linear-gradient(180deg, #7A5546 0%, #9A6E56 45%, #5E4034 100%)",
    noche: "radial-gradient(50% 40% at 78% 16%, rgba(255,243,226,.35), transparent 60%), linear-gradient(180deg, #1B1440 0%, #2E1E56 55%, #41265C 100%)",
    calle: "radial-gradient(60% 45% at 20% 18%, rgba(185,154,217,.4), transparent 60%), linear-gradient(180deg, #141033 0%, #241A4A 60%, #33245A 100%)",
    amanecer: "radial-gradient(55% 50% at 24% 26%, rgba(255,225,170,.9), rgba(255,180,160,.3) 45%, transparent 72%), linear-gradient(180deg, #5E5A9E 0%, #C98BA8 40%, #FFC08D 76%, #FFE7C2 100%)",
    final: "radial-gradient(60% 50% at 50% 20%, rgba(255,210,122,.3), transparent 65%), linear-gradient(180deg, #2A1A4E 0%, #472A66 55%, #6B3F79 100%)",
};

function capaCielo(clave) {
    const div = document.createElement("div");
    div.className = "capa-escena";
    div.style.background = CIELOS[clave];
    return div;
}

function capaColinas(colorLejano, colorCercano, colorSuelo) {
    return `<div class="capa-escena">
        <svg viewBox="0 0 1000 560" preserveAspectRatio="none">
            <path d="M0 330 Q150 270 300 320 Q460 372 620 318 Q790 262 1000 330 L1000 560 L0 560 Z" fill="${colorLejano}"/>
            <path d="M0 396 Q200 350 380 392 Q580 438 760 390 Q880 358 1000 396 L1000 560 L0 560 Z" fill="${colorCercano}"/>
            <rect x="0" y="470" width="1000" height="90" fill="${colorSuelo}"/>
        </svg>
    </div>`;
}

function capaParticulas(color, cantidad = 26) {
    const capa = nodo('<div class="capa-escena capa-particulas"></div>');
    for (let i = 0; i < cantidad; i++) {
        const p = document.createElement("span");
        p.className = "particula";
        p.style.left = azar(0, 100).toFixed(2) + "%";
        p.style.top = azar(8, 92).toFixed(2) + "%";
        p.style.background = color;
        p.style.animationDelay = azar(0, 6).toFixed(2) + "s";
        p.style.animationDuration = azar(5, 11).toFixed(2) + "s";
        const tam = azar(3, 7).toFixed(1);
        p.style.width = tam + "px";
        p.style.height = tam + "px";
        capa.appendChild(p);
    }
    return capa;
}

// Un punto interactivo puede llevar una imagen (si existe) o un dibujo
// hecho por código como respaldo.
function crearPunto(opciones) {
    const boton = nodo('<button class="punto" type="button"></button>');
    boton.style.left = opciones.x + "%";
    boton.style.top = opciones.y + "%";
    if (opciones.img) {
        boton.innerHTML = `<img src="${opciones.img}" alt="" style="width:${opciones.ancho || 90}px">`;
    } else {
        boton.innerHTML = opciones.svg || "";
    }
    boton.setAttribute("aria-label", opciones.etiqueta || "Elemento del escenario");
    return boton;
}

function contador(icono, texto) {
    const el = nodo('<div class="contador-nivel"><span class="material-symbols-outlined"></span><span class="contador-texto"></span></div>');
    el.querySelector(".material-symbols-outlined").textContent = icono;
    el.querySelector(".contador-texto").textContent = texto;
    return el;
}


/* ==========================================================================
   9. NIVELES
   ========================================================================== */

let snoopyActual = null;

function limpiarEscena() {
    if (snoopyActual) { snoopyActual.destruir(); snoopyActual = null; }
    for (const s of Array.from(snoopysActivos)) {
        if (s.canvas && s.canvas.closest("#escena")) s.destruir();
    }
    $("escena").innerHTML = "";
}

function nivelPorNumero(n) { return NIVELES[n - 1]; }

function cargarNivel(n) {
    limpiarEscena();
    $("escenaFinal").classList.add("oculto");
    estadoJuego.nivelActual = n;
    guardar();

    const nivel = nivelPorNumero(n);
    pintarHud(nivel);

    // El sonido ambiente del nivel es independiente de la canción de
    // recompensa: se detiene la canción (por si venía sonando) y empieza
    // (o continúa) el ambiente propio de este nivel, en bucle.
    audio.pause();
    reproducirFondo(nivel.fondo);

    const raiz = nodo('<div class="nivel"></div>');
    $("escena").appendChild(raiz);

    const constructores = {
        1: nivelJardin, 2: nivelPuente, 3: nivelCaja, 4: nivelCartas,
        5: nivelConstelacion, 6: nivelPistas, 7: nivelLaberinto,
    };
    constructores[n](raiz, nivel);
}

function reaccionFallo(punto) {
    punto.classList.remove("error");
    void punto.offsetWidth;
    punto.classList.add("error");
    if (snoopyActual) {
        snoopyActual.negar();
        snoopyActual.decir(REACCIONES_FALLO[azarEntero(REACCIONES_FALLO.length)], 1600);
    }
}

/* ---------- NIVEL 1 — El jardín de los recuerdos ---------- */

// Genera posiciones dentro de la franja de pasto (6%–94% de ancho,
// 64%–92% de alto) que nunca quedan encimadas entre sí: cada tipo de
// objeto tiene un "radio" aproximado en porcentaje, y un punto nuevo solo
// se acepta si su distancia a todos los ya colocados es mayor que la
// suma de sus radios. Así arbustos, rocas, radio y flores quedan siempre
// separados, sin importar cuántos se agreguen. Además se evita por
// completo la franja del camino de tierra (beige) que cruza el pasto, y
// el horizonte/cielo/montaña, para que todo quede realmente sobre el
// césped.
function dentroDelCamino(x, y) {
    // El camino (path beige) va, en coordenadas del viewBox 1000x560,
    // de x:430-560 en y:356 (top% ≈ 63.6%) a x:300-720 en y:560 (top%=100%).
    // Se aproxima como una franja que se ensancha hacia abajo, con un
    // margen extra para cubrir la curvatura de las esquinas.
    if (y < 62) return false;
    const f = Math.min(1, Math.max(0, (y - 63.6) / (100 - 63.6)));
    const xMin = (43 - 13 * f) - 6;
    const xMax = (56 + 16 * f) + 6;
    return x >= xMin && x <= xMax;
}

function generadorLayoutJardin() {
    const colocados = [];

    function cabe(x, y, radio) {
        if (x - radio < 4 || x + radio > 96) return false;
        if (y - radio * 0.6 < 64) return false;
        if (y + radio * 0.6 > 93) return false;
        if (dentroDelCamino(x, y)) return false;
        for (const p of colocados) {
            const dx = x - p.x;
            // La escena tiene perspectiva: un mismo % vertical separa menos
            // visualmente que uno horizontal, así que se pondera más el eje Y.
            const dy = (y - p.y) * 1.9;
            const distancia = Math.sqrt(dx * dx + dy * dy);
            if (distancia < radio + p.radio) return false;
        }
        return true;
    }

    return {
        ubicar(radio, intentosMax = 400) {
            for (let i = 0; i < intentosMax; i++) {
                const x = azar(4, 96);
                const y = azar(64, 92);
                if (cabe(x, y, radio)) {
                    colocados.push({ x, y, radio });
                    return { x: +x.toFixed(1), y: +y.toFixed(1) };
                }
            }
            return null;
        },
        reservar(x, y, radio) { colocados.push({ x, y, radio }); },
    };
}

function nivelJardin(raiz) {
    raiz.appendChild(capaCielo("atardecer"));

    // Horizonte claro y predecible: una montaña lejana decorativa que se
    // queda arriba (nunca se coloca nada sobre ella) y una sola franja de
    // pasto continua desde ahí hasta abajo. Todo lo interactivo se ubica
    // después, dentro de esa franja de pasto (y entre 64% y 92%), lejos
    // del camino de tierra, así ninguna flor queda flotando en el cielo,
    // sobre la montaña o sobre el camino.
    raiz.insertAdjacentHTML("beforeend", `<div class="capa-escena">
        <svg viewBox="0 0 1000 560" preserveAspectRatio="none">
            <path d="M0 80 Q220 20 420 70 Q650 120 1000 50 L1000 230 L0 230 Z" fill="#8E6BB5" opacity=".5"/>
            <path d="M0 250 Q250 210 500 245 Q750 280 1000 240 L1000 560 L0 560 Z" fill="#6C9A6E"/>
            <path d="M0 330 Q250 300 500 328 Q750 352 1000 322 L1000 560 L0 560 Z" fill="#4F7A55"/>
            <path d="M430 356 Q470 440 300 560 L720 560 Q560 448 560 356 Z" fill="#E8C79B"/>
            <path d="M448 362 Q486 440 340 556 L690 556 Q552 450 548 362 Z" fill="#F2D6B0"/>
        </svg>
    </div>`);
    raiz.appendChild(capaParticulas("rgba(255,243,226,.85)", 22));

    snoopyActual = crearSnoopyEscena(raiz, { x: 50, y: 10, direccion: "abajo" });

    const flor = (tipo) => ({ img: IMAGENES[tipo], ancho: 44, etiqueta: "Flor" });
    const layout = generadorLayoutJardin();

    // Primero se reserva un buen lugar para la flor amarilla y el arbusto
    // que la tapa a medias (siempre fuera del camino), así el resto de las
    // flores se coloca alrededor sin taparla del todo ni encimarse con ella.
    let posAmarilla;
    do {
        posAmarilla = { x: azar(20, 80), y: azar(70, 88) };
    } while (dentroDelCamino(posAmarilla.x, posAmarilla.y));
    layout.reservar(posAmarilla.x, posAmarilla.y, 5.5);
    const posArbustoEscondite = { x: posAmarilla.x - 3.5, y: posAmarilla.y + 3 };
    layout.reservar(posArbustoEscondite.x, posArbustoEscondite.y, 9.5);

    // Muchas más flores señuelo que antes: naranja y rosa se repiten mucho
    // porque son las más parecidas en tono al amarillo y al escenario, lo
    // que obliga a mirar con más cuidado. Se redujo un poco su tamaño
    // visual y se aumentó el radio de reserva para que no se encimen.
    const senuelos = [];
    const coloresDecoy = [
        ...Array(8).fill("florNaranja"),
        ...Array(7).fill("florRosa"),
        ...Array(6).fill("florAzul"),
    ];
    for (const tipo of mezclar(coloresDecoy)) {
        const p = layout.ubicar(5.2);
        if (p) senuelos.push({ x: p.x, y: p.y, ...flor(tipo) });
    }

    // Objetos decorativos, también repartidos sin encimarse y un poco más
    // pequeños que antes.
    const decorObjetos = [
        { radio: 8.5, img: IMAGENES.arbusto, ancho: 92, svg: svgArbusto(), etiqueta: "Arbusto" },
        { radio: 8.5, img: IMAGENES.arbusto, ancho: 92, svg: svgArbusto(), etiqueta: "Arbusto" },
        { radio: 7, img: IMAGENES.roca, ancho: 68, svg: svgPiedra(), etiqueta: "Roca" },
        { radio: 7, img: IMAGENES.roca, ancho: 68, svg: svgPiedra(), etiqueta: "Roca" },
        { radio: 4.5, svg: svgHongo(), etiqueta: "Hongo" },
        { radio: 4.5, svg: svgHongo(), etiqueta: "Hongo" },
        { radio: 7.5, img: IMAGENES.radio, ancho: 76, svg: svgRadio(), etiqueta: "Radio" },
    ];
    for (const datos of decorObjetos) {
        const p = layout.ubicar(datos.radio);
        if (p) senuelos.push({ x: p.x, y: p.y, ...datos });
    }

    for (const datos of senuelos) {
        const punto = crearPunto(datos);
        punto.addEventListener("click", () => reaccionFallo(punto));
        raiz.appendChild(punto);
    }

    // Arbusto que "esconde" la flor amarilla, justo detrás de ella.
    const arbustoEscondite = crearPunto({ x: posArbustoEscondite.x, y: posArbustoEscondite.y, img: IMAGENES.arbusto, ancho: 108, svg: svgArbusto(), etiqueta: "Arbusto" });
    arbustoEscondite.style.zIndex = "3";
    arbustoEscondite.addEventListener("click", () => reaccionFallo(arbustoEscondite));
    raiz.appendChild(arbustoEscondite);

    // La única flor amarilla: al lado del arbusto, medio tapada pero visible.
    const amarilla = crearPunto({
        x: posAmarilla.x, y: posAmarilla.y, img: IMAGENES.florAmarilla, ancho: 42,
        svg: svgFlorDibujada("#FFD27A"), etiqueta: "Flor amarilla",
    });
    amarilla.style.zIndex = "4";
    raiz.appendChild(amarilla);

    amarilla.addEventListener("click", async () => {
        amarilla.classList.add("acierto", "encontrado");
        amarilla.style.pointerEvents = "none";
        snoopyActual.mirar("izquierda");
        snoopyActual.celebrar();
        snoopyActual.decir("¡Ahí estaba!", 1800);
        raiz.appendChild(capaParticulas("rgba(255,210,122,.95)", 18));
        await esperar(1500);
        completarNivel(1);
    });

    setTimeout(() => snoopyActual && snoopyActual.decir("Solo una flor es amarilla. Búscala bien.", 3400), 700);
}

/* ---------- NIVEL 2 — Las piedras numeradas ----------
   Dinámica muy simple, sin trial-and-error ni penalizaciones: en la
   escena aparecen 6 piedras, cada una con un número grande (del 1 al 6)
   pintado encima, repartidas por la orilla del río (no en línea recta,
   para que haya que mirar un poco, pero TODAS visibles desde el inicio).
   Solo hay que tocarlas en orden ascendente: primero la piedra con el 1,
   luego la que tiene el 2, y así hasta la 6. Tocar una piedra fuera de
   orden no hace nada malo (no se hunde, no se reinicia): solo indica que
   todavía no es su turno. Snoopy va saltando a cada piedra correcta según
   se toca, y al llegar a la última cruza el río. */

// Ahora son 8 piedras (antes 6) y, para agregar complejidad de verdad sin
// complicar las instrucciones, el número de cada piedra solo se ve unos
// segundos al entrar al nivel: después se oculta y hay que recordar en
// qué piedra estaba cada número antes de poder cruzar.
const PUENTE_TOTAL_PIEDRAS = 8;
const PUENTE_SEGUNDOS_MEMORIA = 5000;

// Posiciones fijas (izquierda%, abajo%) de cada piedra. No están en fila
// para que el jugador tenga que ubicar cada número, pero se ven todas
// desde el principio: no hay nada oculto ni que adivinar (solo el número
// de cada una, durante la fase de memorización).
const PUENTE_POSICIONES = [
    { x: 12, y: 22 }, { x: 32, y: 58 }, { x: 50, y: 18 }, { x: 68, y: 50 },
    { x: 86, y: 24 }, { x: 22, y: 80 }, { x: 58, y: 78 }, { x: 78, y: 66 },
];

function nivelPuente(raiz) {
    raiz.appendChild(capaCielo("bosque"));
    raiz.insertAdjacentHTML("beforeend", capaColinas("#3F6B4C", "#33583F", "#2B4A36"));

    let arboles = "";
    for (const [x, escala] of [[4, 1.1], [13, .9], [88, .95], [96, 1.15]]) {
        arboles += `<g transform="translate(${x * 10} ${520 - 260 * escala}) scale(${escala})">
            <rect x="60" y="180" width="26" height="90" rx="10" fill="#4A3524"/>
            <ellipse cx="73" cy="140" rx="78" ry="74" fill="#3E6B48"/>
            <ellipse cx="46" cy="110" rx="52" ry="48" fill="#4B7E53"/>
        </g>`;
    }
    raiz.insertAdjacentHTML("beforeend", `<div class="capa-escena"><svg viewBox="0 0 1000 560" preserveAspectRatio="none">
        ${arboles}
    </svg></div>`);
    raiz.insertAdjacentHTML("beforeend", '<div class="rio"></div>');
    raiz.appendChild(capaParticulas("rgba(255,243,226,.7)", 14));

    const progreso = progresoDe(2);
    if (!Array.isArray(progreso.orden) || progreso.orden.length !== PUENTE_TOTAL_PIEDRAS) {
        // orden[i] = número que se pinta en la piedra de la posición i.
        progreso.orden = mezclar(Array.from({ length: PUENTE_TOTAL_PIEDRAS }, (_, i) => i + 1));
        progreso.siguiente = 1;
        progreso.memorizado = false;
        guardar();
    }
    if (typeof progreso.siguiente !== "number") progreso.siguiente = 1;
    // Si ya se avanzó algo (por ejemplo, se recargó la página a mitad de
    // partida), no tiene sentido repetir la fase de memorización: seguimos
    // directo a la fase de juego con los números ocultos.
    if (progreso.siguiente > 1) progreso.memorizado = true;

    const marcador = contador("footprint", "Memoriza el orden...");
    raiz.appendChild(marcador);

    const piedras = PUENTE_POSICIONES.map((pos, indice) => {
        const numero = progreso.orden[indice];
        const el = nodo(`<button type="button" class="piedra-numerada oculta"><span class="piedra-numero">${numero}</span></button>`);
        el.style.left = pos.x + "%";
        el.style.bottom = pos.y + "%";
        el.setAttribute("aria-label", "Piedra");
        el.dataset.numero = String(numero);
        if (numero < progreso.siguiente) el.classList.add("hecha");
        raiz.appendChild(el);
        return el;
    });

    function refrescarObjetivo() {
        if (progreso.siguiente > PUENTE_TOTAL_PIEDRAS) {
            marcador.querySelector(".contador-texto").textContent = "¡Cruzaste el río!";
            actualizarObjetivo("Cruzaste el río");
        } else {
            marcador.querySelector(".contador-texto").textContent = "Busca el " + progreso.siguiente;
            actualizarObjetivo("Recuerda dónde estaba el número " + progreso.siguiente + " y tócala");
        }
    }

    // Revela el número real de una piedra por un instante (al fallar, o al
    // acertar), aunque esté en fase "oculta".
    function revelarUnMomento(el, ms = 1100) {
        el.classList.remove("oculta");
        el.classList.add("revelada");
        setTimeout(() => {
            if (!el.classList.contains("hecha")) el.classList.add("oculta");
            el.classList.remove("revelada");
        }, ms);
    }

    function activarJuego() {
        for (const el of piedras) {
            el.classList.remove("memorizando");
            if (!el.classList.contains("hecha")) el.classList.add("oculta");
        }
        progreso.memorizado = true;
        guardar();
        refrescarObjetivo();
        if (snoopyActual) snoopyActual.decir("¿Recuerdas dónde estaba cada número?", 2600);
    }

    piedras.forEach((el) => {
        el.addEventListener("click", async () => {
            if (!progreso.memorizado) return; // todavía en fase de memorización
            const numero = Number(el.dataset.numero);

            if (el.classList.contains("hecha")) return;

            if (numero !== progreso.siguiente) {
                revelarUnMomento(el, 900);
                el.classList.remove("error");
                void el.offsetWidth;
                el.classList.add("error");
                if (snoopyActual) {
                    snoopyActual.negar();
                    snoopyActual.decir("No era esta. Busco el " + progreso.siguiente + ".", 1500);
                }
                return;
            }

            el.classList.remove("oculta");
            el.classList.add("hecha");
            const x = parseFloat(el.style.left);
            const y = parseFloat(el.style.bottom);
            // Snoopy se para literalmente encima de la piedra: se usa la
            // misma posición x/y, con un desplazamiento mínimo hacia arriba
            // (apenas lo justo para que se vea de pie sobre ella, no
            // "cerca" de la piedra).
            if (snoopyActual) {
                await snoopyActual.irA(x, y + 1.5);
                snoopyActual.celebrar();
            }

            progreso.siguiente += 1;
            guardar();
            refrescarObjetivo();

            if (progreso.siguiente > PUENTE_TOTAL_PIEDRAS) {
                if (snoopyActual) snoopyActual.decir("¡Crucé todas de memoria!", 1800);
                await esperar(1400);
                completarNivel(2);
            }
        });
    });

    snoopyActual = crearSnoopyEscena(raiz, { x: 8, y: 12, direccion: "derecha" });

    if (progreso.siguiente > PUENTE_TOTAL_PIEDRAS) {
        for (const el of piedras) el.classList.remove("oculta");
        refrescarObjetivo();
        setTimeout(() => completarNivel(2), 500);
    } else if (progreso.memorizado) {
        refrescarObjetivo();
        setTimeout(() => snoopyActual && snoopyActual.decir("Sigue por donde ibas: busca el " + progreso.siguiente + ".", 3000), 600);
    } else {
        // Fase de memorización: se muestran los números parpadeando unos
        // segundos y luego se ocultan todos a la vez.
        for (const el of piedras) { el.classList.remove("oculta"); el.classList.add("memorizando"); }
        setTimeout(() => snoopyActual && snoopyActual.decir("Memoriza en qué piedra está cada número...", 3200), 400);
        setTimeout(activarJuego, PUENTE_SEGUNDOS_MEMORIA);
    }
}

/* ---------- NIVEL 3 — La caja de los recuerdos ---------- */

const PIEZAS_CAJA = [
    { id: "izquierda", color: "#EFA3C8", etiqueta: "Pieza izquierda" },
    { id: "centro", color: "#FFD27A", etiqueta: "Pieza central" },
    { id: "derecha", color: "#B99AD9", etiqueta: "Pieza derecha" },
];

function nivelCaja(raiz) {
    raiz.appendChild(capaCielo("habitacion"));
    raiz.insertAdjacentHTML("beforeend", `<div class="capa-escena">
        <svg viewBox="0 0 1000 560" preserveAspectRatio="none">
            <rect x="0" y="0" width="1000" height="400" fill="#8A6350"/>
            <rect x="0" y="392" width="1000" height="168" fill="#5E4034"/>
            <rect x="70" y="60" width="200" height="142" rx="10" fill="#3E285E"/>
            <rect x="82" y="72" width="176" height="118" rx="6" fill="#F0A97C"/>
            <circle cx="150" cy="136" r="24" fill="#FFD27A"/>
            <rect x="164" y="72" width="8" height="118" fill="#3E285E"/>
            <rect x="82" y="124" width="176" height="8" fill="#3E285E"/>
            <ellipse cx="500" cy="500" rx="360" ry="54" fill="#7A4E63" opacity=".55"/>
        </svg>
    </div>`);

    const progreso = progresoDe(3);
    if (!Array.isArray(progreso.encontradas)) progreso.encontradas = [];
    if (!Array.isArray(progreso.colocadas)) progreso.colocadas = [];

    // El cofre ahora se abre con 4 fotogramas reales (cerrado → 25% →
    // 50% → abierto) en vez de una animación de tapa hecha con CSS.
    const cofre = nodo(`<div class="cofre">
        <div class="halo-cofre"></div>
        <img class="cofre-img" src="${COFRE_ESTADOS[0]}" alt="Cofre de los recuerdos">
        <div class="luz-cofre-estallido"></div>
    </div>`);
    raiz.appendChild(cofre);
    const cofreImg = cofre.querySelector(".cofre-img");
    const luzCofre = cofre.querySelector(".luz-cofre-estallido");

    async function abrirCofre() {
        for (let i = 1; i < COFRE_ESTADOS.length; i++) {
            await esperar(160);
            cofreImg.src = COFRE_ESTADOS[i];
        }
        cofre.classList.add("abierto");

        // Al llegar al último fotograma (cofre abierto), sale un destello
        // de luz junto con unos rayos que se disparan hacia afuera.
        for (let i = 0; i < 8; i++) {
            const rayo = document.createElement("div");
            rayo.className = "rayo-cofre";
            rayo.style.setProperty("--ang", (i * 45) + "deg");
            rayo.style.animationDelay = (i * 35) + "ms";
            cofre.appendChild(rayo);
        }
        void cofre.offsetWidth;
        luzCofre.classList.add("brillar");
        cofre.querySelectorAll(".rayo-cofre").forEach((r) => r.classList.add("brillar"));
        await esperar(650);
    }

    // Todo en el piso de la habitación (nunca sobre la pared ni el cuadro),
    // repartido con el mismo criterio "sin encimarse" del jardín: cada
    // objeto reserva un radio aproximado y solo se coloca si no choca con
    // los que ya están puestos. Se amplió la franja de piso disponible y
    // se redujo un poco el tamaño de cada objeto, para que quede espacio
    // real entre ellos.
    const colocadosCuarto = [];
    function ubicarEnPiso(radio) {
        for (let intento = 0; intento < 400; intento++) {
            const x = azar(6, 94);
            const y = azar(70, 94);
            let choca = false;
            for (const p of colocadosCuarto) {
                const dx = x - p.x, dy = (y - p.y) * 2.2;
                if (Math.sqrt(dx * dx + dy * dy) < radio + p.radio) { choca = true; break; }
            }
            if (!choca) {
                colocadosCuarto.push({ x, y, radio });
                return { x: +x.toFixed(1), y: +y.toFixed(1) };
            }
        }
        return null;
    }

    const escondites = [
        { id: "izquierda", radio: 7.5, img: IMAGENES.almohadaRosa, ancho: 90, etiqueta: "Almohada rosa" },
        { id: "centro", radio: 6.5, img: IMAGENES.maceta, ancho: 82, etiqueta: "Maceta" },
        { id: "derecha", radio: 7.5, img: IMAGENES.bloqueLibros, ancho: 90, etiqueta: "Libros" },
    ].map((e, i) => { const p = ubicarEnPiso(e.radio) || { x: 15 + i * 30, y: 85 }; return { ...e, x: p.x, y: p.y }; });

    const vacios = [
        { radio: 7.5, img: IMAGENES.almohadaMorada, ancho: 90, etiqueta: "Almohada morada" },
        { radio: 8.5, img: IMAGENES.piano, ancho: 116, etiqueta: "Piano" },
        { radio: 5.5, img: IMAGENES.cajaMusicalDecor, ancho: 78, etiqueta: "Caja musical" },
    ].map((v, i) => { const p = ubicarEnPiso(v.radio) || { x: 30 + i * 25, y: 89 }; return { ...v, x: p.x, y: p.y }; });

    const inventario = nodo('<div class="inventario"></div>');
    const casillas = {};
    PIEZAS_CAJA.forEach((p) => {
        const casilla = nodo(`<button type="button" class="pieza-inventario" data-id="${p.id}"></button>`);
        casilla.setAttribute("aria-label", p.etiqueta);
        casillas[p.id] = casilla;
        inventario.appendChild(casilla);
    });
    raiz.appendChild(inventario);

    const marcador = contador("inventory_2", "0/3");
    raiz.appendChild(marcador);

    function refrescar() {
        for (const p of PIEZAS_CAJA) {
            const casilla = casillas[p.id];
            const encontrada = progreso.encontradas.includes(p.id);
            const colocada = progreso.colocadas.includes(p.id);
            casilla.innerHTML = encontrada ? svgPieza(p.color) : "";
            casilla.classList.toggle("llena", encontrada && !colocada);
            casilla.classList.toggle("colocada", colocada);
        }
        marcador.querySelector(".contador-texto").textContent = progreso.colocadas.length + "/3";
        const faltan = 3 - progreso.encontradas.length;
        actualizarObjetivo(faltan > 0
            ? "Busca " + faltan + (faltan === 1 ? " pieza más" : " piezas más")
            : "Coloca las piezas en la caja");
    }

    for (const datos of escondites) {
        const punto = crearPunto(datos);
        raiz.appendChild(punto);
        if (progreso.encontradas.includes(datos.id)) punto.classList.add("encontrado");
        punto.addEventListener("click", () => {
            if (progreso.encontradas.includes(datos.id)) { reaccionFallo(punto); return; }
            progreso.encontradas.push(datos.id);
            guardar();
            punto.classList.add("acierto", "encontrado");
            snoopyActual.celebrar();
            snoopyActual.decir("¡Una pieza!", 1500);
            refrescar();
            avisar("Pieza encontrada: tócala abajo para ponerla en la caja");
        });
    }

    for (const datos of vacios) {
        const punto = crearPunto(datos);
        raiz.appendChild(punto);
        punto.addEventListener("click", () => reaccionFallo(punto));
    }

    inventario.addEventListener("click", async (e) => {
        const casilla = e.target.closest(".pieza-inventario");
        if (!casilla) return;
        const id = casilla.dataset.id;
        if (!progreso.encontradas.includes(id) || progreso.colocadas.includes(id)) return;

        progreso.colocadas.push(id);
        guardar();
        refrescar();
        snoopyActual.celebrar();

        if (progreso.colocadas.length === 3) {
            await esperar(300);
            snoopyActual.decir("Se abrió...", 2000);
            await abrirCofre();
            await esperar(1200);
            completarNivel(3);
        }
    });

    snoopyActual = crearSnoopyEscena(raiz, { x: 48, y: 8, direccion: "abajo" });
    refrescar();

    if (progreso.colocadas.length === 3) {
        setTimeout(async () => { await abrirCofre(); await esperar(1000); completarNivel(3); }, 500);
    } else {
        setTimeout(() => snoopyActual && snoopyActual.decir("La caja necesita tres piezas escondidas aquí.", 3600), 700);
    }
}

/* ---------- NIVEL 4 — Los recuerdos ocultos (4 parejas) ---------- */

const CARAS_CARTAS = {
    A: `<svg viewBox="0 0 60 60">${svgFlorDibujada("#EFA3C8").replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>`,
    B: `<svg viewBox="0 0 60 60"><path d="M40 8 A22 22 0 1 0 52 36 A17 17 0 1 1 40 8 Z" fill="#B99AD9"/><circle cx="48" cy="14" r="3" fill="#FFD27A"/></svg>`,
    C: `<svg viewBox="0 0 60 60"><path d="M24 44 V14 L46 9 V38" stroke="#68458F" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="18" cy="45" r="7" fill="#68458F"/><circle cx="40" cy="40" r="7" fill="#68458F"/></svg>`,
    D: `<svg viewBox="0 0 60 60"><path d="M30 52 C6 36 8 14 22 12 C28 11 30 16 30 18 C30 16 32 11 38 12 C52 14 54 36 30 52 Z" fill="#D85B9F"/></svg>`,
    // Estrella (nueva).
    E: `<svg viewBox="0 0 60 60"><path d="M30 6 L36.5 23.5 L55 24.5 L40.5 36 L45.5 54 L30 43.5 L14.5 54 L19.5 36 L5 24.5 L23.5 23.5 Z" fill="#FFD27A" stroke="rgba(154,110,20,.4)" stroke-width="1.5"/></svg>`,
    // Hueso de perro (nueva; le queda perfecto al tema de Snoopy).
    F: `<svg viewBox="0 0 60 60"><path d="M12 24 C6 24 4 32 9 34 C4 36 6 44 12 44 C15 44 17 42 18 39 L42 39 C43 42 45 44 48 44 C54 44 56 36 51 34 C56 32 54 24 48 24 C45 24 43 26 42 29 L18 29 C17 26 15 24 12 24 Z" fill="#F3E7D5" stroke="rgba(120,100,80,.4)" stroke-width="1.5"/></svg>`,
    // Nota musical (nueva).
    G: `<svg viewBox="0 0 60 60"><circle cx="16" cy="46" r="8" fill="#6E9B72"/><circle cx="38" cy="40" r="8" fill="#6E9B72"/><rect x="23" y="14" width="4" height="32" fill="#6E9B72"/><rect x="45" y="10" width="4" height="30" fill="#6E9B72"/><path d="M23 14 L49 10 L49 18 L23 22 Z" fill="#6E9B72"/></svg>`,
};

// Cuántas parejas tiene el memorama: antes eran 4 (8 cartas), ahora 6
// (12 cartas), usando todas las figuras definidas arriba.
const CARTAS_TOTAL_PAREJAS = 6;
const CARTAS_LETRAS = Object.keys(CARAS_CARTAS).slice(0, CARTAS_TOTAL_PAREJAS);

function nivelCartas(raiz) {
    raiz.appendChild(capaCielo("noche"));
    raiz.insertAdjacentHTML("beforeend", capaColinas("#2F2159", "#3A2A5F", "#2A1D48"));
    raiz.insertAdjacentHTML("beforeend", `<div class="capa-escena"><svg viewBox="0 0 1000 560" preserveAspectRatio="none">
        <g fill="#241A44">
            <ellipse cx="90" cy="300" rx="80" ry="86"/><rect x="78" y="330" width="22" height="110"/>
            <ellipse cx="910" cy="290" rx="86" ry="90"/><rect x="898" y="320" width="22" height="120"/>
        </g>
        <circle cx="820" cy="76" r="32" fill="#FFF3E2" opacity=".9"/>
        <circle cx="806" cy="68" r="28" fill="#2E1E56"/>
    </svg></div>`);
    for (const x of [8, 92]) {
        const farola = nodo('<div class="decor-farola"></div>');
        farola.style.left = x + "%";
        farola.innerHTML = svgFarolito();
        raiz.appendChild(farola);
    }
    raiz.appendChild(capaParticulas("rgba(255,210,122,.9)", 22));

    const progreso = progresoDe(4);
    if (!Array.isArray(progreso.parejas)) progreso.parejas = [];

    const valores = mezclar(CARTAS_LETRAS.flatMap((letra) => [letra, letra]));
    const mesa = nodo('<div class="mesa-cartas"></div>');
    const marcador = contador("style", progreso.parejas.length + "/" + CARTAS_TOTAL_PAREJAS);

    let primera = null;
    let bloqueado = false;

    valores.forEach((valor, indice) => {
        const carta = nodo(`<button type="button" class="carta" data-valor="${valor}">
            <div class="carta-interior">
                <div class="carta-cara carta-reverso"></div>
                <div class="carta-cara carta-frente">${CARAS_CARTAS[valor]}</div>
            </div>
        </button>`);
        carta.setAttribute("aria-label", "Carta " + (indice + 1));
        if (progreso.parejas.includes(valor)) carta.classList.add("resuelta");

        carta.addEventListener("click", async () => {
            if (bloqueado) return;
            if (carta.classList.contains("resuelta") || carta.classList.contains("volteada")) return;

            carta.classList.add("volteada");
            if (!primera) { primera = carta; return; }

            bloqueado = true;
            const iguales = primera.dataset.valor === carta.dataset.valor;
            await esperar(620);

            if (iguales) {
                primera.classList.add("resuelta");
                carta.classList.add("resuelta");
                primera.classList.remove("volteada");
                carta.classList.remove("volteada");
                if (!progreso.parejas.includes(valor)) progreso.parejas.push(valor);
                guardar();
                snoopyActual.celebrar();
                snoopyActual.decir("¡Van juntas!", 1500);
            } else {
                primera.classList.remove("volteada");
                carta.classList.remove("volteada");
                snoopyActual.negar();
            }

            primera = null;
            bloqueado = false;

            const encontradas = progreso.parejas.length;
            marcador.querySelector(".contador-texto").textContent = encontradas + "/" + CARTAS_TOTAL_PAREJAS;
            actualizarObjetivo(encontradas + " de " + CARTAS_TOTAL_PAREJAS + " parejas encontradas");

            if (encontradas === CARTAS_TOTAL_PAREJAS) {
                await esperar(900);
                completarNivel(4);
            }
        });

        mesa.appendChild(carta);
    });

    raiz.appendChild(mesa);
    raiz.appendChild(marcador);

    snoopyActual = crearSnoopyEscena(raiz, { x: 8, y: 10, direccion: "derecha" });
    setTimeout(() => snoopyActual && snoopyActual.decir(CARTAS_TOTAL_PAREJAS + " parejas entre " + (CARTAS_TOTAL_PAREJAS * 2) + " cartas.", 3000), 700);
}

/* ---------- NIVEL 5 — Las estrellas del corazón ----------
   Dinámica simple, igual de fácil que buscar la flor amarilla o las
   pistas: en el cielo hay doce estrellas que brillan; hay que tocarlas
   TODAS, en cualquier orden (no importa cuál primero). Cada estrella
   tocada se queda encendida. Cuando ya se encontraron las doce, solas se
   conectan formando un corazón, como sorpresa, y el nivel se completa. No
   hay que adivinar ningún orden: solo encontrar y tocar cada estrella. */

// Estos 12 puntos SÍ trazan un corazón real: el punto del centro-arriba
// (el "valle" entre los dos lóbulos) tiene un y MAYOR que los picos de
// cada lóbulo, es decir, queda más abajo que ellos (en pantalla, y crece
// hacia abajo). Antes el punto central estaba más arriba que los picos,
// lo que dibujaba una figura con una punta en el medio en vez del hueco
// característico del corazón.
const CONSTELACION_PUNTOS = [
    { x: 50, y: 76 },  // punta inferior del corazón
    { x: 34, y: 64 },
    { x: 22, y: 52 },
    { x: 18, y: 40 },  // pico exterior del lóbulo izquierdo
    { x: 24, y: 29 },
    { x: 36, y: 26 },
    { x: 50, y: 38 },  // valle central: más abajo que los dos picos (26/29)
    { x: 64, y: 26 },
    { x: 76, y: 29 },  // pico exterior del lóbulo derecho
    { x: 82, y: 40 },
    { x: 78, y: 52 },
    { x: 66, y: 64 },
];

function nivelConstelacion(raiz) {
    raiz.appendChild(capaCielo("noche"));
    raiz.insertAdjacentHTML("beforeend", `<div class="capa-escena"><svg viewBox="0 0 1000 560" preserveAspectRatio="none">
        <g fill="#241A44">
            <ellipse cx="60" cy="440" rx="90" ry="96"/><rect x="46" y="470" width="24" height="120"/>
            <ellipse cx="940" cy="450" rx="90" ry="96"/><rect x="926" y="480" width="24" height="120"/>
        </g>
        <path d="M0 470 Q500 440 1000 470 L1000 560 L0 560 Z" fill="#1B1440"/>
    </svg></div>`);

    // Estrellas de fondo, solo decorativas (no interactivas).
    const fondo = nodo('<div class="capa-escena capa-particulas"></div>');
    for (let i = 0; i < 40; i++) {
        const e = document.createElement("span");
        e.className = "estrella estrella-fondo";
        e.style.left = azar(0, 100).toFixed(2) + "%";
        e.style.top = azar(0, 78).toFixed(2) + "%";
        e.style.animationDelay = azar(0, 3.4).toFixed(2) + "s";
        fondo.appendChild(e);
    }
    raiz.appendChild(fondo);

    // El trazo del corazón se dibuja solo, y solo al final, cuando ya se
    // encontraron todas las estrellas: es la sorpresa, no la mecánica.
    // Se fuerza con estilos en línea (position/inset/tamaño explícitos)
    // que cubran exactamente el mismo lienzo 0-100% donde están las
    // estrellas, para que el corazón se dibuje justo donde ellas están
    // (y no recortado hacia abajo de la pantalla).
    const svgTrazo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgTrazo.setAttribute("viewBox", "0 0 100 100");
    svgTrazo.setAttribute("preserveAspectRatio", "none");
    svgTrazo.setAttribute("width", "100%");
    svgTrazo.setAttribute("height", "100%");
    svgTrazo.classList.add("capa-escena", "trazo-corazon");
    svgTrazo.style.position = "absolute";
    svgTrazo.style.inset = "0";
    svgTrazo.style.left = "0";
    svgTrazo.style.top = "0";
    svgTrazo.style.right = "0";
    svgTrazo.style.bottom = "0";
    svgTrazo.style.width = "100%";
    svgTrazo.style.height = "100%";
    svgTrazo.style.margin = "0";
    svgTrazo.style.opacity = "0";
    svgTrazo.style.transition = "opacity 400ms ease";
    svgTrazo.style.pointerEvents = "none";
    const rutaSvg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // Estilo puesto directamente en el elemento (en vez de depender de una
    // clase CSS externa) para asegurar que el trazo se vea siempre bien,
    // sin importar qué reglas tenga musica.css para ".trazo-corazon".
    rutaSvg.setAttribute("fill", "none");
    rutaSvg.setAttribute("stroke", "#FF9BC0");
    rutaSvg.setAttribute("stroke-width", "1.6");
    rutaSvg.setAttribute("stroke-linecap", "round");
    rutaSvg.setAttribute("stroke-linejoin", "round");
    rutaSvg.setAttribute("vector-effect", "non-scaling-stroke");
    rutaSvg.style.filter = "drop-shadow(0 0 6px rgba(255,155,192,.85))";
    svgTrazo.appendChild(rutaSvg);
    raiz.appendChild(svgTrazo);

    // Relleno tenue que aparece cuando el corazón se cierra, para que se
    // note de inmediato que la figura es un corazón y no solo líneas.
    const rellenoSvg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    rellenoSvg.setAttribute("fill", "rgba(255,155,192,.16)");
    rellenoSvg.setAttribute("stroke", "none");
    svgTrazo.insertBefore(rellenoSvg, rutaSvg);

    const progreso = progresoDe(5);
    if (!Array.isArray(progreso.encontradas)) progreso.encontradas = [];

    const total = CONSTELACION_PUNTOS.length;
    const marcador = contador("favorite", progreso.encontradas.length + "/" + total);
    raiz.appendChild(marcador);

    // Bonus creativo: al cerrarse el corazón aparece, justo en su centro,
    // una estrella secreta y más brillante que las demás. Solo se puede
    // ver y tocar después de completar la constelación, como un último
    // "deseo" antes de terminar el nivel.
    const estrellaSecreta = nodo(`<button type="button" class="estrella-secreta" aria-label="Estrella secreta">
        <svg viewBox="0 0 40 40"><path d="M20 2 L25 15 L39 16 L28 25 L32 39 L20 30 L8 39 L12 25 L1 16 L15 15 Z" fill="#FFE9B0"/></svg>
    </button>`);
    raiz.appendChild(estrellaSecreta);
    let secretaResuelta = !!progreso.secretoResuelto;
    estrellaSecreta.addEventListener("click", async () => {
        if (secretaResuelta) return;
        secretaResuelta = true;
        progreso.secretoResuelto = true;
        guardar();
        estrellaSecreta.classList.remove("visible");
        if (snoopyActual) {
            snoopyActual.celebrar();
            snoopyActual.decir("¡Pediste un deseo!", 1800);
        }
        raiz.appendChild(capaParticulas("rgba(255,233,176,.95)", 22));
        await esperar(1600);
        completarNivel(5);
    });

    const estrellas = CONSTELACION_PUNTOS.map((p, indice) => {
        const el = nodo('<button type="button" class="estrella-interactiva"><span class="estrella-punta"></span></button>');
        el.style.left = p.x + "%";
        el.style.top = p.y + "%";
        el.setAttribute("aria-label", "Estrella");
        if (progreso.encontradas.includes(indice)) el.classList.add("hecha");
        raiz.appendChild(el);
        return el;
    });

    function refrescar() {
        marcador.querySelector(".contador-texto").textContent = progreso.encontradas.length + "/" + total;
        actualizarObjetivo("Encuentra las " + total + " estrellas del cielo (" + progreso.encontradas.length + "/" + total + ")");
    }

    async function dibujarCorazon() {
        let d = "M " + CONSTELACION_PUNTOS[0].x + " " + CONSTELACION_PUNTOS[0].y;
        rutaSvg.setAttribute("d", d);
        svgTrazo.classList.add("visible");
        svgTrazo.style.opacity = "1";
        for (let i = 1; i < CONSTELACION_PUNTOS.length; i++) {
            d += " L " + CONSTELACION_PUNTOS[i].x + " " + CONSTELACION_PUNTOS[i].y;
            rutaSvg.setAttribute("d", d);
            await esperar(110);
        }
        const dCerrado = d + " Z";
        rutaSvg.setAttribute("d", dCerrado);
        svgTrazo.classList.add("cerrado");
        rellenoSvg.setAttribute("d", dCerrado);
        rellenoSvg.style.transition = "opacity 900ms ease";
        rellenoSvg.style.opacity = "0";
        void rellenoSvg.getBBox && rellenoSvg.getBBox();
        rellenoSvg.style.opacity = "1";
    }

    estrellas.forEach((el, indice) => {
        el.addEventListener("click", async () => {
            if (progreso.encontradas.includes(indice)) return;

            progreso.encontradas.push(indice);
            guardar();
            el.classList.add("hecha");
            if (snoopyActual) {
                snoopyActual.celebrar();
                snoopyActual.decir("¡Una estrella!", 1200);
            }
            refrescar();

            if (progreso.encontradas.length === total) {
                await esperar(500);
                if (snoopyActual) snoopyActual.decir("Mira lo que dibujan juntas...", 2200);
                await dibujarCorazon();
                await esperar(300);
                if (snoopyActual) snoopyActual.decir("Una estrella más quiere salir del centro...", 2400);
                estrellaSecreta.classList.add("visible");
            }
        });
    });

    snoopyActual = crearSnoopyEscena(raiz, { x: 12, y: 8, direccion: "derecha" });
    refrescar();

    if (secretaResuelta) {
        setTimeout(() => completarNivel(5), 400);
    } else if (progreso.encontradas.length === total) {
        (async () => {
            await dibujarCorazon();
            await esperar(500);
            estrellaSecreta.classList.add("visible");
            if (snoopyActual) snoopyActual.decir("Toca la estrella del centro para terminar.", 3200);
        })();
    } else {
        setTimeout(() => snoopyActual && snoopyActual.decir("Encuentra las " + total + " estrellas del cielo, en el orden que quieras.", 3800), 700);
    }
}

/* ---------- NIVEL 6 — Las tres pistas ---------- */

function nivelPistas(raiz) {
    raiz.appendChild(capaCielo("amanecer"));
    raiz.insertAdjacentHTML("beforeend", capaColinas("#9E7BA8", "#7E9A70", "#6F8F66"));
    raiz.insertAdjacentHTML("beforeend", `<div class="capa-escena"><svg viewBox="0 0 1000 560" preserveAspectRatio="none">
        <circle cx="240" cy="120" r="52" fill="#FFE9B0"/>
        <circle cx="240" cy="120" r="78" fill="rgba(255,225,160,.35)"/>
        <ellipse cx="500" cy="470" rx="440" ry="120" fill="#E8D6B8"/>
        <ellipse cx="500" cy="470" rx="340" ry="92" fill="#F2E3C8"/>
        <g stroke="#D9C4A0" stroke-width="3" fill="none">
            <ellipse cx="500" cy="470" rx="250" ry="66"/><ellipse cx="500" cy="470" rx="160" ry="42"/>
        </g>
        <g transform="translate(150 350)">
            <rect x="0" y="40" width="150" height="14" rx="6" fill="#9A6E4A"/>
            <rect x="0" y="6" width="150" height="12" rx="6" fill="#B07F55"/>
            <rect x="6" y="52" width="10" height="34" rx="4" fill="#6F4B31"/>
            <rect x="134" y="52" width="10" height="34" rx="4" fill="#6F4B31"/>
        </g>
        <g transform="translate(760 400)">
            <ellipse cx="60" cy="50" rx="110" ry="30" fill="#6E9B72"/>
            <circle cx="20" cy="36" r="9" fill="#EFA3C8"/><circle cx="56" cy="26" r="8" fill="#FFD27A"/>
            <circle cx="92" cy="38" r="9" fill="#B99AD9"/><circle cx="126" cy="30" r="8" fill="#EFA3C8"/>
        </g>
    </svg></div>`);

    if (IMAGENES.fuente) {
        const fuente = nodo(`<img class="fuente-imagen" src="${IMAGENES.fuente}" alt="">`);
        raiz.appendChild(fuente);
    }
    raiz.appendChild(capaParticulas("rgba(255,243,226,.8)", 20));

    const progreso = progresoDe(6);
    if (!Array.isArray(progreso.pistas)) progreso.pistas = [];

    // Complejidad nueva: las pistas ya no están todas disponibles desde el
    // principio. Hay que encontrarlas EN ORDEN, y cada una, al leerse, dice
    // en qué parte de la escena aparece la siguiente (sin marcarla con un
    // brillo hasta ese momento). Además hay un par de brillos falsos,
    // parecidos a los de verdad, que no llevan a ninguna pista.
    const pistas = [
        { id: "banco", x: 19, y: 68, etiqueta: "Pista junto al banco", texto: "Junto al banco había algo... la siguiente pista brilla cerca del agua." },
        { id: "fuente", x: 50, y: 54, etiqueta: "Pista en la fuente", texto: "En la fuente. La última no está en el suelo: mira hacia arriba, hacia el sol." },
        { id: "sol", x: 24, y: 21, etiqueta: "Pista en el sol", texto: "La última estaba en el sol. ¡Ya tienes las tres!" },
    ];

    const marcador = contador("search", "1/3");
    raiz.appendChild(marcador);

    function refrescar() {
        marcador.querySelector(".contador-texto").textContent = progreso.pistas.length + "/3";
        if (progreso.pistas.length >= pistas.length) {
            actualizarObjetivo("Encontraste las 3 pistas");
        } else {
            actualizarObjetivo("Pista " + (progreso.pistas.length + 1) + " de 3: sigue lo que te dijo la anterior");
        }
    }

    const elementosPista = pistas.map((datos) => {
        const punto = crearPunto({ x: datos.x, y: datos.y, svg: svgBrillo(30), etiqueta: datos.etiqueta });
        punto.classList.add("pista", "pista-bloqueada");
        if (progreso.pistas.includes(datos.id)) punto.classList.remove("pista-bloqueada");
        if (progreso.pistas.includes(datos.id)) punto.classList.add("encontrado", "pista-lista");
        raiz.appendChild(punto);

        punto.addEventListener("click", async () => {
            if (punto.classList.contains("pista-bloqueada")) return;
            if (progreso.pistas.includes(datos.id)) { reaccionFallo(punto); return; }
            progreso.pistas.push(datos.id);
            guardar();
            punto.classList.add("acierto", "encontrado", "pista-lista");
            snoopyActual.celebrar();
            snoopyActual.decir(datos.texto, 3200);
            refrescar();
            desbloquearSiguiente();

            if (progreso.pistas.length === pistas.length) {
                await esperar(2200);
                avisar("Queda un último nivel");
                await esperar(900);
                completarNivel(6);
            }
        });
        return punto;
    });

    // Desbloquea (hace visible y clicable) solo la siguiente pista de la
    // lista, en orden. Las que siguen después de esa permanecen invisibles.
    function desbloquearSiguiente() {
        const indiceSiguiente = progreso.pistas.length;
        if (indiceSiguiente < elementosPista.length) {
            elementosPista[indiceSiguiente].classList.remove("pista-bloqueada");
        }
    }

    // Un par de brillos señuelo, muy parecidos a las pistas reales, para
    // que no baste con tocar "lo primero que brilla".
    const senuelosBrillo = [
        { x: 78, y: 60, etiqueta: "Brillo del rocío" },
        { x: 40, y: 82, etiqueta: "Reflejo en el pasto" },
    ];
    for (const datos of senuelosBrillo) {
        const punto = crearPunto({ x: datos.x, y: datos.y, svg: svgBrillo(24), etiqueta: datos.etiqueta });
        punto.classList.add("pista", "pista-senuelo");
        punto.addEventListener("click", () => reaccionFallo(punto));
        raiz.appendChild(punto);
    }

    snoopyActual = crearSnoopyEscena(raiz, { x: 64, y: 10, direccion: "izquierda" });
    refrescar();
    desbloquearSiguiente();
    setTimeout(() => snoopyActual && snoopyActual.decir("Busca la primera pista. Cada una te dirá dónde está la siguiente.", 3800), 700);
}

/* ---------- NIVEL 7 — El laberinto del último recuerdo ----------
   Movimiento en línea recta, varias casillas a la vez: al tocar una
   casilla que esté en la misma fila o columna que Snoopy, avanza solo,
   paso a paso, en esa dirección, hasta llegar exactamente a la casilla
   tocada. Si en el camino se topa con un muro antes de llegar, se detiene
   justo ahí (no puede pasar de largo). Tocar una casilla que no esté en
   línea recta con Snoopy no lo mueve: solo produce un pequeño rechazo
   visual. Así se conserva la idea de recorrer el laberinto de verdad,
   pero sin tener que tocar cada casilla una por una. */

// El laberinto ahora se genera con un algoritmo de "backtracking"
// recursivo (el mismo método clásico para generar laberintos perfectos):
// se arrancan celdas de una cuadrícula y se van "tallando" pasillos entre
// vecinas sin visitar, eligiendo el orden al azar. El resultado es un
// laberinto SIN loops, con callejones sin salida reales y un único camino
// posible entre el inicio y la meta — a diferencia del laberinto fijo
// anterior, donde casi cualquier ruta terminaba llegando a la salida.
const LABERINTO_CELDAS_ANCHO = 7;
const LABERINTO_CELDAS_ALTO = 6;

function generarLaberinto(celdasAncho, celdasAlto) {
    const anchoGrid = celdasAncho * 2 + 1;
    const altoGrid = celdasAlto * 2 + 1;
    const grid = Array.from({ length: altoGrid }, () => new Array(anchoGrid).fill("#"));
    const visitado = Array.from({ length: celdasAlto }, () => new Array(celdasAncho).fill(false));

    function tallar(cx, cy) {
        visitado[cy][cx] = true;
        grid[cy * 2 + 1][cx * 2 + 1] = ".";
        const direcciones = mezclar([[0, -1], [0, 1], [-1, 0], [1, 0]]);
        for (const [dx, dy] of direcciones) {
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || nx >= celdasAncho || ny < 0 || ny >= celdasAlto) continue;
            if (visitado[ny][nx]) continue;
            grid[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = ".";
            tallar(nx, ny);
        }
    }
    tallar(0, 0);

    return grid.map((fila) => fila.join(""));
}

// Busca, con un recorrido en anchura (BFS), la celda transitable más
// lejana del inicio: usarla como meta hace que el recorrido sea largo y
// obligue a pasar por varias bifurcaciones de verdad, en vez de que la
// meta quede a un paso de cualquier lado.
function celdaMasLejana(grid, sx, sy) {
    const filas = grid.length, columnas = grid[0].length;
    const visitado = Array.from({ length: filas }, () => new Array(columnas).fill(false));
    const cola = [{ x: sx, y: sy, d: 0 }];
    visitado[sy][sx] = true;
    let mejor = { x: sx, y: sy, d: 0 };
    let cabeza = 0;
    while (cabeza < cola.length) {
        const actual = cola[cabeza++];
        if (actual.d > mejor.d) mejor = actual;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = actual.x + dx, ny = actual.y + dy;
            if (ny < 0 || ny >= filas || nx < 0 || nx >= columnas) continue;
            if (grid[ny][nx] === "#" || visitado[ny][nx]) continue;
            visitado[ny][nx] = true;
            cola.push({ x: nx, y: ny, d: actual.d + 1 });
        }
    }
    return mejor;
}

function nivelLaberinto(raiz) {
    raiz.appendChild(capaCielo("final"));
    raiz.insertAdjacentHTML("beforeend", capaColinas("#5B3A78", "#4A6B52", "#3F5C47"));
    raiz.appendChild(capaParticulas("rgba(255,210,122,.95)", 26));

    // El mapa se genera una sola vez por partida y se guarda, para que
    // recargar la página no cambie el laberinto a mitad de camino.
    const progreso = progresoDe(7);
    let inicio, meta;
    let LABERINTO;
    if (Array.isArray(progreso.mapa) && progreso.mapa.length) {
        LABERINTO = progreso.mapa;
        inicio = progreso.inicio;
        meta = progreso.meta;
    } else {
        const grid = generarLaberinto(LABERINTO_CELDAS_ANCHO, LABERINTO_CELDAS_ALTO);
        inicio = { x: 1, y: 1 };
        meta = celdaMasLejana(grid, inicio.x, inicio.y);
        grid[inicio.y] = grid[inicio.y].substring(0, inicio.x) + "S" + grid[inicio.y].substring(inicio.x + 1);
        grid[meta.y] = grid[meta.y].substring(0, meta.x) + "F" + grid[meta.y].substring(meta.x + 1);
        LABERINTO = grid;
        progreso.mapa = LABERINTO;
        progreso.inicio = inicio;
        progreso.meta = meta;
        progreso.posicion = { ...inicio };
        guardar();
    }

    const filas = LABERINTO.length;
    const columnas = LABERINTO[0].length;

    const tablero = nodo('<div class="laberinto"></div>');
    tablero.style.gridTemplateColumns = "repeat(" + columnas + ", 1fr)";
    tablero.style.gridTemplateRows = "repeat(" + filas + ", 1fr)";

    const celdas = [];
    for (let y = 0; y < filas; y++) {
        celdas[y] = [];
        for (let x = 0; x < columnas; x++) {
            const c = LABERINTO[y][x];
            const celda = document.createElement("div");
            celda.className = "celda " + (c === "#" ? "muro" : "libre");
            if (c === "F") celda.classList.add("meta");
            tablero.appendChild(celda);
            celdas[y][x] = celda;
        }
    }
    raiz.appendChild(tablero);

    const snoopyCanvas = nodo('<canvas class="snoopy-laberinto"></canvas>');
    tablero.appendChild(snoopyCanvas);
    const sprite = new Snoopy(snoopyCanvas, { pixel: window.innerWidth < 700 ? 1.6 : 2.2, direccion: "abajo" });

    const objeto = nodo(`<button type="button" class="objeto-final oculto" aria-label="El último recuerdo">
        <div class="halo-final"></div>
        <svg viewBox="0 0 160 140" width="160" height="140">
            <ellipse cx="80" cy="130" rx="56" ry="10" fill="rgba(20,10,35,.35)"/>
            <path d="M28 58 L132 58 L124 124 L36 124 Z" fill="#8E6BB5"/>
            <path d="M28 58 L132 58 L120 34 L40 34 Z" fill="#B99AD9"/>
            <rect x="70" y="58" width="20" height="66" fill="#FFD27A" opacity=".85"/>
            <circle cx="80" cy="46" r="16" fill="#FFD27A"/>
            <circle cx="80" cy="46" r="26" fill="rgba(255,210,122,.3)"/>
            <path d="M62 24 L80 2 L98 24 Z" fill="#FFD27A" opacity=".8"/>
        </svg>
    </button>`);
    raiz.appendChild(objeto);

    const marcador = contador("pets", "Toca en línea recta para avanzar");
    raiz.appendChild(marcador);

    let posicion = (progreso.posicion && esLibreInicial(progreso.posicion.x, progreso.posicion.y)) ? { ...progreso.posicion } : { ...inicio };
    let moviendo = false;
    let terminado = false;

    function esLibreInicial(x, y) {
        return LABERINTO[y] && LABERINTO[y][x] !== undefined && LABERINTO[y][x] !== "#";
    }

    function esLibre(x, y) {
        if (y < 0 || y >= filas || x < 0 || x >= columnas) return false;
        return LABERINTO[y][x] !== "#";
    }

    // Marca visualmente TODAS las casillas alcanzables en línea recta desde
    // la posición actual: en cada una de las 4 direcciones, se recorre
    // celda por celda hasta toparse con un muro. Así queda claro que se
    // puede tocar cualquiera de esas casillas (no solo la vecina inmediata)
    // y Snoopy avanzará solo hasta ahí.
    function marcarAlcanzables() {
        for (let y = 0; y < filas; y++) {
            for (let x = 0; x < columnas; x++) {
                celdas[y][x].classList.remove("alcanzable");
            }
        }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            let x = posicion.x, y = posicion.y;
            while (true) {
                const nx = x + dx, ny = y + dy;
                if (!esLibre(nx, ny)) break;
                celdas[ny][nx].classList.add("alcanzable");
                x = nx; y = ny;
            }
        }
    }

    function colocarSnoopy() {
        snoopyCanvas.style.left = ((posicion.x + 0.5) / columnas * 100) + "%";
        snoopyCanvas.style.top = ((posicion.y + 0.55) / filas * 100) + "%";
        marcarAlcanzables();
    }
    colocarSnoopy();
    window.addEventListener("resize", colocarSnoopy);

    tablero.addEventListener("click", async (e) => {
        if (moviendo || terminado) return;
        const celda = e.target.closest(".celda");
        if (!celda || celda.classList.contains("muro")) return;

        let destino = null;
        for (let y = 0; y < filas && !destino; y++) {
            for (let x = 0; x < columnas; x++) {
                if (celdas[y][x] === celda) { destino = { x, y }; break; }
            }
        }
        if (!destino) return;

        const dxTotal = destino.x - posicion.x;
        const dyTotal = destino.y - posicion.y;

        // Solo se puede avanzar en línea recta: la casilla tocada debe
        // estar en la misma fila o en la misma columna que Snoopy.
        if ((dxTotal !== 0 && dyTotal !== 0) || (dxTotal === 0 && dyTotal === 0)) {
            celda.classList.remove("celda-error");
            void celda.offsetWidth;
            celda.classList.add("celda-error");
            return;
        }

        const pasoX = Math.sign(dxTotal);
        const pasoY = Math.sign(dyTotal);

        // Se arma la lista de pasos reales: avanza celda por celda en esa
        // dirección hasta llegar al destino tocado o hasta toparse con un
        // muro, lo que ocurra primero. Si topa con un muro antes de tiempo,
        // Snoopy se queda justo en la última casilla libre.
        const pasos = [];
        let cx = posicion.x, cy = posicion.y;
        while (cx !== destino.x || cy !== destino.y) {
            const nx = cx + pasoX, ny = cy + pasoY;
            if (!esLibre(nx, ny)) break;
            cx = nx; cy = ny;
            pasos.push({ x: cx, y: cy });
        }

        if (pasos.length === 0) {
            // Un muro justo al lado impide avanzar ni un paso.
            celda.classList.remove("celda-error");
            void celda.offsetWidth;
            celda.classList.add("celda-error");
            return;
        }

        moviendo = true;
        sprite.caminando = true;
        if (pasoX > 0) sprite.direccion = "derecha";
        else if (pasoX < 0) sprite.direccion = "izquierda";
        else if (pasoY > 0) sprite.direccion = "abajo";
        else sprite.direccion = "arriba";

        for (const paso of pasos) {
            posicion = paso;
            progreso.posicion = { ...posicion };
            guardar();
            colocarSnoopy();
            await esperar(130);
        }

        sprite.caminando = false;
        moviendo = false;

        if (posicion.x === meta.x && posicion.y === meta.y) {
            terminado = true;
            marcador.querySelector(".contador-texto").textContent = "Llegaste";
            await esperar(500);
            tablero.style.transition = "opacity 700ms ease";
            tablero.style.opacity = "0";
            objeto.classList.remove("oculto");
            objeto.classList.add("abierto");
            snoopyActual = crearSnoopyEscena(raiz, { x: 32, y: 16, direccion: "derecha" });
            snoopyActual.decir("Aquí estaba el último.", 2400);
            snoopyActual.celebrar();
            sprite.destruir();
            await esperar(2200);
            completarNivel(7);
        }
    });

    actualizarObjetivo("Toca una casilla en línea recta: Snoopy avanzará solo hasta donde pueda");
}


/* ==========================================================================
   10. FIN DE NIVEL Y PANTALLA DE RECOMPENSA
   ========================================================================== */

function completarNivel(numero) {
    const nivel = nivelPorNumero(numero);

    if (!estadoJuego.nivelesCompletados.includes(numero)) estadoJuego.nivelesCompletados.push(numero);
    if (!estadoJuego.cancionesDesbloqueadas.includes(nivel.cancion)) estadoJuego.cancionesDesbloqueadas.push(nivel.cancion);
    if (!estadoJuego.fragmentosObtenidos.includes(numero)) estadoJuego.fragmentosObtenidos.push(numero);
    estadoJuego.nivelActual = Math.min(7, numero + 1);
    guardar();

    pintarTiraFragmentos();
    mostrarRecompensa(nivel);
}

function mostrarRecompensa(nivel) {
    $("hud").classList.add("oculto");

    // Se detiene el sonido ambiente del nivel y empieza la canción de
    // recompensa (distinta), que es la que se escucha con la frase y el
    // fragmento de foto.
    detenerFondo();

    $("recompensaTitulo").textContent = nivel.titulo;
    $("recompensaFrase").textContent = nivel.mensaje;

    const fragmento = $("fragmentoNuevo");
    fragmento.className = "fragmento-nuevo fragmento pixelado";
    fragmento.style.backgroundImage = 'url("' + FOTO_FINAL + '")';
    fragmento.style.backgroundSize = "700% 100%";
    fragmento.style.backgroundRepeat = "no-repeat";
    fragmento.style.backgroundPosition = posicionFragmento(nivel.numero - 1);
    fragmento.style.animation = "none";
    void fragmento.offsetWidth;
    fragmento.style.animation = "";

    pintarMosaicoProgreso();

    $("textoContinuar").textContent = nivel.numero === 7 ? "Ver el último recuerdo" : "Continuar aventura";
    $("pantallaRecompensa").classList.remove("oculto");

    reproducirCancion(nivel.cancion, true);
}

function continuarAventura() {
    $("pantallaRecompensa").classList.add("oculto");
    audio.pause();

    if (estadoJuego.nivelesCompletados.includes(7)) {
        estadoJuego.juegoCompletado = true;
        guardar();
        limpiarEscena();
        mostrarEscenaFinal(true);
        return;
    }
    cargarNivel(estadoJuego.nivelActual);
}


/* ==========================================================================
   11. ESCENA FINAL
   ========================================================================== */

let snoopyFinalSprite = null;

async function mostrarEscenaFinal(animar) {
    detenerFondo();

    $("hud").classList.remove("oculto");
    $("hudNumeroNivel").textContent = "7";
    $("hudTitulo").textContent = "Aventura completada";
    $("hudObjetivo").textContent = "La fotografía está completa";
    pintarTiraFragmentos();

    const capa = $("escenaFinal");
    capa.classList.remove("oculto");

    const cielo = capa.querySelector(".final-cielo");
    if (!cielo.dataset.listo) {
        for (let i = 0; i < 46; i++) {
            const e = document.createElement("span");
            e.className = "estrella";
            e.style.left = azar(0, 100).toFixed(2) + "%";
            e.style.top = azar(0, 70).toFixed(2) + "%";
            e.style.animationDelay = azar(0, 3.4).toFixed(2) + "s";
            cielo.appendChild(e);
        }
        cielo.dataset.listo = "1";
    }

    const marco = $("marcoFoto");
    marco.style.aspectRatio = proporcionFoto.toFixed(4);
    marco.innerHTML = "";

    const piezas = [];
    for (let i = 0; i < TOTAL_FRAGMENTOS; i++) {
        const frag = crearFragmento(i, animar ? "pixelado" : "libre");
        if (animar) {
            frag.style.transform = `translate(${azar(-90, 90).toFixed(0)}%, ${azar(-60, 60).toFixed(0)}%) rotate(${azar(-14, 14).toFixed(1)}deg)`;
        }
        marco.appendChild(frag);
        piezas.push(frag);
    }

    if (!snoopyFinalSprite) snoopyFinalSprite = new Snoopy($("snoopyFinal"), { pixel: 3, direccion: "abajo" });

    const mensaje = $("mensajeFinal");
    const reproductorFinal = $("reproductorFinal");
    const acciones = $("accionesFinales");

    if (!animar) {
        mensaje.textContent = MENSAJE_FINAL;
        reproductorFinal.classList.remove("oculto");
        acciones.classList.remove("oculto");
        reproducirCancion(NIVELES[6].cancion, false);
        return;
    }

    mensaje.textContent = "";
    reproductorFinal.classList.add("oculto");
    acciones.classList.add("oculto");

    await esperar(700);
    for (const frag of piezas) {
        frag.style.transform = "";
        await esperar(170);
    }

    await esperar(1100);
    for (const frag of piezas) {
        frag.classList.remove("pixelado");
        frag.classList.add("libre");
    }

    await esperar(1500);
    mensaje.textContent = MENSAJE_FINAL;
    reproductorFinal.classList.remove("oculto");
    acciones.classList.remove("oculto");
    reproducirCancion(NIVELES[6].cancion, true);
}

function jugarOtraVez() {
    audio.pause();
    detenerFondo();
    cancionActual = "";
    fondoActual = "";
    try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* nada */ }
    estadoJuego = estadoLimpio();
    guardar();
    $("escenaFinal").classList.add("oculto");
    $("pantallaRecompensa").classList.add("oculto");
    cargarNivel(1);
}


/* ==========================================================================
   12. ORIENTACIÓN, PANTALLA COMPLETA E INICIO
   ========================================================================== */

const esMovil = window.matchMedia("(pointer: coarse)").matches;
let juegoIniciado = false;

function revisarOrientacion() {
    if (!esMovil || !juegoIniciado) {
        $("avisoOrientacion").classList.add("oculto");
        return;
    }
    $("avisoOrientacion").classList.toggle("oculto", window.innerWidth >= window.innerHeight);
}

// La pantalla completa es automática y solo en teléfonos.
function pedirPantallaCompleta() {
    if (!esMovil) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    const el = document.documentElement;
    const pedir = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!pedir) return;
    try {
        const r = pedir.call(el);
        if (r && r.catch) r.catch(() => {});
    } catch (err) { /* bloqueado por el navegador */ }
}

function irAlBosque() {
    guardar();
    window.location.href = URL_BOSQUE;
}

function comenzar() {
    juegoIniciado = true;
    desbloquearAudio();
    pedirPantallaCompleta();

    $("pantallaCarga").classList.add("oculto");
    revisarOrientacion();

    if (estadoJuego.juegoCompletado) {
        mostrarEscenaFinal(false);
        return;
    }
    cargarNivel(estadoJuego.nivelActual);
}

async function iniciar() {
    cargar();
    inyectarEstilosMejoras();

    crearControl({
        play: "btnReproducir", reiniciar: "btnReiniciarCancion", progreso: "barraProgreso",
        actual: "tiempoActual", total: "tiempoTotal", volumen: "barraVolumen",
    });
    crearControl({
        play: "btnReproducirFinal", reiniciar: "btnReiniciarFinal", progreso: "barraProgresoFinal",
        actual: "tiempoActualFinal", total: "tiempoTotalFinal", volumen: "barraVolumenFinal",
    });

    $("btnContinuar").addEventListener("click", continuarAventura);
    $("btnComenzar").addEventListener("click", comenzar);
    $("btnBosque").addEventListener("click", irAlBosque);
    $("btnJugarOtraVez").addEventListener("click", jugarOtraVez);

    window.addEventListener("resize", revisarOrientacion);
    window.addEventListener("orientationchange", () => {
        revisarOrientacion();
        setTimeout(pedirPantallaCompleta, 300);
    });

    new Snoopy($("snoopyCarga"), { pixel: 4, direccion: "abajo" });

    try { await document.fonts.load('400 24px "Material Symbols Outlined"'); } catch (err) { /* nada */ }

    const fotoLista = await precargarFoto();
    await Promise.all([...Object.values(IMAGENES), ...COFRE_ESTADOS].map(precargarImagen));

    $("estadoCarga").textContent = fotoLista
        ? "Todo listo."
        : "La fotografía final no se pudo cargar, pero la aventura funciona igual.";
    $("btnComenzar").classList.remove("oculto");
}

document.addEventListener("DOMContentLoaded", iniciar);