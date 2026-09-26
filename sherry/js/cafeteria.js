/* ==========================================================================
   CAFETERIA-GAME.JS — Motor de "Cafetería de Snoopy"
   Página independiente de la del bosque: reutiliza el patrón de cámara,
   colisiones, controles táctiles y el sprite/animación de Snoopy, pero sin
   ciclo día/noche ni generación procedural de bosque. Los muebles se
   dibujan con formas de canvas (no hay imágenes externas para ellos).

   CAMBIOS EN ESTA VERSIÓN:
   - construirColisionables(): las mesas y plantas ya no usan cajas de
     colisión más grandes que su dibujo visual (antes dejaban "zonas vacías"
     donde no se podía caminar aunque no hubiera nada dibujado ahí).
   - actualizarCamara(): ahora usa una "zona muerta" central, así Snoopy
     puede moverse libremente cerca del centro de la pantalla y la cámara
     solo lo sigue cuando se acerca al borde, en vez de quedar siempre
     clavado en el centro exacto.
   - iniciar(): la cámara se centra en Snoopy desde el primer fotograma,
     para que no haya un salto al cargar.
   - dibujarEscalera(): ahora dibuja huella + contrahuella con perspectiva,
     para que se vea claramente como una escalera y no como bloques apilados.
   ========================================================================== */

// --------------------------------------------------------------------------
// ESTADO GLOBAL
// --------------------------------------------------------------------------
let canvas, ctx, dpr = 1;
let ultimoTiempo = 0;

let camaraX = 0, camaraY = 0;
let colisionables = [];
let objetosEspecialesEstado = []; // copia de CONFIG_CAFE.objetosEspeciales + estado de "cercano"

let jugador = {
    x: 0, y: 0, direccion: 'abajo', moviendo: false,
};

let objetoCercano = null;
let escaleraCercana = false;
let salioDeLaEscalera = false; // evita redirigir apenas se carga la página
let saliendo = false; // evita redirecciones dobles

let juegoPausado = false;
let entradaHabilitada = false;

let audioMusica = null;
let musicaIntentada = false;

const teclas = new Set();
const tactil = { arriba: false, abajo: false, izquierda: false, derecha: false };

const esMovil = window.matchMedia('(pointer: coarse)').matches;

let elLienzo, elPantallaCarga, elPantallaMusica, elBtnMusicaSi, elBtnMusicaNo,
    elAvisoOrientacion, elPistaTeclado, elBtnAlternarMusica, elIconoMusica,
    elAvisoDescubrimiento, elCapaMensaje, elTextoMensaje, elBtnCerrarMensaje,
    elControlesTactiles;


// --------------------------------------------------------------------------
// UTILIDADES
// --------------------------------------------------------------------------

function distancia(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function redondearRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
}

function mulberry32(semilla) {
    let a = semilla;
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}


// --------------------------------------------------------------------------
// SNOOPY PIXELADO — mismo sistema de sprites que en el bosque
// --------------------------------------------------------------------------

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
    "....................", "....................", ".......BBBBBB.......",
    "....BBBWWWWWWBBB....", "...BBBBWWWWWWBBBB...", "...BBBBWWWWWWBBBB...",
    "...BBBBWBWWBWBBBB...", "...BBBBWBWWBWBBBB...", "...BBBBWWWWWWBBBB...",
    "....BBBWWBBWWBBB....", "....BBBWWBBWWBBB....", ".....BBWWWWWWBB.....",
    "......BBBBBBBB......",
];

const SNOOPY_CABEZA_ESPALDA = [
    "....................", "....................", ".......BBBBBB.......",
    "....BBBWWWWWWBBB....", "...BBBBWWWWWWBBBB...", "...BBBBWWWWWWBBBB...",
    "...BBBBWWWWWWBBBB...", "...BBBBWWWWWWBBBB...", "...BBBBWWWWWWBBBB...",
    "....BBBWWWWWWBBB....", "....BBBWWWWWWBBB....", ".....BBWWWWWWBB.....",
    "......BBBBBBBB......",
];

