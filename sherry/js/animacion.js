(function () {
  "use strict";

  var escena     = document.querySelector(".escena");
  var snoopyBody = document.querySelector(".snoopy-body");
  var musica     = document.getElementById("bgMusic");
  var tapHint    = document.getElementById("tapHint");

  // ------------------------------------------------------------------
  // 1) Detección de móvil
  // ------------------------------------------------------------------
  function esMovil() {
    var porUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent);
    var porPuntero = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    return porUA || porPuntero;
  }

  // ------------------------------------------------------------------
  // 2) Escala responsiva de LA ESCENA COMPLETA (casa + snoopy juntos).
  // ------------------------------------------------------------------
  var ANCHO_DISENO = 456;
  var ALTO_DISENO  = 632;
  var escalaEscena = 1;

  function recalcularEscala() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var margen = 0.92;
    var fitAncho = (vw * margen) / ANCHO_DISENO;
    var fitAlto  = (vh * margen) / ALTO_DISENO;
    escalaEscena = Math.min(fitAncho, fitAlto);
    escalaEscena = Math.max(0.35, Math.min(escalaEscena, 2.2));
    escena.style.transform = "scale(" + escalaEscena.toFixed(4) + ")";
  }

  window.addEventListener("resize", recalcularEscala);
  window.addEventListener("orientationchange", recalcularEscala);
  recalcularEscala();

  // ------------------------------------------------------------------
  // 3) Animación de Snoopy (orejas, mano, cabeza: todo lo que esté
  //    dentro de .snoopy-body se mueve junto con el resto del cuerpo).
  // ------------------------------------------------------------------
  var inicio = performance.now();

  function loop(ahora) {
    var t = (ahora - inicio) / 1000;

    var bobPx   = Math.sin(t * 1.7) * 5;
    var swayDeg = Math.sin(t * 1.1) * 4;
    var respira = 1 + Math.sin(t * 1.7) * 0.015;

    snoopyBody.style.transform =
      "translateY(" + bobPx.toFixed(2) + "px) " +
      "rotate(" + swayDeg.toFixed(2) + "deg) " +
      "scale(" + respira.toFixed(4) + ")";

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ------------------------------------------------------------------
  // 4) Botón "Toca la pantalla": su propósito es activar el audio
  //    (los navegadores bloquean el autoplay sin gesto del usuario)
  //    y, en móvil, pedir pantalla completa. Ahora SIEMPRE hace algo
  //    visible al tocarlo: se oculta y arranca la música pase lo que
  //    pase con el fullscreen (que puede fallar silenciosamente en
  //    algunos navegadores/iOS).
  // ------------------------------------------------------------------
  function pedirPantallaCompleta() {
    var el = document.documentElement;
    var solicitar = el.requestFullscreen ||
                     el.webkitRequestFullscreen ||
                     el.mozRequestFullScreen ||
                     el.msRequestFullscreen;
    if (solicitar) {
      try {
        var resultado = solicitar.call(el);
        if (resultado && typeof resultado.catch === "function") {
          resultado.catch(function () {});
        }
      } catch (e) {}
    }
  }

  function reproducirMusica() {
    if (!musica) return;
    musica.muted = false;
    var promesa = musica.play();
    if (promesa && typeof promesa.catch === "function") {
      promesa.catch(function (err) {
        console.warn("No se pudo reproducir el audio automáticamente:", err);
      });
    }
  }

  function ocultarAviso() {
    if (tapHint) tapHint.classList.add("oculto");
  }

  function primeraInteraccion() {
    // El orden importa: primero el audio (necesita el gesto del
    // usuario), luego fullscreen, y siempre se oculta el botón.
    reproducirMusica();
    if (esMovil()) pedirPantallaCompleta();
    ocultarAviso();
  }

  if (tapHint) {
    tapHint.addEventListener("click", primeraInteraccion);
    tapHint.addEventListener("touchstart", primeraInteraccion, { passive: true });
  }
  // Si el usuario toca en cualquier otra parte de la pantalla antes
  // de usar el botón, también cuenta como el gesto que desbloquea el audio.
  document.addEventListener("touchstart", primeraInteraccion, { once: true });
  document.addEventListener("click", primeraInteraccion, { once: true });

  window.addEventListener("load", function () {
    if (!esMovil()) {
      // En desktop no hace falta pedir el toque: solo intenta sonar.
      reproducirMusica();
    }
    // En móvil dejamos visible el botón hasta que el usuario toque,
    // porque el audio y el fullscreen SÍ necesitan ese gesto.
  });

  function alCambiarFullscreen() {
    var enFullscreen = document.fullscreenElement ||
                        document.webkitFullscreenElement ||
                        document.mozFullScreenElement ||
                        document.msFullscreenElement;
    if (!enFullscreen && esMovil() && tapHint) {
      tapHint.classList.remove("oculto");
    }
  }
  document.addEventListener("fullscreenchange", alCambiarFullscreen);
  document.addEventListener("webkitfullscreenchange", alCambiarFullscreen);
  document.addEventListener("mozfullscreenchange", alCambiarFullscreen);
  document.addEventListener("MSFullscreenChange", alCambiarFullscreen);

})();