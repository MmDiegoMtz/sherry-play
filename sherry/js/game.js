/* ==========================================================================
   GAME.JS — Motor del "Bosque de Snoopy"
   Este archivo no necesita editarse para cambios normales (posiciones,
   colores, URLs, velocidad, etc.) — todo eso vive en js/config.js.
   Aquí solo está la lógica: generación del bosque, cámara, colisiones,
   dibujo, entrada de teclado/táctil, música, guardado automático e
   interacciones.
   ========================================================================== */

// --------------------------------------------------------------------------
// ESTADO GLOBAL
// --------------------------------------------------------------------------
let canvas, ctx, dpr = 1;
let ultimoTiempo = 0;
let tiempoJuegoActual = 0; // "tiempo" (segundos) del último fotograma, para poder usarlo fuera del bucle

let camaraX = 0, camaraY = 0;
let imagenes = new Map();
let arboles = [];
let particulas = [];
let farolas = [];
let caminosGenerados = [];
let colisionables = [];

// El fondo (pasto, caminos, estanques, plaza, lámparas, decoración) ya NO
// se prerenderiza en un único canvas gigante del tamaño del mapa completo:
// algunos navegadores móviles (sobre todo gama media/baja) tienen límites
// de tamaño de canvas/textura más bajos de lo que mide nuestro mapa
// (3200x2200), y ese canvas simplemente no se dibuja en esos dispositivos.
// En su lugar se genera en "tiles" (mosaicos) pequeños y solo se dibujan
// los que quedan dentro de la cámara. El resultado visual es idéntico.
let tilesFondo = [];
const TAMANO_TILE_FONDO = 1024;

let jugador = {
    x: 0, y: 0, direccion: 'abajo', moviendo: false,
    enAgua: false,
    temporizadorOnda: 0,
    temporizadorHuella: 0,
    tiempoSalioDelAgua: -Infinity,
    ladoPie: 1,
};
let ubicacionCercana = null;

let ondasAgua = [];
let huellas = [];

let juegoPausado = false;     // true mientras el teléfono está en vertical
let entradaHabilitada = false; // true después de aceptar la pantalla inicial

let audioMusica = null;
let temporizadorMensaje = null;

// --------------------------------------------------------------------------
// CICLO DÍA/NOCHE: desfase para poder "continuar" desde una partida guardada
// --------------------------------------------------------------------------
let desfaseCiclo = 0;

function tiempoCicloConDesfase(tiempo) {
    return tiempo + desfaseCiclo;
}

// --------------------------------------------------------------------------
// GUARDADO AUTOMÁTICO (localStorage)
// --------------------------------------------------------------------------
let temporizadorAutoguardado = 0;
let ultimaPosicionGuardada = { x: null, y: null };

function obtenerFaseCicloActual() {
    const { duracionSegundos } = CONFIG.cicloDiaNoche;
    const tCiclo = tiempoCicloConDesfase(tiempoJuegoActual);
    return ((tCiclo % duracionSegundos) + duracionSegundos) % duracionSegundos / duracionSegundos;
}

function guardarEstado() {
    try {
        const estado = {
            version: 1,
            x: jugador.x,
            y: jugador.y,
            faseCiclo: obtenerFaseCicloActual(),
            guardadoEn: Date.now(),
        };
        localStorage.setItem(CONFIG.guardado.clave, JSON.stringify(estado));
    } catch (err) {
        // localStorage puede fallar (modo privado, cuota llena, etc.). El
        // juego debe seguir funcionando igual aunque no se pueda guardar.
        console.warn('No se pudo guardar el progreso: ' + err);
    }
}

function cargarEstado() {
    try {
        const crudo = localStorage.getItem(CONFIG.guardado.clave);
        if (!crudo) return null;
        const estado = JSON.parse(crudo);
        if (typeof estado.x !== 'number' || typeof estado.y !== 'number' || !isFinite(estado.x) || !isFinite(estado.y)) {
            return null;
        }
        return estado;
    } catch (err) {
        console.warn('No se pudo leer el progreso guardado: ' + err);
        return null;
    }
}

// Autoguardado no invasivo: se revisa en cada fotograma pero solo se
// escribe en localStorage cuando corresponde (por tiempo o por distancia
// recorrida), para no generar escrituras innecesarias.
function actualizarAutoguardado(dt) {
    temporizadorAutoguardado -= dt;

    const distMovida = ultimaPosicionGuardada.x === null
        ? Infinity
        : distancia(jugador.x, jugador.y, ultimaPosicionGuardada.x, ultimaPosicionGuardada.y);

    if (temporizadorAutoguardado <= 0 || distMovida >= CONFIG.guardado.distanciaMinimaParaGuardar) {
        guardarEstado();
        temporizadorAutoguardado = CONFIG.guardado.intervaloSegundos;
        ultimaPosicionGuardada = { x: jugador.x, y: jugador.y };
    }
}

// Mantiene a Snoopy dentro de los límites válidos del mapa. Se usa tanto al
// moverse como al restaurar una posición guardada (por si el mapa cambió de
// tamaño desde la última vez que se guardó la partida).
function clamparPosicionJugador() {
    const m = CONFIG.mapa.margenColision;
    const radio = CONFIG.jugador.radioColision;
    jugador.x = Math.max(m + radio, Math.min(CONFIG.mapa.ancho - m - radio, jugador.x));
    jugador.y = Math.max(m + radio, Math.min(CONFIG.mapa.alto - m - radio, jugador.y));
}

const teclas = new Set();
const tactil = { arriba: false, abajo: false, izquierda: false, derecha: false };

const esMovil = window.matchMedia('(pointer: coarse)').matches;

// Referencias DOM (se asignan en iniciar())
let elLienzo, elPantallaCarga, elPantallaMusica, elBtnMusicaSi,
    elAvisoOrientacion, elPistaTeclado, elAvisoInteraccion,
    elPistaInteraccionTeclado, elBtnAceptarInteraccion, elMensajeFlotante,
    elControlesTactiles, elIndicadorCiclo, elIconoSol, elIconoLuna, elHoraCiclo, elProgresoCiclo;


// --------------------------------------------------------------------------
// UTILIDADES GENERALES
// --------------------------------------------------------------------------