const SNOOPY_TORSO_FRONTAL = [
    "......RRRRRRRR......", ".....BWWWWWWWWB.....", ".....BWWWWWWWWB.....",
    ".....BWWWWWWWWB.....", ".....BWWWWWWWWB.....", ".....BWWWWWWWWB.....",
    "......BWWWWWWB......", "......BWWWWWWB......",
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

const SNOOPY_CUADROS_PERFIL = armarCuadrosSnoopy(SNOOPY_PERFIL_CUERPO, SNOOPY_PERFIL_PATAS);
const SNOOPY_CUADROS_FRENTE = armarCuadrosSnoopy(SNOOPY_CABEZA_FRENTE, SNOOPY_PATAS_FRONTALES, SNOOPY_TORSO_FRONTAL);
const SNOOPY_CUADROS_ESPALDA = armarCuadrosSnoopy(SNOOPY_CABEZA_ESPALDA, SNOOPY_PATAS_FRONTALES, SNOOPY_TORSO_FRONTAL);

const SNOOPY_FRAMES = {
    izquierda: SNOOPY_CUADROS_PERFIL,
    derecha: SNOOPY_CUADROS_PERFIL,
    abajo: SNOOPY_CUADROS_FRENTE,
    arriba: SNOOPY_CUADROS_ESPALDA,
};

const SNOOPY_PIXEL_COLORES = { B: '#33383b', W: '#f2f5f7', R: '#9c1020' };
const SNOOPY_PIXEL_TAM = 3.1;
const SNOOPY_CUADROS_POR_SEGUNDO = 7;

function dibujarSnoopy(c, x, y, direccion, caminando, tiempo) {
    const escala = CONFIG_CAFE.jugador.escala;
    const cuadros = SNOOPY_FRAMES[direccion] || SNOOPY_CUADROS_FRENTE;
    const fotograma = caminando ? (Math.floor(tiempo * SNOOPY_CUADROS_POR_SEGUNDO) % cuadros.length) : 1;
    const grilla = cuadros[fotograma];
    const bamboleo = caminando && (fotograma % 2 === 1) ? -1.3 : 0;

    const filas = grilla.length;
    const columnas = grilla[0].length;
    const anchoTotal = columnas * SNOOPY_PIXEL_TAM;
    const altoTotal = filas * SNOOPY_PIXEL_TAM;

    c.save();
    c.translate(x, y + bamboleo);
    c.scale(escala, escala);

    c.fillStyle = 'rgba(0,0,0,0.22)';
    c.beginPath();
    c.ellipse(0, altoTotal * 0.42 - bamboleo, anchoTotal * 0.32, 6, 0, 0, Math.PI * 2);
    c.fill();

    if (direccion === 'derecha') c.scale(-1, 1);
    c.translate(-anchoTotal / 2, -altoTotal * 0.78);

    for (let fila = 0; fila < filas; fila++) {
        const linea = grilla[fila];
        for (let col = 0; col < columnas; col++) {
            const ch = linea[col];
            if (ch === '.') continue;
            c.fillStyle = SNOOPY_PIXEL_COLORES[ch];
            c.fillRect(col * SNOOPY_PIXEL_TAM, fila * SNOOPY_PIXEL_TAM, SNOOPY_PIXEL_TAM + 0.5, SNOOPY_PIXEL_TAM + 0.5);
        }
    }
    c.restore();
}


// --------------------------------------------------------------------------
// DIBUJO DEL PISO Y LAS PAREDES
// --------------------------------------------------------------------------

let capaPiso = null;

function generarCapaPiso() {
    const c = document.createElement('canvas');
    c.width = CONFIG_CAFE.mapa.ancho;
    c.height = CONFIG_CAFE.mapa.alto;
    const fctx = c.getContext('2d');
    const { pisoClaro, pisoOscuro, pisoAcento, pared } = CONFIG_CAFE.colores;
    const anchoMundo = CONFIG_CAFE.mapa.ancho;
    const altoMundo = CONFIG_CAFE.mapa.alto;

    // Piso a cuadros en diagonal, como en la referencia
    const tam = 44;
    fctx.fillStyle = pisoClaro;
    fctx.fillRect(0, 0, anchoMundo, altoMundo);
    for (let y = -tam; y < altoMundo + tam; y += tam) {
        for (let x = -tam; x < anchoMundo + tam; x += tam) {
            const par = (Math.round(x / tam) + Math.round(y / tam)) % 2 === 0;
            fctx.fillStyle = par ? pisoOscuro : pisoAcento;
            fctx.save();
            fctx.translate(x, y);
            fctx.rotate(Math.PI / 4);
            fctx.fillRect(-tam * 0.42, -tam * 0.42, tam * 0.82, tam * 0.82);
            fctx.restore();
        }
    }

    // Sombra de pared perimetral
    const grosorPared = 46;
    fctx.fillStyle = pared;
    fctx.fillRect(0, 0, anchoMundo, grosorPared);
    fctx.fillRect(0, 0, grosorPared, altoMundo);
    fctx.fillRect(anchoMundo - grosorPared, 0, grosorPared, altoMundo);
    fctx.fillRect(0, altoMundo - grosorPared, anchoMundo, grosorPared);

    fctx.fillStyle = 'rgba(43,26,20,0.25)';
    fctx.fillRect(0, grosorPared, anchoMundo, 14);
    fctx.fillRect(grosorPared, 0, 14, altoMundo);

    return c;
}


// --------------------------------------------------------------------------
// DIBUJO DE MUEBLES
// --------------------------------------------------------------------------

function dibujarEstanteria(c, m) {
    const { madera, maderaOscura, crema, terracota } = CONFIG_CAFE.colores;
    const x = m.x - m.w / 2, y = m.y - m.h / 2;
    c.fillStyle = 'rgba(43,26,20,0.25)';
    c.fillRect(x + 6, y + m.h - 8, m.w, 12);
    c.fillStyle = maderaOscura;
    redondearRect(c, x, y, m.w, m.h, 8);
    c.fill();
    c.fillStyle = madera;
    redondearRect(c, x + 8, y + 8, m.w - 16, m.h - 16, 4);
    c.fill();
    const filas = 4;
    const rng = mulberry32(m.x + m.y);
    for (let f = 0; f < filas; f++) {
        const fy = y + 16 + f * ((m.h - 32) / filas);
        c.fillStyle = maderaOscura;
        c.fillRect(x + 8, fy + (m.h - 32) / filas - 6, m.w - 16, 6);
        let bx = x + 14;
        const coloresLibro = [terracota, '#8A4A2B', '#6E9B72', crema, '#D8879F'];
        while (bx < x + m.w - 18) {
            const bw = 7 + rng() * 6;
            const bh = (m.h - 32) / filas - 14 + rng() * 6;
            c.fillStyle = coloresLibro[Math.floor(rng() * coloresLibro.length)];
            c.fillRect(bx, fy + ((m.h - 32) / filas - 6) - bh, bw, bh);
            bx += bw + 2.5;
        }
    }
}

function dibujarBarra(c, m) {
    const { maderaOscura, madera, crema, terracota } = CONFIG_CAFE.colores;
    const x = m.x - m.w / 2, y = m.y - m.h / 2;
    c.fillStyle = 'rgba(43,26,20,0.25)';
    c.fillRect(x + 6, y + m.h - 6, m.w, 12);
    c.fillStyle = maderaOscura;
    redondearRect(c, x, y, m.w, m.h, 10);
    c.fill();
    c.fillStyle = madera;
    redondearRect(c, x + 6, y + 6, m.w - 12, m.h - 26, 6);
    c.fill();
    // Máquina de café
    c.fillStyle = '#33383b';
    redondearRect(c, x + m.w * 0.14, y + 14, 70, 46, 6);
    c.fill();
    c.fillStyle = terracota;
    c.fillRect(x + m.w * 0.14 + 8, y + 22, 54, 8);
    // Vitrina de pasteles
    c.fillStyle = 'rgba(255,255,255,0.55)';
    redondearRect(c, x + m.w * 0.55, y + 14, 90, 46, 6);
    c.fill();
    c.strokeStyle = maderaOscura;
    c.lineWidth = 2;
    redondearRect(c, x + m.w * 0.55, y + 14, 90, 46, 6);
    c.stroke();
    c.fillStyle = crema;
    for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.ellipse(x + m.w * 0.55 + 20 + i * 26, y + 46, 10, 6, 0, Math.PI, Math.PI * 2);
        c.fill();
    }
}

