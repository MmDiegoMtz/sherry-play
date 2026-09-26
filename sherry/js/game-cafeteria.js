/* ==========================================================================
   GAME-CAFETERIA.JS
   Versión simple: solo muestra la imagen de la cafetería (sin deformarla,
   adaptada a cualquier pantalla vía CSS), pone música de fondo, y dibuja
   las 5 bolitas brillantes que muestran su mensaje al hacer clic.
   ========================================================================== */

let audioMusica = null;
let primerGestoAtendido = false;

let elOverlayMensajeOculto, elTextoMensajeOculto, elBtnContinuarMensaje,
    elBtnRegresar, elContenedorPuntos;

function iniciarMusica() {
    if (!audioMusica) {
        audioMusica = new Audio(CONFIG_CAFETERIA.musica.ruta);
        audioMusica.loop = true;
        audioMusica.volume = CONFIG_CAFETERIA.musica.volumen;
    }
    if (audioMusica.paused) {
        audioMusica.play().catch(() => {
            // Autoplay bloqueado: no es un error, se reintenta en el
            // primer clic/toque del usuario.
        });
    }
}

function configurarPrimerGesto() {
    const manejar = () => {
        if (primerGestoAtendido) return;
        primerGestoAtendido = true;
        iniciarMusica();
        window.removeEventListener('keydown', manejar);
        window.removeEventListener('touchstart', manejar);
        window.removeEventListener('pointerdown', manejar);
    };
    window.addEventListener('keydown', manejar);
    window.addEventListener('touchstart', manejar, { passive: true });
    window.addEventListener('pointerdown', manejar);
}

function abrirMensaje(texto, punto) {
    elTextoMensajeOculto.textContent = texto;
    elOverlayMensajeOculto.classList.remove('oculto');
    if (punto) punto.classList.add('visto');
}

function cerrarMensaje() {
    elOverlayMensajeOculto.classList.add('oculto');
}

function crearPuntosDeMensaje() {
    CONFIG_CAFETERIA.mensajesOcultos.forEach((m) => {
        const punto = document.createElement('button');
        punto.className = 'punto-mensaje';
        punto.style.left = m.xPorc + '%';
        punto.style.top = m.yPorc + '%';
        punto.setAttribute('aria-label', 'Mensaje oculto');
        punto.innerHTML = '<span class="material-symbols-outlined">favorite</span>';
        punto.addEventListener('click', () => abrirMensaje(m.mensaje, punto));
        elContenedorPuntos.appendChild(punto);
    });
}

function iniciar() {
    elOverlayMensajeOculto = document.getElementById('overlayMensajeOculto');
    elTextoMensajeOculto = document.getElementById('textoMensajeOculto');
    elBtnContinuarMensaje = document.getElementById('btnContinuarMensaje');
    elBtnRegresar = document.getElementById('btnRegresar');
    elContenedorPuntos = document.getElementById('contenedorPuntos');

    document.getElementById('imgCafeteria').src = CONFIG_CAFETERIA.imagenUrl;

    crearPuntosDeMensaje();

    elBtnContinuarMensaje.addEventListener('click', cerrarMensaje);
    elBtnRegresar.addEventListener('click', () => {
        window.location.href = CONFIG_CAFETERIA.salida.url;
    });

    iniciarMusica();         // intento automático (puede quedar bloqueado por el navegador)
    configurarPrimerGesto(); // reintento en el primer clic/toque, sin preguntar nada
}

document.addEventListener('DOMContentLoaded', iniciar);