function distancia(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

// ¿El punto (x,y) cae dentro de algún estanque? (prueba punto-en-elipse)
function enEstanque(x, y) {
    for (const e of CONFIG.estanques) {
        const nx = (x - e.x) / e.radioX;
        const ny = (y - e.y) / e.radioY;
        if (nx * nx + ny * ny <= 1) return true;
    }
    return false;
}

// Igual que enEstanque, pero agrandando el estanque por un margen extra
// (para que los árboles no queden pegados al borde del agua).
function enEstanqueConMargen(x, y, margen) {
    for (const e of CONFIG.estanques) {
        const nx = (x - e.x) / (e.radioX + margen);
        const ny = (y - e.y) / (e.radioY + margen);
        if (nx * nx + ny * ny <= 1) return true;
    }
    return false;
}

// Generador de números pseudoaleatorios con semilla fija: el bosque siempre
// se genera exactamente igual entre recargas.
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

function redondearRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function cargarImagenes(urls) {
    const mapa = new Map();
    const promesas = urls.map((url) => new Promise((resolve) => {
        const img = new Image();
        // NOTA: antes se usaba img.crossOrigin = 'anonymous' aquí. Se quitó
        // a propósito: el juego nunca lee píxeles del canvas (no usa
        // getImageData ni toDataURL), así que no lo necesita, y en algunos
        // dispositivos móviles pedir el modo CORS "anonymous" hace que la
        // carga de la imagen falle por completo si el servidor de imágenes
        // no responde con las cabeceras CORS esperadas (algo que puede
        // pasar de forma distinta según el dispositivo/navegador). Sin esa
        // bandera, la imagen se carga y se dibuja igual en todos lados.
        img.onload = () => { mapa.set(url, img); resolve(); };
        img.onerror = () => {
            console.warn('No se pudo cargar la imagen: ' + url);
            resolve();
        };
        img.src = url;
    }));
    return Promise.all(promesas).then(() => mapa);
}


// --------------------------------------------------------------------------
// CAMINOS (curvas entre el centro y cada ubicación)
// --------------------------------------------------------------------------

function puntoDe(id) {
    if (id === 'centro') return { x: CONFIG.centro.x, y: CONFIG.centro.y };
    const u = CONFIG.ubicaciones.find((u) => u.id === id);
    return { x: u.x, y: u.y };
}

function muestrearCurva(x0, y0, cx, cy, x1, y1, n) {
    const puntos = [];
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        const mt = 1 - t;
        puntos.push({
            x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
            y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
        });
    }
    return puntos;
}

function construirCaminos() {
    return CONFIG.caminos.map(([origenId, destinoId, curvatura]) => {
        const p0 = puntoDe(origenId);
        const p1 = puntoDe(destinoId);
        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const largo = Math.hypot(dx, dy) || 1;
        const nx = -dy / largo;
        const ny = dx / largo;
        const cx = mx + nx * curvatura;
        const cy = my + ny * curvatura;
        return { puntos: muestrearCurva(p0.x, p0.y, cx, cy, p1.x, p1.y, 40) };
    });
}

function distanciaPuntoSegmento(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const largo2 = dx * dx + dy * dy;
    let t = largo2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / largo2;
    t = Math.max(0, Math.min(1, t));
    const cx = x1 + t * dx;
    const cy = y1 + t * dy;
    return distancia(px, py, cx, cy);
}

function distanciaAPuntosCamino(x, y, puntos) {
    let min = Infinity;
    for (let i = 0; i < puntos.length - 1; i++) {
        const d = distanciaPuntoSegmento(x, y, puntos[i].x, puntos[i].y, puntos[i + 1].x, puntos[i + 1].y);
        if (d < min) min = d;
    }
    return min;
}

function trazarRuta(ctx, puntos) {
    ctx.beginPath();
    ctx.moveTo(puntos[0].x, puntos[0].y);
    for (let i = 1; i < puntos.length; i++) ctx.lineTo(puntos[i].x, puntos[i].y);
}

function dibujarCaminos(ctx) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const camino of caminosGenerados) {
        trazarRuta(ctx, camino.puntos);
        ctx.strokeStyle = CONFIG.colores.caminoBorde;
        ctx.lineWidth = CONFIG.anchoCamino + 16;
        ctx.stroke();
    }
    for (const camino of caminosGenerados) {
        trazarRuta(ctx, camino.puntos);
        ctx.strokeStyle = CONFIG.colores.camino;
        ctx.lineWidth = CONFIG.anchoCamino;
        ctx.stroke();
    }
}


// --------------------------------------------------------------------------
// GENERACIÓN PROCEDURAL DEL BOSQUE (árboles)
// --------------------------------------------------------------------------

function generarArboles() {
    const rng = mulberry32(CONFIG.arboles.semilla);
    const resultado = [];
    const maxIntentos = CONFIG.arboles.cantidad * 14;
    const margen = CONFIG.mapa.margenColision + 50;
    let intentos = 0;

    while (resultado.length < CONFIG.arboles.cantidad && intentos < maxIntentos) {
        intentos++;
        const x = margen + rng() * (CONFIG.mapa.ancho - margen * 2);
        const y = margen + rng() * (CONFIG.mapa.alto - margen * 2);

        if (distancia(x, y, CONFIG.centro.x, CONFIG.centro.y) < CONFIG.centro.radioPlaza + 50) continue;

        if (enEstanqueConMargen(x, y, CONFIG.arboles.margenEstanques)) continue;

        let chocaEdificio = false;
        for (const u of CONFIG.ubicaciones) {
            if (distancia(x, y, u.x, u.y) < CONFIG.arboles.margenEdificios + u.anchoObjetivo / 2) {
                chocaEdificio = true;
                break;
            }
        }
        if (chocaEdificio) continue;

        let chocaCamino = false;
        for (const camino of caminosGenerados) {
            if (distanciaAPuntosCamino(x, y, camino.puntos) < CONFIG.arboles.margenCaminos) {
                chocaCamino = true;
                break;
            }
        }
        if (chocaCamino) continue;

        let chocaArbol = false;
        for (const a of resultado) {
            if (distancia(x, y, a.x, a.y) < CONFIG.arboles.separacionMinima) {
                chocaArbol = true;
                break;
            }
        }
        if (chocaArbol) continue;

        resultado.push({
            x, y,
            tipoIndex: Math.floor(rng() * CONFIG.arboles.tipos.length),
            escala: CONFIG.arboles.escalaMin + rng() * (CONFIG.arboles.escalaMax - CONFIG.arboles.escalaMin),
        });
    }

    return resultado;
}


// --------------------------------------------------------------------------
// DECORACIÓN AMBIENTAL (flores, arbustos, piedras — sin colisión)
// --------------------------------------------------------------------------