function dibujarMesaConSillas(c, m) {
    const { maderaOscura, madera, crema } = CONFIG_CAFE.colores;
    const radioMesa = m.w / 2;
    // Sombra
    c.fillStyle = 'rgba(43,26,20,0.22)';
    c.beginPath();
    c.ellipse(m.x, m.y + 8, radioMesa + 6, radioMesa * 0.55 + 4, 0, 0, Math.PI * 2);
    c.fill();

    // Sillas (2, arriba y abajo)
    const rSilla = radioMesa * 0.42;
    for (const dy of [-radioMesa - 18, radioMesa + 18]) {
        c.fillStyle = maderaOscura;
        c.beginPath();
        c.arc(m.x, m.y + dy, rSilla, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#B3654A';
        c.beginPath();
        c.arc(m.x, m.y + dy, rSilla * 0.68, 0, Math.PI * 2);
        c.fill();
    }

    // Mesa redonda
    c.fillStyle = maderaOscura;
    c.beginPath();
    c.arc(m.x, m.y, radioMesa, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = madera;
    c.beginPath();
    c.arc(m.x, m.y, radioMesa - 8, 0, Math.PI * 2);
    c.fill();
    // Mantel / centro
    c.fillStyle = crema;
    c.beginPath();
    c.arc(m.x, m.y, radioMesa - 22, 0, Math.PI * 2);
    c.fill();
    // Taza
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(m.x - 6, m.y, 7, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#6E4B2A';
    c.beginPath();
    c.arc(m.x - 6, m.y, 4.5, 0, Math.PI * 2);
    c.fill();
}

function dibujarCasita(c, m) {
    const { maderaOscura, madera, crema, terracota } = CONFIG_CAFE.colores;
    const x = m.x - m.w / 2, y = m.y - m.h / 2;
    c.fillStyle = 'rgba(43,26,20,0.22)';
    c.beginPath();
    c.ellipse(m.x, y + m.h + 4, m.w * 0.5, 10, 0, 0, Math.PI * 2);
    c.fill();

    // Cuerpo
    c.fillStyle = crema;
    redondearRect(c, x + 8, y + m.h * 0.42, m.w - 16, m.h * 0.5, 6);
    c.fill();
    // Techo triangular rojo (icónico)
    c.fillStyle = terracota;
    c.beginPath();
    c.moveTo(x, y + m.h * 0.46);
    c.lineTo(m.x, y);
    c.lineTo(x + m.w, y + m.h * 0.46);
    c.closePath();
    c.fill();
    c.strokeStyle = maderaOscura;
    c.lineWidth = 3;
    c.stroke();
    // Entrada
    c.fillStyle = maderaOscura;
    c.beginPath();
    c.ellipse(m.x, y + m.h * 0.92, m.w * 0.16, m.h * 0.12, 0, 0, Math.PI * 2);
    c.fill();
}

function dibujarPlanta(c, m) {
    const { maderaOscura, verde, verdeOscuro } = CONFIG_CAFE.colores;
    c.fillStyle = 'rgba(43,26,20,0.2)';
    c.beginPath();
    c.ellipse(m.x, m.y + m.h * 0.4, m.w * 0.4, 6, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = maderaOscura;
    redondearRect(c, m.x - m.w * 0.28, m.y + m.h * 0.06, m.w * 0.56, m.h * 0.34, 4);
    c.fill();
    const rng = mulberry32(m.x * 3 + m.y);
    for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 / 6) * i;
        c.fillStyle = i % 2 === 0 ? verde : verdeOscuro;
        c.beginPath();
        c.ellipse(
            m.x + Math.cos(ang) * m.w * 0.22,
            m.y - m.h * 0.15 + Math.sin(ang) * m.h * 0.22,
            m.w * 0.22, m.h * 0.14, ang, 0, Math.PI * 2
        );
        c.fill();
    }
}

function dibujarVentana(c, m) {
    const { maderaOscura, doradoCalido } = CONFIG_CAFE.colores;
    const x = m.x - m.w / 2, y = m.y - m.h / 2;
    const grad = c.createLinearGradient(x, y, x, y + m.h);
    grad.addColorStop(0, '#F6D9A8');
    grad.addColorStop(1, doradoCalido);
    c.fillStyle = grad;
    redondearRect(c, x, y, m.w, m.h, 6);
    c.fill();
    c.strokeStyle = maderaOscura;
    c.lineWidth = 4;
    redondearRect(c, x, y, m.w, m.h, 6);
    c.stroke();
    c.beginPath();
    c.moveTo(m.x, y);
    c.lineTo(m.x, y + m.h);
    c.moveTo(x, m.y);
    c.lineTo(x + m.w, m.y);
    c.stroke();
}

function dibujarAlfombra(c, m) {
    const { alfombra, alfombraBorde } = CONFIG_CAFE.colores;
    c.fillStyle = alfombraBorde;
    redondearRect(c, m.x - m.w / 2, m.y - m.h / 2, m.w, m.h, 26);
    c.fill();
    c.fillStyle = alfombra;
    redondearRect(c, m.x - m.w / 2 + 14, m.y - m.h / 2 + 14, m.w - 28, m.h - 28, 20);
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.3)';
    c.lineWidth = 3;
    redondearRect(c, m.x - m.w / 2 + 26, m.y - m.h / 2 + 26, m.w - 52, m.h - 52, 14);
    c.stroke();
}

const DIBUJANTES_MUEBLE = {
    estanteria: dibujarEstanteria,
    barra: dibujarBarra,
    mesa: dibujarMesaConSillas,
    casita: dibujarCasita,
    planta: dibujarPlanta,
    ventana: dibujarVentana,
    alfombra: dibujarAlfombra,
};


// --------------------------------------------------------------------------
// ESCALERA (entrada / salida)
// --------------------------------------------------------------------------
// AHORA con huella (parte de arriba, clara) + contrahuella (borde vertical,
// oscuro) por cada escalón, y un ligero "inset" progresivo que da
// perspectiva — esto es lo que hace que de verdad se lea como escalera.

function dibujarEscalera(c) {
    const { x, y } = CONFIG_CAFE.escalera;
    const { maderaOscura, madera, crema } = CONFIG_CAFE.colores;
    const anchoBase = 170, altoTotal = 150, escalones = 6;
    const altoEscalon = altoTotal / escalones;
    const bx = x - anchoBase / 2, by = y - altoTotal / 2;

    // Sombra proyectada
    c.fillStyle = 'rgba(43,26,20,0.22)';
    c.beginPath();
    c.ellipse(x, by + altoTotal + 6, anchoBase * 0.45, 10, 0, 0, Math.PI * 2);
    c.fill();

    for (let i = 0; i < escalones; i++) {
        const sy = by + i * altoEscalon;
        const inset = i * 6; // cada escalón un poco más angosto = perspectiva
        const sx = bx + inset;
        const sw = anchoBase - inset * 2;

        // Huella (superficie donde se pisa)
        c.fillStyle = i % 2 === 0 ? crema : madera;
        c.fillRect(sx, sy, sw, altoEscalon * 0.6);

        // Contrahuella (cara vertical del escalón, da volumen)
        c.fillStyle = maderaOscura;
        c.fillRect(sx, sy + altoEscalon * 0.6, sw, altoEscalon * 0.4);

        c.strokeStyle = 'rgba(43,26,20,0.3)';
        c.lineWidth = 1.5;
        c.strokeRect(sx, sy, sw, altoEscalon);
    }

    // Barandales laterales, convergiendo con la perspectiva
    c.strokeStyle = maderaOscura;
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(bx + 4, by - 6);
    c.lineTo(bx + escalones * 6 + 4, by + altoTotal - 6);
    c.moveTo(bx + anchoBase - 4, by - 6);
    c.lineTo(bx + anchoBase - escalones * 6 - 4, by + altoTotal - 6);
    c.stroke();
}


// --------------------------------------------------------------------------
// COLISIONES
// --------------------------------------------------------------------------
// AHORA cada tipo de mueble genera una caja de colisión ajustada a lo que
// realmente se ve dibujado (antes las mesas y plantas usaban cajas mucho
// más grandes que su dibujo, dejando "zonas vacías" bloqueadas).

function construirColisionables() {
    const lista = [];

    // Paredes del cuarto (rectángulos alrededor del borde)
    const grosor = 60;
    lista.push({ tipo: 'rect', x: 0, y: 0, w: CONFIG_CAFE.mapa.ancho, h: grosor });
    lista.push({ tipo: 'rect', x: 0, y: 0, w: grosor, h: CONFIG_CAFE.mapa.alto });
    lista.push({ tipo: 'rect', x: CONFIG_CAFE.mapa.ancho - grosor, y: 0, w: grosor, h: CONFIG_CAFE.mapa.alto });
    lista.push({ tipo: 'rect', x: 0, y: CONFIG_CAFE.mapa.alto - grosor, w: CONFIG_CAFE.mapa.ancho, h: grosor });

    for (const mueble of CONFIG_CAFE.muebles) {
        if (mueble.colision === false) continue;

        if (mueble.tipo === 'mesa') {
            // La mesa (radio = w/2) más las dos sillas arriba/abajo
            // (separadas w/2+18, con su propio radio w/2*0.42).
            const medioAncho = mueble.w / 2 + 6;
            const medioAlto = mueble.w / 2 + 18 + mueble.w * 0.42 + 6;
            lista.push({
                tipo: 'rect',
                x: mueble.x - medioAncho,
                y: mueble.y - medioAlto,
                w: medioAncho * 2,
                h: medioAlto * 2,
            });
        } else if (mueble.tipo === 'planta') {
            // La maceta + hojas ocupan bastante menos que el w/h declarado.
            const anchoCol = mueble.w * 0.55;
            const altoCol = mueble.h * 0.5;
            lista.push({
                tipo: 'rect',
                x: mueble.x - anchoCol / 2,
                y: mueble.y - altoCol / 2,
                w: anchoCol,
                h: altoCol,
            });
        } else {
            lista.push({
                tipo: 'rect',
                x: mueble.x - mueble.w / 2,
                y: mueble.y - mueble.h / 2,
                w: mueble.w,
                h: mueble.h,
            });
        }
    }

    return lista;
}

function colisionaEnPunto(x, y, radio) {
    for (const c of colisionables) {
        if (c.tipo === 'circulo') {
            if (distancia(x, y, c.x, c.y) < radio + c.radio) return true;
        } else {
            const cx = Math.max(c.x, Math.min(x, c.x + c.w));
            const cy = Math.max(c.y, Math.min(y, c.y + c.h));
            if (distancia(x, y, cx, cy) < radio) return true;
        }
    }
    return false;
}

function clamparPosicionJugador() {
    const m = CONFIG_CAFE.mapa.margenColision;
    const radio = CONFIG_CAFE.jugador.radioColision;
    jugador.x = Math.max(m + radio, Math.min(CONFIG_CAFE.mapa.ancho - m - radio, jugador.x));
    jugador.y = Math.max(m + radio, Math.min(CONFIG_CAFE.mapa.alto - m - radio, jugador.y));
}

function moverJugador(dt) {
    let dx = 0, dy = 0;
    if (teclas.has('w') || teclas.has('arrowup') || tactil.arriba) dy -= 1;
    if (teclas.has('s') || teclas.has('arrowdown') || tactil.abajo) dy += 1;
    if (teclas.has('a') || teclas.has('arrowleft') || tactil.izquierda) dx -= 1;
    if (teclas.has('d') || teclas.has('arrowright') || tactil.derecha) dx += 1;

    jugador.moviendo = dx !== 0 || dy !== 0;
    if (!jugador.moviendo) return;

    if (dx !== 0 && dy !== 0) {
        const inv = 1 / Math.SQRT2;
        dx *= inv; dy *= inv;
    }

    if (dx < 0) jugador.direccion = 'izquierda';
    else if (dx > 0) jugador.direccion = 'derecha';
    else if (dy < 0) jugador.direccion = 'arriba';
    else if (dy > 0) jugador.direccion = 'abajo';

    const velocidad = CONFIG_CAFE.jugador.velocidad * dt;
    const radio = CONFIG_CAFE.jugador.radioColision;

    const nuevoX = jugador.x + dx * velocidad;
    if (!colisionaEnPunto(nuevoX, jugador.y, radio)) jugador.x = nuevoX;

    const nuevoY = jugador.y + dy * velocidad;
    if (!colisionaEnPunto(jugador.x, nuevoY, radio)) jugador.y = nuevoY;

    clamparPosicionJugador();
}


// --------------------------------------------------------------------------
// MENSAJES OCULTOS Y ESCALERA DE SALIDA
// --------------------------------------------------------------------------

function revisarProximidad() {
    // Objetos con mensaje oculto
    let cercano = null;
    let menorDist = Infinity;
    for (const o of objetosEspecialesEstado) {
        const d = distancia(jugador.x, jugador.y, o.x, o.y);
        if (d < o.radioDeteccion && d < menorDist) {
            menorDist = d;
            cercano = o;
        }
    }
    if (cercano && cercano !== objetoCercano) {
        objetoCercano = cercano;
        mostrarMensajeOculto(cercano);
    }
    if (!cercano) objetoCercano = null;

    // Zona de la escalera (entrada/salida)
    const { x, y, radioZona } = CONFIG_CAFE.escalera;
    const dEscalera = distancia(jugador.x, jugador.y, x, y);
    const dentro = dEscalera < radioZona;

    if (!dentro) {
        salioDeLaEscalera = true;
    } else if (dentro && salioDeLaEscalera && !saliendo) {
        saliendo = true;
        salirDeLaCafeteria();
    }
    escaleraCercana = dentro;
}

let temporizadorAviso = null;
function mostrarMensajeOculto(objeto) {
    elAvisoDescubrimiento.classList.remove('oculto');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => {
        elAvisoDescubrimiento.classList.add('oculto');
        elTextoMensaje.textContent = objeto.mensaje;
        elCapaMensaje.classList.remove('oculto');
    }, 950);
}

function cerrarMensaje() {
    elCapaMensaje.classList.add('oculto');
}

function salirDeLaCafeteria() {
    try { guardarEstadoSalida(); } catch (err) { /* no crítico */ }
    window.location.href = CONFIG_CAFE.escalera.redireccionA;
}

function guardarEstadoSalida() {
    // Espacio reservado por si en el futuro se quiere recordar qué mensajes
    // ya se descubrieron. No es necesario para el flujo actual.
}


// --------------------------------------------------------------------------
// MÚSICA
// --------------------------------------------------------------------------

function crearAudioSiHaceFalta() {
    if (!audioMusica) {
        audioMusica = new Audio(CONFIG_CAFE.musica.ruta);
        audioMusica.loop = true;
        audioMusica.volume = CONFIG_CAFE.musica.volumen;
    }
}

function iniciarMusica() {
    crearAudioSiHaceFalta();
    audioMusica.play().then(() => {
        elIconoMusica.textContent = 'volume_up';
    }).catch(() => {
        // Autoplay bloqueado: se reintentará en la primera interacción real.
        console.warn('Reproducción automática bloqueada; se reintentará con la primera interacción.');
    });
}

function alternarMusica() {
    crearAudioSiHaceFalta();
    if (audioMusica.paused) {
        audioMusica.play().catch(() => {});
        elIconoMusica.textContent = 'volume_up';
    } else {
        audioMusica.pause();
        elIconoMusica.textContent = 'volume_off';
    }
}