function dibujarFlor(ctx, x, y, rng) {
    const colores = [CONFIG.colores.rosaPastel, CONFIG.colores.lilaPastel, CONFIG.colores.luzCalida];
    const color = colores[Math.floor(rng() * colores.length)];
    for (let i = 0; i < 5; i++) {
        const ang = (Math.PI * 2 / 5) * i;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * 3.2, y + Math.sin(ang) * 3.2, 2.4, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = CONFIG.colores.luzCalida;
    ctx.beginPath();
    ctx.arc(x, y, 1.6, 0, Math.PI * 2);
    ctx.fill();
}

function dibujarArbusto(ctx, x, y, rng) {
    ctx.fillStyle = 'rgba(62,40,94,0.12)';
    ctx.beginPath();
    ctx.ellipse(x, y + 5, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = CONFIG.colores.verde;
    for (let i = 0; i < 3; i++) {
        const ox = (rng() - 0.5) * 14;
        ctx.beginPath();
        ctx.arc(x + ox, y - rng() * 4, 9 + rng() * 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function dibujarPiedra(ctx, x, y, rng) {
    ctx.fillStyle = 'rgba(62,40,94,0.10)';
    ctx.beginPath();
    ctx.ellipse(x, y + 3, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C9BFE0';
    ctx.beginPath();
    ctx.ellipse(x, y, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
}

function dibujarDecoracionAmbiental(ctx) {
    const rng = mulberry32(555);
    for (let i = 0; i < 260; i++) {
        const x = rng() * CONFIG.mapa.ancho;
        const y = rng() * CONFIG.mapa.alto;

        if (distancia(x, y, CONFIG.centro.x, CONFIG.centro.y) < CONFIG.centro.radioPlaza + 20) continue;

        let cerca = false;
        for (const camino of caminosGenerados) {
            if (distanciaAPuntosCamino(x, y, camino.puntos) < 26) { cerca = true; break; }
        }
        if (cerca) continue;

        const tipo = rng();
        if (tipo < 0.5) dibujarFlor(ctx, x, y, rng);
        else if (tipo < 0.8) dibujarArbusto(ctx, x, y, rng);
        else dibujarPiedra(ctx, x, y, rng);
    }
}

function dibujarEstanque(ctx, e) {
    ctx.fillStyle = 'rgba(62,40,94,0.15)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + 8, e.radioX + 8, e.radioY + 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = CONFIG.colores.agua;
    ctx.beginPath();
    ctx.ellipse(e.x, e.y, e.radioX, e.radioY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(e.x, e.y, e.radioX * 0.6, e.radioY * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
}

function dibujarFarola(ctx, x, y) {
    const imgPoste = imagenes.get(CONFIG.farola.imagenPoste);
    if (!imgPoste) return;

    // El poste se apoya con su base en (x, y) y se extiende hacia arriba.
    const anchoPoste = CONFIG.farola.anchoPoste;
    const altoPoste = (imgPoste.naturalHeight / imgPoste.naturalWidth) * anchoPoste;
    ctx.drawImage(imgPoste, x - anchoPoste / 2, y - altoPoste, anchoPoste, altoPoste);
}

// Calcula dónde van todas las lámparas del bosque: 4 alrededor de la plaza
// central y una junto a cada edificio (sobre el camino hacia el centro),
// para reforzar la iluminación nocturna en los puntos donde el jugador
// suele detenerse.
function calcularFarolas() {
    const puntos = [];
    const { x, y, radioPlaza } = CONFIG.centro;

    const totalPlaza = 4;
    for (let i = 0; i < totalPlaza; i++) {
        const ang = (Math.PI * 2 / totalPlaza) * i + Math.PI / 4;
        puntos.push({ x: x + Math.cos(ang) * (radioPlaza - 30), y: y + Math.sin(ang) * (radioPlaza - 30) });
    }

    for (const u of CONFIG.ubicaciones) {
        const dx = CONFIG.centro.x - u.x;
        const dy = CONFIG.centro.y - u.y;
        const largo = Math.hypot(dx, dy) || 1;
        const nx = dx / largo, ny = dy / largo;
        const px = -ny, py = nx;
        puntos.push({
            x: u.x + nx * CONFIG.farolasExtra.distanciaHaciaCentro + px * CONFIG.farolasExtra.desplazamientoLateral,
            y: u.y + ny * CONFIG.farolasExtra.distanciaHaciaCentro + py * CONFIG.farolasExtra.desplazamientoLateral,
        });
    }

    return puntos;
}

function dibujarPlazaCentral(ctx) {
    const { x, y, radioPlaza, imagenUrl, anchoImagen } = CONFIG.centro;

    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.beginPath();
    ctx.arc(x, y, radioPlaza, 0, Math.PI * 2);
    ctx.fill();

    // El círculo central del mapa es la imagen proporcionada (ya no se
    // dibuja una fuente hecha con formas).
    const img = imagenes.get(imagenUrl);
    if (img) {
        const alto = (img.naturalHeight / img.naturalWidth) * anchoImagen;
        ctx.drawImage(img, x - anchoImagen / 2, y - alto / 2, anchoImagen, alto);
    }
}

// Dibuja TODA la capa estática del mundo (pasto, estanques, caminos, plaza,
// lámparas, decoración) usando siempre coordenadas absolutas del mapa
// (CONFIG.mapa.ancho / CONFIG.mapa.alto), nunca el tamaño del canvas que
// recibe. Así, esta misma función sirve tanto si se le pasa el contexto de
// un canvas gigante como el de un tile pequeño y trasladado: lo que caiga
// fuera del tile simplemente no se dibuja (el canvas lo recorta solo).
function dibujarCapaEstaticaDelMundo(fctx) {
    const anchoMundo = CONFIG.mapa.ancho;
    const altoMundo = CONFIG.mapa.alto;

    fctx.fillStyle = CONFIG.colores.pastoOscuro;
    fctx.fillRect(0, 0, anchoMundo, altoMundo);

    const rngTextura = mulberry32(99);

    // Capa 1: manchas grandes y suaves (variación de tono a gran escala)
    for (let i = 0; i < 900; i++) {
        const x = rngTextura() * anchoMundo;
        const y = rngTextura() * altoMundo;
        const r = 40 + rngTextura() * 90;
        fctx.globalAlpha = 0.05 + rngTextura() * 0.05;
        fctx.fillStyle = rngTextura() < 0.5 ? CONFIG.colores.pastoClaro : CONFIG.colores.pastoMedio;
        fctx.beginPath();
        fctx.arc(x, y, r, 0, Math.PI * 2);
        fctx.fill();
    }

    // Capa 2: matas de hierba (trazos cortos y rotados) para que no se vea plano
    fctx.globalAlpha = 1;
    fctx.lineCap = 'round';
    for (let i = 0; i < 5200; i++) {
        const x = rngTextura() * anchoMundo;
        const y = rngTextura() * altoMundo;
        const largo = 5 + rngTextura() * 6;
        const angulo = rngTextura() * Math.PI * 2;
        const tono = rngTextura();
        fctx.strokeStyle = tono < 0.4 ? CONFIG.colores.pastoOscuro
            : tono < 0.8 ? CONFIG.colores.pastoMedio
                : CONFIG.colores.pastoClaro;
        fctx.globalAlpha = 0.35 + rngTextura() * 0.3;
        fctx.lineWidth = 1.4;
        fctx.beginPath();
        fctx.moveTo(x, y);
        fctx.lineTo(x + Math.cos(angulo) * largo, y - Math.sin(angulo) * largo * 1.6);
        fctx.stroke();
    }

    // Capa 3: motas muy sutiles en lila, para unir visualmente el pasto con
    // los árboles y objetos de la paleta principal.
    for (let i = 0; i < 260; i++) {
        const x = rngTextura() * anchoMundo;
        const y = rngTextura() * altoMundo;
        fctx.globalAlpha = 0.05 + rngTextura() * 0.05;
        fctx.fillStyle = CONFIG.colores.tintePasto;
        fctx.beginPath();
        fctx.arc(x, y, 14 + rngTextura() * 20, 0, Math.PI * 2);
        fctx.fill();
    }
    fctx.globalAlpha = 1;

    for (const e of CONFIG.estanques) dibujarEstanque(fctx, e);
    dibujarCaminos(fctx);
    dibujarPlazaCentral(fctx);
    for (const f of farolas) dibujarFarola(fctx, f.x, f.y);
    dibujarDecoracionAmbiental(fctx);
}

// Genera el fondo del mundo en mosaicos ("tiles") pequeños en vez de un
// único canvas gigante del tamaño completo del mapa. Esto es lo que
// soluciona que el pasto/caminos/lámparas no aparecieran en varios
// teléfonos: un canvas de 3200x2200 supera el límite de tamaño de
// canvas/textura de bastantes navegadores móviles, y en esos dispositivos
// se queda en blanco sin avisar. Con tiles de 1024x1024 (bien por debajo de
// cualquier límite razonable) el resultado visual es idéntico mientras que
// se puede dibujar en cualquier dispositivo. Es trabajo que se hace una
// sola vez, al cargar el juego.
function generarTilesFondo() {
    const tiles = [];
    const columnas = Math.ceil(CONFIG.mapa.ancho / TAMANO_TILE_FONDO);
    const filas = Math.ceil(CONFIG.mapa.alto / TAMANO_TILE_FONDO);

    for (let fila = 0; fila < filas; fila++) {
        for (let col = 0; col < columnas; col++) {
            const tileX = col * TAMANO_TILE_FONDO;
            const tileY = fila * TAMANO_TILE_FONDO;
            const tileAncho = Math.min(TAMANO_TILE_FONDO, CONFIG.mapa.ancho - tileX);
            const tileAlto = Math.min(TAMANO_TILE_FONDO, CONFIG.mapa.alto - tileY);

            const c = document.createElement('canvas');
            c.width = tileAncho;
            c.height = tileAlto;
            const fctx = c.getContext('2d');

            fctx.save();
            fctx.translate(-tileX, -tileY);
            dibujarCapaEstaticaDelMundo(fctx);
            fctx.restore();

            tiles.push({ x: tileX, y: tileY, w: tileAncho, h: tileAlto, canvas: c });
        }
    }

    return tiles;
}

// Dibuja en el canvas visible únicamente los tiles de fondo que quedan
// dentro de la cámara (con su recorte exacto), en vez del mapa completo.
function dibujarFondoVisible(ctx, camX, camY, vw, vh) {
    for (const t of tilesFondo) {
        const ix1 = Math.max(t.x, camX);
        const iy1 = Math.max(t.y, camY);
        const ix2 = Math.min(t.x + t.w, camX + vw);
        const iy2 = Math.min(t.y + t.h, camY + vh);
        if (ix2 <= ix1 || iy2 <= iy1) continue; // este tile no es visible ahora mismo

        const srcX = ix1 - t.x;
        const srcY = iy1 - t.y;
        const srcW = ix2 - ix1;
        const srcH = iy2 - iy1;
        const destX = ix1 - camX;
        const destY = iy1 - camY;

        ctx.drawImage(t.canvas, srcX, srcY, srcW, srcH, destX, destY, srcW, srcH);
    }
}


// --------------------------------------------------------------------------
// PARTÍCULAS MÁGICAS
// --------------------------------------------------------------------------

function generarParticulas() {
    const rng = mulberry32(777);
    const arr = [];
    for (let i = 0; i < CONFIG.particulas.cantidad; i++) {
        arr.push({
            x: rng() * CONFIG.mapa.ancho,
            y: rng() * CONFIG.mapa.alto,
            radio: CONFIG.particulas.radioMin + rng() * (CONFIG.particulas.radioMax - CONFIG.particulas.radioMin),
            color: CONFIG.particulas.colores[Math.floor(rng() * CONFIG.particulas.colores.length)],
            fase: rng() * Math.PI * 2,
            faseAlpha: rng() * Math.PI * 2,
            offsetX: (rng() - 0.5) * 50,
            offsetY: (rng() - 0.5) * 50,
        });
    }
    return arr;
}

function dibujarParticulas(ctx, tiempo, camX, camY, vw, vh) {
    for (const p of particulas) {
        const px = p.x + Math.sin(tiempo * 0.4 + p.fase) * p.offsetX * 0.3;
        const py = p.y + Math.cos(tiempo * 0.35 + p.fase) * p.offsetY * 0.3;

        if (px < camX - 20 || px > camX + vw + 20 || py < camY - 20 || py > camY + vh + 20) continue;

        const alpha = 0.22 + (Math.sin(tiempo * 0.6 + p.faseAlpha) + 1) / 2 * 0.45;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px - camX, py - camY, p.radio, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


// --------------------------------------------------------------------------
// AGUA: ondas al caminar dentro del estanque, y huellas al salir
// --------------------------------------------------------------------------

// Revisa si Snoopy está en el agua, genera ondas mientras esté ahí, y
// controla la ventana de tiempo en la que se generan huellas al salir.
function actualizarEfectosAgua(dt, tiempo) {
    const estabaEnAgua = jugador.enAgua;
    jugador.enAgua = enEstanque(jugador.x, jugador.y);

    // Justo al salir del agua: se abre la ventana de "huellas mojadas".
    if (estabaEnAgua && !jugador.enAgua) {
        jugador.tiempoSalioDelAgua = tiempo;
        jugador.temporizadorHuella = 0;
    }

    // Ondas mientras está dentro del agua.
    if (jugador.enAgua) {
        jugador.temporizadorOnda -= dt;
        if (jugador.temporizadorOnda <= 0) {
            jugador.temporizadorOnda = CONFIG.efectosAgua.intervaloOndas;
            ondasAgua.push({
                x: jugador.x,
                y: jugador.y + 10,
                edad: 0,
            });
        }
    }

    for (let i = ondasAgua.length - 1; i >= 0; i--) {
        ondasAgua[i].edad += dt;
        if (ondasAgua[i].edad >= CONFIG.efectosAgua.duracionOnda) ondasAgua.splice(i, 1);
    }

    // Huellas: solo dentro de la ventana posterior a salir del agua, y solo
    // mientras Snoopy camina sobre pasto (no dentro del agua).
    const dentroDeVentana = (tiempo - jugador.tiempoSalioDelAgua) <= CONFIG.huellas.ventanaSpawnSegundos;

    if (!jugador.enAgua && dentroDeVentana && jugador.moviendo) {
        jugador.temporizadorHuella -= dt;
        if (jugador.temporizadorHuella <= 0) {
            jugador.temporizadorHuella = CONFIG.huellas.intervaloPasos;
            jugador.ladoPie *= -1;

            const angulo = Math.atan2(
                jugador.direccion === 'abajo' ? 1 : jugador.direccion === 'arriba' ? -1 : 0,
                jugador.direccion === 'derecha' ? 1 : jugador.direccion === 'izquierda' ? -1 : 0
            );
            const perpX = -Math.sin(angulo) * CONFIG.huellas.separacionLateral * jugador.ladoPie;
            const perpY = Math.cos(angulo) * CONFIG.huellas.separacionLateral * jugador.ladoPie;

            huellas.push({
                x: jugador.x + perpX,
                y: jugador.y + 14 + perpY,
                angulo,
                creada: tiempo,
            });
        }
    }

    // Limpieza de huellas ya cumplidas (con margen para el desvanecido).
    const vidaMax = CONFIG.huellas.vidaTotalSegundos;
    for (let i = huellas.length - 1; i >= 0; i--) {
        if ((tiempo - huellas[i].creada) >= vidaMax) huellas.splice(i, 1);
    }
}

function dibujarOndas(ctx, camX, camY) {
    for (const o of ondasAgua) {
        const progreso = o.edad / CONFIG.efectosAgua.duracionOnda;
        const radio = CONFIG.efectosAgua.radioInicial + (CONFIG.efectosAgua.radioFinal - CONFIG.efectosAgua.radioInicial) * progreso;
        const alpha = CONFIG.efectosAgua.alphaInicial * (1 - progreso);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#EAF6FA';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(o.x - camX, o.y - camY, radio, radio * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

function dibujarHuellas(ctx, camX, camY, tiempo) {
    const { alphaInicial, inicioDesvanecido, vidaTotalSegundos } = CONFIG.huellas;

    for (const h of huellas) {
        const edad = tiempo - h.creada;
        let alpha = alphaInicial;
        if (edad > inicioDesvanecido) {
            const progresoDesvanecido = (edad - inicioDesvanecido) / (vidaTotalSegundos - inicioDesvanecido);
            alpha = alphaInicial * Math.max(0, 1 - progresoDesvanecido);
        }
        if (alpha <= 0) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#3B2A22';
        ctx.translate(h.x - camX, h.y - camY);
        ctx.rotate(h.angulo + Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 3.5, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


// --------------------------------------------------------------------------
// CICLO DE DÍA Y NOCHE
// --------------------------------------------------------------------------

// Devuelve un valor entre 0 (día pleno) y 1 (noche pleno) que sube y baja
// suavemente en un ciclo continuo, sin saltos ni cambios bruscos.
function nivelDeNoche(tiempo) {
    const { duracionSegundos } = CONFIG.cicloDiaNoche;
    const fase = (tiempo % duracionSegundos) / duracionSegundos;
    return (1 - Math.cos(fase * Math.PI * 2)) / 2;
}

function dibujarCicloDiaNoche(ctx, vw, vh, tiempo) {
    const nivel = nivelDeNoche(tiempo);
    if (nivel <= 0.001) return;

    const alpha = nivel * CONFIG.cicloDiaNoche.oscuridadMaxima;
    ctx.fillStyle = `rgba(${CONFIG.cicloDiaNoche.colorNoche}, ${alpha})`;
    ctx.fillRect(0, 0, vw, vh);
}

// Resplandor cálido de las lámparas: apagado de día, se enciende gradualmente
// al anochecer (mismo "nivel" que oscurece el cielo) y se apaga al amanecer.
// Se dibuja DESPUÉS del tinte nocturno para que el brillo no quede opacado
// por la oscuridad y se note bien durante la noche.
function dibujarBrilloFarolas(ctx, camX, camY, tiempo) {
    const nivel = nivelDeNoche(tiempo);
    if (nivel <= 0.02) return; // de día, las lámparas están apagadas: no se dibuja nada

    const { radio, colorRGB, alphaMax } = CONFIG.farola.brillo;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const f of farolas) {
        const lx = f.x - camX;
        const ly = f.y - camY - CONFIG.farola.alturaLuz;

        const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, radio);
        grad.addColorStop(0, `rgba(${colorRGB}, ${alphaMax * nivel})`);
        grad.addColorStop(0.6, `rgba(${colorRGB}, ${alphaMax * nivel * 0.35})`);
        grad.addColorStop(1, `rgba(${colorRGB}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(lx, ly, radio, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// Actualiza la pequeña interfaz de hora / sol-luna / barra de progreso.
// Se llama con un pequeño throttle (no hace falta más de ~6 veces por
// segundo) para no generar trabajo de DOM innecesario.
let temporizadorIndicadorCiclo = 0;
function actualizarIndicadorCiclo(dt, tiempo) {
    temporizadorIndicadorCiclo -= dt;
    if (temporizadorIndicadorCiclo > 0) return;
    temporizadorIndicadorCiclo = 0.16;

    const { duracionSegundos } = CONFIG.cicloDiaNoche;
    const fase = (tiempo % duracionSegundos) / duracionSegundos;
    const nivel = nivelDeNoche(tiempo);

    // fase 0 = mediodía, 0.25 = atardecer, 0.5 = medianoche, 0.75 = amanecer
    const horaDecimal = (fase * 24 + 12) % 24;
    let h = Math.floor(horaDecimal);
    const m = Math.floor((horaDecimal - h) * 60);
    const periodo = h < 12 ? 'AM' : 'PM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    elHoraCiclo.textContent = `${h12}:${String(m).padStart(2, '0')} ${periodo}`;

    elProgresoCiclo.style.width = `${fase * 100}%`;
    elIconoSol.style.opacity = String(1 - nivel);
    elIconoLuna.style.opacity = String(nivel);
}


// --------------------------------------------------------------------------
// SNOOPY PIXELADO — sprites por dirección
// --------------------------------------------------------------------------
// El sprite de perfil está dibujado MIRANDO A LA IZQUIERDA (hocico a la
// izquierda, oreja y cola a la derecha). Por eso el volteo horizontal se
// aplica a 'derecha' y no a 'izquierda': así el cuerpo y el avance de las
// patas siempre coinciden con la dirección real del desplazamiento.
//
// El ciclo lateral tiene 4 cuadros: contacto (una pata adelante y la
// contraria atrás), pase, contacto con las posiciones intercambiadas, y
// pase. La pata lejana se dibuja en el tono oscuro del contorno, que es el
// único recurso que da la paleta para distinguir cuál va delante y cuál
// detrás; sin eso los dos cuadros de zancada se verían idénticos.
//
// Paleta: B = contorno oscuro, W = cuerpo blanco, R = collar rojo.

// Cabeza y torso de perfil: idénticos al diseño original y constantes entre
// cuadros. Lo único que se anima son las patas.
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

// Las 4 variantes de patas (filas 21 a 24). El personaje avanza hacia la
// IZQUIERDA de la cuadrícula, así que "adelante" = columnas bajas.
//   0: contacto — pata cercana (blanca) adelante, pata lejana (oscura) atrás
//   1: pase     — la pata lejana despega y pasa por debajo del cuerpo
//   2: contacto — posiciones intercambiadas
//   3: pase     — ahora despega la pata cercana
const SNOOPY_PERFIL_PATAS = [
    [
        "......BWWWBBBBB.....",
        ".....BWWWB.BBBBB....",
        "....BWWWWB..BBBBB...",
        "...BBBBBBB...BBBBB..",
    ],
    [
        "......BWWWBBBBB.....",
        "......BWWWBBBBB.....",
        "......BWWWBBBBB.....",
        ".....BBBBBB.........",
    ],
    [
        ".....BBBBBWWWB......",
        "....BBBBB.BWWWB.....",
        "...BBBBB..BWWWWB....",
        "..BBBBB...BBBBBBB...",
    ],
    [
        ".....BBBBBWWWB......",
        ".....BBBBBWWWB......",
        "....BBBBB.BWWWB.....",
        "...BBBBBB...........",
    ],
];

// Vistas de frente y de espaldas, con el mismo ancho visual que el perfil:
// la cabeza ocupa las columnas 3-16 y el cuerpo las 5-14.
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

// Torso común a frente y espaldas, con el collar rojo arriba (el mismo que
// se ve de perfil, para que la silueta sea continua al girar).
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

// Patas de frente/espaldas: alternan cuál queda apoyada y cuál despega.
const SNOOPY_PATAS_FRONTALES = [
    [
        "......BWWBBWWB......",
        "......BWWBBWWB......",
        "......BWWBBBBB......",
        ".....BBBB...........",
    ],
    [
        "......BWWBBWWB......",
        "......BWWBBWWB......",
        "......BWWBBWWB......",
        ".....BBBB..BBBB.....",
    ],
    [
        "......BWWBBWWB......",
        "......BWWBBWWB......",
        "......BBBBBWWB......",
        "...........BBBB.....",
    ],
    [
        "......BWWBBWWB......",
        "......BWWBBWWB......",
        "......BWWBBWWB......",
        ".....BBBB..BBBB.....",
    ],
];

// Ensambla cabeza (+ torso) + patas en cuadrículas completas de 20x25.
function armarCuadrosSnoopy(cuerpo, patasPorCuadro, torso) {
    return patasPorCuadro.map((patas) => (torso ? [...cuerpo, ...torso, ...patas] : [...cuerpo, ...patas]));
}

const SNOOPY_CUADROS_PERFIL = armarCuadrosSnoopy(SNOOPY_PERFIL_CUERPO, SNOOPY_PERFIL_PATAS);
const SNOOPY_CUADROS_FRENTE = armarCuadrosSnoopy(SNOOPY_CABEZA_FRENTE, SNOOPY_PATAS_FRONTALES, SNOOPY_TORSO_FRONTAL);
const SNOOPY_CUADROS_ESPALDA = armarCuadrosSnoopy(SNOOPY_CABEZA_ESPALDA, SNOOPY_PATAS_FRONTALES, SNOOPY_TORSO_FRONTAL);

const SNOOPY_FRAMES = {
    izquierda: SNOOPY_CUADROS_PERFIL,
    derecha: SNOOPY_CUADROS_PERFIL, // se voltea al dibujar
    abajo: SNOOPY_CUADROS_FRENTE,
    arriba: SNOOPY_CUADROS_ESPALDA,
};

const SNOOPY_PIXEL_COLORES = { B: '#33383b', W: '#f2f5f7', R: '#9c1020' };
const SNOOPY_PIXEL_TAM = 3.1; // tamaño en pantalla de cada "pixel" del sprite
const SNOOPY_CUADROS_POR_SEGUNDO = 7; // velocidad del ciclo de caminata

function dibujarSnoopy(ctx, x, y, direccion, caminando, tiempo) {
    const escala = CONFIG.jugador.escala;

    const cuadros = SNOOPY_FRAMES[direccion] || SNOOPY_CUADROS_FRENTE;
    // Parado siempre se ve el cuadro 1 (patas juntas, pose de reposo).
    const fotograma = caminando
        ? (Math.floor(tiempo * SNOOPY_CUADROS_POR_SEGUNDO) % cuadros.length)
        : 1;
    const grilla = cuadros[fotograma];

    // El bamboleo se deriva del cuadro en vez del reloj, así el cuerpo sube
    // justo en los cuadros de "pase" (1 y 3) y nunca se desincroniza.
    const bamboleo = caminando && (fotograma % 2 === 1) ? -1.3 : 0;

    const filas = grilla.length;
    const columnas = grilla[0].length;
    const anchoTotal = columnas * SNOOPY_PIXEL_TAM;
    const altoTotal = filas * SNOOPY_PIXEL_TAM;

    ctx.save();
    ctx.translate(x, y + bamboleo);
    ctx.scale(escala, escala);

    // Sombra (se compensa el bamboleo para que quede pegada al suelo)
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, altoTotal * 0.42 - bamboleo, anchoTotal * 0.32, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // El sprite de perfil mira a la IZQUIERDA; para 'derecha' se voltea
    // horizontalmente completo.
    if (direccion === 'derecha') ctx.scale(-1, 1);

    ctx.translate(-anchoTotal / 2, -altoTotal * 0.78);

    for (let fila = 0; fila < filas; fila++) {
        const linea = grilla[fila];
        for (let col = 0; col < columnas; col++) {
            const c = linea[col];
            if (c === '.') continue;
            ctx.fillStyle = SNOOPY_PIXEL_COLORES[c];
            ctx.fillRect(
                col * SNOOPY_PIXEL_TAM,
                fila * SNOOPY_PIXEL_TAM,
                SNOOPY_PIXEL_TAM + 0.5,
                SNOOPY_PIXEL_TAM + 0.5
            );
        }
    }

    ctx.restore();
}

// --------------------------------------------------------------------------
// EDIFICIOS: etiqueta y colisiones
// --------------------------------------------------------------------------

function dibujarEtiquetaLugar(ctx, u, altoImg, camX, camY) {
    const fontIcono = '18px "Material Symbols Outlined"';
    const fontTexto = '600 13px "Inter", sans-serif';
    const espacio = 6;
    const padX = 12;

    ctx.font = fontIcono;
    const anchoIcono = ctx.measureText(u.icono).width;
    ctx.font = fontTexto;
    const anchoTexto = ctx.measureText(u.nombre).width;

    const anchoTag = anchoIcono + espacio + anchoTexto + padX * 2;
    const altoTag = 26;
    const tx = u.x - camX - anchoTag / 2;
    const ty = u.y - camY - altoImg - 16 - altoTag;

    ctx.fillStyle = 'rgba(62,40,94,0.82)';
    redondearRect(ctx, tx, ty, anchoTag, altoTag, 13);
    ctx.fill();

    ctx.fillStyle = CONFIG.colores.luzCalida;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    ctx.font = fontIcono;
    ctx.fillText(u.icono, tx + padX, ty + altoTag / 2 + 1);

    ctx.fillStyle = '#ffffff';
    ctx.font = fontTexto;
    ctx.fillText(u.nombre, tx + padX + anchoIcono + espacio, ty + altoTag / 2 + 1);
}

// La colisión de cada árbol ahora usa "radioTronco" (definido en
// config.js, por tipo de árbol) en vez de derivarlo del ancho completo de
// la imagen (que incluye la copa). También se atenúa el efecto de la
// escala aleatoria del árbol: un árbol dibujado más grande o más chico no
// debería tener un tronco proporcionalmente mucho más grueso o delgado, así
// que solo se aplica una fracción de esa variación al radio de colisión.
function construirColisionesArboles() {
    return arboles.map((a) => {
        const tipo = CONFIG.arboles.tipos[a.tipoIndex];
        const factorEscala = 0.85 + 0.15 * a.escala; // variación suave, no proporcional 1:1
        return { tipo: 'circulo', x: a.x, y: a.y - 4, radio: tipo.radioTronco * factorEscala };
    });
}

function construirColisionesEdificios() {
    return CONFIG.ubicaciones.map((u) => {
        const img = imagenes.get(u.imagenUrl);
        const ancho = u.anchoObjetivo;
        const alto = img ? (img.naturalHeight / img.naturalWidth) * ancho : ancho;
        u._ancho = ancho;
        u._alto = alto;
        return {
            tipo: 'rect',
            x: u.x - ancho * 0.32,
            y: u.y - alto * 0.20,
            w: ancho * 0.64,
            h: alto * 0.20 + 10,
        };
    });
}


// --------------------------------------------------------------------------
// COLISIONES Y MOVIMIENTO
// --------------------------------------------------------------------------

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

    const velocidad = CONFIG.jugador.velocidad * dt;
    const radio = CONFIG.jugador.radioColision;

    const nuevoX = jugador.x + dx * velocidad;
    if (!colisionaEnPunto(nuevoX, jugador.y, radio)) jugador.x = nuevoX;

    const nuevoY = jugador.y + dy * velocidad;
    if (!colisionaEnPunto(jugador.x, nuevoY, radio)) jugador.y = nuevoY;

    clamparPosicionJugador();
}


// --------------------------------------------------------------------------
// INTERACCIÓN CON LOS LUGARES
// --------------------------------------------------------------------------

function revisarInteraccion() {
    let cercano = null;
    let menorDist = Infinity;

    for (const u of CONFIG.ubicaciones) {
        const cx = u.x;
        const cy = u.y - (u._alto || 100) * 0.35;
        const radioZona = Math.max(u._ancho || 180, u._alto || 180) * 0.55 + 40;
        const d = distancia(jugador.x, jugador.y, cx, cy);
        if (d < radioZona && d < menorDist) {
            menorDist = d;
            cercano = u;
        }
    }

    if (cercano !== ubicacionCercana) {
        ubicacionCercana = cercano;
        actualizarAvisoInteraccion();
    }
}

function actualizarAvisoInteraccion() {
    if (!ubicacionCercana) {
        elAvisoInteraccion.classList.add('oculto');
        return;
    }
    elAvisoInteraccion.classList.remove('oculto');
    if (esMovil) {
        elPistaInteraccionTeclado.classList.add('oculto');
        elBtnAceptarInteraccion.classList.remove('oculto');
    } else {
        elPistaInteraccionTeclado.classList.remove('oculto');
        elBtnAceptarInteraccion.classList.add('oculto');
    }
}

function mostrarMensajeFlotante(texto, icono) {
    elMensajeFlotante.innerHTML = `<span class="material-symbols-outlined">${icono || 'info'}</span><span>${texto}</span>`;
    elMensajeFlotante.classList.remove('oculto');
    clearTimeout(temporizadorMensaje);
    temporizadorMensaje = setTimeout(() => elMensajeFlotante.classList.add('oculto'), 2200);
}

function navegarA(u) {
    // Se guarda el progreso justo antes de salir de la página, para que la
    // posición y el ciclo día/noche queden al día incluso si el destino
    // final todavía no existe.
    guardarEstado();

    if (u.url && u.url.trim() !== '') {
        window.location.href = u.url;
    } else {
        mostrarMensajeFlotante(CONFIG.textos.sinEnlace, CONFIG.textos.iconoSinEnlace);
    }
}


// --------------------------------------------------------------------------
// MÚSICA
// --------------------------------------------------------------------------
// La música ahora se activa una sola vez, al aceptar la pantalla inicial, y
// ya no existe ninguna forma de silenciarla desde la interfaz (no hay botón
// flotante ni función para pausarla/reanudarla).

function iniciarMusica() {
    if (!audioMusica) {
        audioMusica = new Audio(CONFIG.musica.ruta);
        audioMusica.loop = true;
        audioMusica.volume = CONFIG.musica.volumen;
    }
    audioMusica.play().catch(() => {
        console.warn('No se pudo reproducir la música. Verifica que exista el archivo en: ' + CONFIG.musica.ruta);
    });
}



function solicitarFullscreenSiMovil() {
    if (!esMovil) return;

    const el = document.documentElement;
    const solicitar = el.requestFullscreen
        || el.webkitRequestFullscreen
        || el.mozRequestFullScreen
        || el.msRequestFullscreen;

    if (!solicitar) return;

    try {
        const resultado = solicitar.call(el);
        if (resultado && typeof resultado.catch === 'function') {
            resultado.catch(() => { /* Bloqueado por el navegador: no pasa nada. */ });
        }
    } catch (err) {
        // Algunos navegadores lanzan de forma síncrona si no se permite; se ignora.
    }
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
        const activar = (e) => { e.preventDefault(); tactil[dir] = true; boton.classList.add('activo'); };
        const desactivar = (e) => { if (e) e.preventDefault(); tactil[dir] = false; boton.classList.remove('activo'); };

        boton.addEventListener('touchstart', activar, { passive: false });
        boton.addEventListener('touchend', desactivar, { passive: false });
        boton.addEventListener('touchcancel', desactivar, { passive: false });
        boton.addEventListener('mousedown', activar);
        boton.addEventListener('mouseup', desactivar);
        boton.addEventListener('mouseleave', desactivar);
    });
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

function actualizarCamara(vw, vh) {
    camaraX = jugador.x - vw / 2;
    camaraY = jugador.y - vh / 2;
    camaraX = Math.max(0, Math.min(CONFIG.mapa.ancho - vw, camaraX));
    camaraY = Math.max(0, Math.min(CONFIG.mapa.alto - vh, camaraY));
    if (CONFIG.mapa.ancho < vw) camaraX = (CONFIG.mapa.ancho - vw) / 2;
    if (CONFIG.mapa.alto < vh) camaraY = (CONFIG.mapa.alto - vh) / 2;
}


// --------------------------------------------------------------------------
// DIBUJO POR FOTOGRAMA (árboles + edificios + Snoopy, ordenados por profundidad)
// --------------------------------------------------------------------------

function dibujarEntidadesOrdenadas(ctx, camX, camY, vw, vh, tiempo) {
    const entidades = [];

    for (const a of arboles) {
        const tipo = CONFIG.arboles.tipos[a.tipoIndex];
        const img = imagenes.get(tipo.imagenUrl);
        if (!img) continue;
        const ancho = tipo.anchoBase * a.escala;
        const alto = (img.naturalHeight / img.naturalWidth) * ancho;
        entidades.push({
            y: a.y,
            dibujar: () => ctx.drawImage(img, a.x - camX - ancho / 2, a.y - camY - alto, ancho, alto),
        });
    }

    for (const u of CONFIG.ubicaciones) {
        const img = imagenes.get(u.imagenUrl);
        if (!img) continue;
        const ancho = u.anchoObjetivo;
        const alto = u._alto || (img.naturalHeight / img.naturalWidth) * ancho;
        entidades.push({
            y: u.y,
            dibujar: () => {
                ctx.drawImage(img, u.x - camX - ancho / 2, u.y - camY - alto, ancho, alto);
                dibujarEtiquetaLugar(ctx, u, alto, camX, camY);
            },
        });
    }

    entidades.push({
        y: jugador.y,
        dibujar: () => dibujarSnoopy(ctx, jugador.x - camX, jugador.y - camY, jugador.direccion, jugador.moviendo, tiempo),
    });

    entidades.sort((a, b) => a.y - b.y);

    for (const e of entidades) {
        if (e.y < camY - 400 || e.y > camY + vh + 400) continue;
        e.dibujar();
    }
}

function dibujarVineta(ctx, vw, vh) {
    const grad = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.35, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(30,15,50,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, vw, vh);
}


// --------------------------------------------------------------------------
// BUCLE PRINCIPAL
// --------------------------------------------------------------------------

function bucle(timestampMs) {
    requestAnimationFrame(bucle);

    const tiempo = timestampMs / 1000;
    const dt = Math.min(0.05, (timestampMs - (ultimoTiempo || timestampMs)) / 1000);
    ultimoTiempo = timestampMs;
    tiempoJuegoActual = tiempo;

    const vw = canvas.width / dpr;
    const vh = canvas.height / dpr;

    if (!juegoPausado && entradaHabilitada) {
        moverJugador(dt);
        revisarInteraccion();
        actualizarEfectosAgua(dt, tiempo);
        actualizarAutoguardado(dt);
    }

    actualizarCamara(vw, vh);

    const tiempoCiclo = tiempoCicloConDesfase(tiempo);

    ctx.clearRect(0, 0, vw, vh);
    dibujarFondoVisible(ctx, camaraX, camaraY, vw, vh);
    dibujarHuellas(ctx, camaraX, camaraY, tiempo);
    dibujarOndas(ctx, camaraX, camaraY);
    dibujarEntidadesOrdenadas(ctx, camaraX, camaraY, vw, vh, tiempo);
    dibujarParticulas(ctx, tiempo, camaraX, camaraY, vw, vh);
    dibujarCicloDiaNoche(ctx, vw, vh, tiempoCiclo);
    dibujarVineta(ctx, vw, vh);
    dibujarBrilloFarolas(ctx, camaraX, camaraY, tiempoCiclo);

    actualizarIndicadorCiclo(dt, tiempoCiclo);
}


// --------------------------------------------------------------------------
// ENTRADA DE TECLADO
// --------------------------------------------------------------------------

function configurarTeclado() {
    window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
            teclas.add(k);
        }
        if (k === 'e' && entradaHabilitada && !juegoPausado && ubicacionCercana) {
            navegarA(ubicacionCercana);
        }
    });
    window.addEventListener('keyup', (e) => teclas.delete(e.key.toLowerCase()));
}


// --------------------------------------------------------------------------
// GUARDADO: eventos del navegador para no perder progreso al salir
// --------------------------------------------------------------------------

function configurarGuardadoAlSalir() {
    // "pagehide" es el evento más confiable en móvil (incluido Safari en
    // iOS) para detectar que el usuario se va de la página o cambia de app.
    window.addEventListener('pagehide', guardarEstado);
    window.addEventListener('beforeunload', guardarEstado);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) guardarEstado();
    });
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
    elAvisoOrientacion = document.getElementById('avisoOrientacion');
    elPistaTeclado = document.getElementById('pistaTeclado');
    elAvisoInteraccion = document.getElementById('avisoInteraccion');
    elPistaInteraccionTeclado = document.getElementById('pistaInteraccionTeclado');
    elBtnAceptarInteraccion = document.getElementById('btnAceptarInteraccion');
    elMensajeFlotante = document.getElementById('mensajeFlotante');
    elControlesTactiles = document.getElementById('controlesTactiles');
    elIndicadorCiclo = document.getElementById('indicadorCiclo');
    elIconoSol = document.getElementById('iconoSol');
    elIconoLuna = document.getElementById('iconoLuna');
    elHoraCiclo = document.getElementById('horaCiclo');
    elProgresoCiclo = document.getElementById('progresoCiclo');

    // Se precarga la fuente de iconos para que, al dibujar las etiquetas de
    // los lugares sobre el canvas, el icono no aparezca como un cuadro vacío
    // en el primer fotograma.
    try {
        await document.fonts.load('18px "Material Symbols Outlined"');
        await document.fonts.load('600 13px "Inter"');
    } catch (err) {
        // Si por algún motivo no se puede precargar, el juego continúa igual.
    }

    ajustarCanvas();
    window.addEventListener('resize', () => { ajustarCanvas(); revisarOrientacion(); });
    window.addEventListener('orientationchange', revisarOrientacion);

    configurarTeclado();
    configurarControlesTactiles();
    configurarGuardadoAlSalir();

    // --- Recuperar partida guardada (posición + ciclo día/noche), si existe ---
    const estadoGuardado = cargarEstado();
    if (estadoGuardado) {
        jugador.x = estadoGuardado.x;
        jugador.y = estadoGuardado.y;
        clamparPosicionJugador(); // por si el mapa cambió de tamaño desde que se guardó

        if (typeof estadoGuardado.faseCiclo === 'number' && isFinite(estadoGuardado.faseCiclo)) {
            // Se calcula el desfase necesario para que, desde el primer
            // fotograma, el ciclo día/noche continúe justo donde se dejó.
            const tiempoAproxPrimerFotograma = performance.now() / 1000;
            const faseGuardada = ((estadoGuardado.faseCiclo % 1) + 1) % 1;
            desfaseCiclo = faseGuardada * CONFIG.cicloDiaNoche.duracionSegundos - tiempoAproxPrimerFotograma;
        }
    } else {
        jugador.x = CONFIG.jugador.x;
        jugador.y = CONFIG.jugador.y;
    }
    ultimaPosicionGuardada = { x: jugador.x, y: jugador.y };

    caminosGenerados = construirCaminos();
    arboles = generarArboles();
    particulas = generarParticulas();
    farolas = calcularFarolas();

    const urls = [
        ...CONFIG.ubicaciones.map((u) => u.imagenUrl),
        ...CONFIG.arboles.tipos.map((t) => t.imagenUrl),
        CONFIG.farola.imagenPoste,
        CONFIG.centro.imagenUrl,
    ];
    imagenes = await cargarImagenes(urls);

    colisionables = [
        ...construirColisionesArboles(),
        ...construirColisionesEdificios(),
        { tipo: 'circulo', x: CONFIG.centro.x, y: CONFIG.centro.y, radio: CONFIG.centro.radioColisionFuente },
    ];

    tilesFondo = generarTilesFondo();

    elPantallaCarga.classList.add('oculto');
    elPantallaMusica.classList.remove('oculto');

    elBtnMusicaSi.addEventListener('click', () => {
        iniciarMusica();
        finalizarConsentimientoMusica();
    });

    // Arreglo del botón "Aceptar" del aviso de interacción: antes solo la
    // tecla E navegaba al lugar cercano; en móvil (donde no hay teclado)
    // este botón se mostraba pero no tenía ningún listener asociado.
    elBtnAceptarInteraccion.addEventListener('click', () => {
        if (entradaHabilitada && !juegoPausado && ubicacionCercana) {
            navegarA(ubicacionCercana);
        }
    });

    requestAnimationFrame(bucle);
}

function finalizarConsentimientoMusica() {
    elPantallaMusica.classList.add('oculto');
    elIndicadorCiclo.classList.remove('oculto');
    entradaHabilitada = true;
    solicitarFullscreenSiMovil();
    revisarOrientacion();
}

document.addEventListener('DOMContentLoaded', iniciar);