function intentarReanudarMusicaEnInteraccion() {
    if (musicaIntentada) return;
    musicaIntentada = true;
    if (audioMusica && audioMusica.paused) {
        audioMusica.play().then(() => { elIconoMusica.textContent = 'volume_up'; }).catch(() => {});
    }
}


// --------------------------------------------------------------------------
// MÓVIL: orientación, controles táctiles, pantalla completa
// --------------------------------------------------------------------------

function solicitarFullscreenSiMovil() {
    if (!esMovil) return;
    const el = document.documentElement;
    const solicitar = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (!solicitar) return;
    try {
        const r = solicitar.call(el);
        if (r && typeof r.catch === 'function') r.catch(() => {});
    } catch (err) { /* bloqueado por el navegador */ }
}

function revisarOrientacion() {
    if (!esMovil) {
        elAvisoOrientacion.classList.add('oculto');
        elControlesTactiles.classList.add('oculto');
        elPistaTeclado.classList.remove('oculto');
        juegoPausado = false;
        return;
    }
    elPistaTeclado.classList.add('oculto');
    const esVertical = window.innerHeight > window.innerWidth;
    if (esVertical) {
        elAvisoOrientacion.classList.remove('oculto');
        elControlesTactiles.classList.add('oculto');
        juegoPausado = true;
    } else {
        elAvisoOrientacion.classList.add('oculto');
        if (entradaHabilitada) elControlesTactiles.classList.remove('oculto');
        juegoPausado = false;
    }
}

function configurarControlesTactiles() {
    document.querySelectorAll('.boton-dpad').forEach((boton) => {
        const dir = boton.dataset.direccion;
        const activar = (e) => { e.preventDefault(); tactil[dir] = true; boton.classList.add('activo'); intentarReanudarMusicaEnInteraccion(); };
        const desactivar = (e) => { if (e) e.preventDefault(); tactil[dir] = false; boton.classList.remove('activo'); };
        boton.addEventListener('touchstart', activar, { passive: false });
        boton.addEventListener('touchend', desactivar, { passive: false });
        boton.addEventListener('touchcancel', desactivar, { passive: false });
        boton.addEventListener('mousedown', activar);
        boton.addEventListener('mouseup', desactivar);
        boton.addEventListener('mouseleave', desactivar);
    });
}

function configurarTeclado() {
    window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
            teclas.add(k);
            intentarReanudarMusicaEnInteraccion();
        }
    });
    window.addEventListener('keyup', (e) => teclas.delete(e.key.toLowerCase()));
}


// --------------------------------------------------------------------------
// CÁMARA Y LIENZO
// --------------------------------------------------------------------------

function ajustarCanvas() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Cámara con "zona muerta": Snoopy se puede mover libremente dentro de una
// franja central de la pantalla antes de que la cámara empiece a seguirlo.
// Así el escenario y el personaje se sienten sincronizados: mientras estás
// cerca del centro te ves caminar de verdad, y solo cuando te acercas al
// borde de la pantalla la cámara reacciona para mantenerte a la vista.
function actualizarCamara(vw, vh) {
    const zonaX = vw * 0.18;
    const zonaY = vh * 0.18;

    const izquierda = camaraX + zonaX;
    const derecha = camaraX + vw - zonaX;
    const arriba = camaraY + zonaY;
    const abajo = camaraY + vh - zonaY;

    if (jugador.x < izquierda) camaraX -= (izquierda - jugador.x);
    else if (jugador.x > derecha) camaraX += (jugador.x - derecha);

    if (jugador.y < arriba) camaraY -= (arriba - jugador.y);
    else if (jugador.y > abajo) camaraY += (jugador.y - abajo);

    camaraX = Math.max(0, Math.min(CONFIG_CAFE.mapa.ancho - vw, camaraX));
    camaraY = Math.max(0, Math.min(CONFIG_CAFE.mapa.alto - vh, camaraY));
    if (CONFIG_CAFE.mapa.ancho < vw) camaraX = (CONFIG_CAFE.mapa.ancho - vw) / 2;
    if (CONFIG_CAFE.mapa.alto < vh) camaraY = (CONFIG_CAFE.mapa.alto - vh) / 2;
}


// --------------------------------------------------------------------------
// DIBUJO POR FOTOGRAMA
// --------------------------------------------------------------------------

function dibujarEntidadesOrdenadas(c, camX, camY, vw, vh, tiempo) {
    const entidades = [];

    entidades.push({ y: CONFIG_CAFE.escalera.y + 60, dibujar: () => dibujarEscalera(c) });

    for (const m of CONFIG_CAFE.muebles) {
        const dibujante = DIBUJANTES_MUEBLE[m.tipo];
        if (!dibujante) continue;
        const esDecorativoSinAltura = m.tipo === 'alfombra' || m.tipo === 'ventana';
        entidades.push({
            y: esDecorativoSinAltura ? -Infinity : m.y + m.h / 2,
            dibujar: () => dibujante(c, m),
        });
    }

    entidades.push({
        y: jugador.y,
        dibujar: () => dibujarSnoopy(c, jugador.x - camX, jugador.y - camY, jugador.direccion, jugador.moviendo, tiempo),
    });

    entidades.sort((a, b) => a.y - b.y);

    c.save();
    c.translate(-camX, -camY);
    for (const e of entidades) {
        if (e.y !== -Infinity && (e.y < camY - 300 || e.y > camY + vh + 300)) continue;
        e.dibujar();
    }
    c.restore();
}

function dibujarVineta(c, vw, vh) {
    const grad = c.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.4, vw / 2, vh / 2, Math.max(vw, vh) * 0.8);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(20,10,8,0.32)');
    c.fillStyle = grad;
    c.fillRect(0, 0, vw, vh);
}


// --------------------------------------------------------------------------
// BUCLE PRINCIPAL
// --------------------------------------------------------------------------

function bucle(timestampMs) {
    requestAnimationFrame(bucle);
    const tiempo = timestampMs / 1000;
    const dt = Math.min(0.05, (timestampMs - (ultimoTiempo || timestampMs)) / 1000);
    ultimoTiempo = timestampMs;

    const vw = canvas.width / dpr;
    const vh = canvas.height / dpr;

    if (!juegoPausado && entradaHabilitada && elCapaMensaje.classList.contains('oculto')) {
        moverJugador(dt);
        revisarProximidad();
    }

    actualizarCamara(vw, vh);

    ctx.clearRect(0, 0, vw, vh);
    if (capaPiso) {
        ctx.drawImage(capaPiso, camaraX, camaraY, vw, vh, 0, 0, vw, vh);
    }
    dibujarEntidadesOrdenadas(ctx, camaraX, camaraY, vw, vh, tiempo);
    dibujarVineta(ctx, vw, vh);
}


// --------------------------------------------------------------------------
// INICIO
// --------------------------------------------------------------------------

async function iniciar() {
    canvas = document.getElementById('lienzo');
    ctx = canvas.getContext('2d');

    elPantallaCarga = document.getElementById('pantallaCarga');
    elPantallaMusica = document.getElementById('pantallaMusica');
    elBtnMusicaSi = document.getElementById('btnMusicaSi');
    elBtnMusicaNo = document.getElementById('btnMusicaNo');
    elAvisoOrientacion = document.getElementById('avisoOrientacion');
    elPistaTeclado = document.getElementById('pistaTeclado');
    elBtnAlternarMusica = document.getElementById('btnAlternarMusica');
    elIconoMusica = elBtnAlternarMusica.querySelector('.material-symbols-outlined');
    elAvisoDescubrimiento = document.getElementById('avisoDescubrimiento');
    elCapaMensaje = document.getElementById('capaMensaje');
    elTextoMensaje = document.getElementById('textoMensaje');
    elBtnCerrarMensaje = document.getElementById('btnCerrarMensaje');
    elControlesTactiles = document.getElementById('controlesTactiles');

    document.getElementById('textoAvisoDescubrimiento').textContent = CONFIG_CAFE.textos.avisoDescubrimiento;
    document.querySelector('#avisoOrientacion p').textContent = CONFIG_CAFE.textos.avisoOrientacion;
    document.getElementById('tituloBienvenida').textContent = CONFIG_CAFE.textos.tituloBienvenida;
    document.getElementById('preguntaMusica').textContent = CONFIG_CAFE.textos.preguntaMusica;
    elBtnMusicaSi.textContent = CONFIG_CAFE.textos.botonMusicaSi;
    elBtnMusicaNo.textContent = CONFIG_CAFE.textos.botonMusicaNo;
    elPistaTeclado.textContent = CONFIG_CAFE.textos.pistaTeclado;
    document.getElementById('tituloCarga').textContent = CONFIG_CAFE.textos.tituloCarga;

    try {
        await document.fonts.load('18px "Material Symbols Outlined"');
    } catch (err) { /* continúa igual */ }

    ajustarCanvas();
    window.addEventListener('resize', () => { ajustarCanvas(); revisarOrientacion(); });
    window.addEventListener('orientationchange', revisarOrientacion);

    configurarTeclado();
    configurarControlesTactiles();

    // Snoopy SIEMPRE aparece en la escalera al cargar la página
    jugador.x = CONFIG_CAFE.escalera.x;
    jugador.y = CONFIG_CAFE.escalera.y + 60;
    jugador.direccion = 'abajo';

    // La cámara arranca ya centrada en Snoopy, para que no haya un salto
    // visible en el primer fotograma.
    camaraX = jugador.x - window.innerWidth / 2;
    camaraY = jugador.y - window.innerHeight / 2;

    objetosEspecialesEstado = CONFIG_CAFE.objetosEspeciales.map((o) => ({ ...o }));
    colisionables = construirColisionables();
    capaPiso = generarCapaPiso();

    elBtnCerrarMensaje.addEventListener('click', cerrarMensaje);
    elCapaMensaje.addEventListener('click', (e) => { if (e.target === elCapaMensaje) cerrarMensaje(); });

    elPantallaCarga.classList.add('oculto');
    elPantallaMusica.classList.remove('oculto');

    elBtnMusicaSi.addEventListener('click', () => {
        iniciarMusica();
        finalizarConsentimientoMusica();
    });
    elBtnMusicaNo.addEventListener('click', finalizarConsentimientoMusica);
    elBtnAlternarMusica.addEventListener('click', alternarMusica);

    requestAnimationFrame(bucle);
}

function finalizarConsentimientoMusica() {
    elPantallaMusica.classList.add('oculto');
    elBtnAlternarMusica.classList.remove('oculto');
    entradaHabilitada = true;
    solicitarFullscreenSiMovil();
    revisarOrientacion();
}

document.addEventListener('DOMContentLoaded', iniciar);