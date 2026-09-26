  /* Rompecabezas de recuerdos: fotografía -> cuadrícula -> piezas -> hueco -> mezcla -> deslizar */
  (() => {
    'use strict';

    /* ---------- DATOS ---------- */
    const fotos = [
      "https://i.ibb.co/b59YYV02/ad5c5566926c.webp",
      "https://i.ibb.co/k2z6Cn0G/9fac389a9ba0.jpg",
      "https://i.ibb.co/spSvCMJQ/aab75dfb54a6.jpg",
      "https://i.ibb.co/VY9kBvNz/1367eecbbe07.jpg",
      "https://i.ibb.co/Zp9T1tn7/2bf8a638379a.jpg",
      "https://i.ibb.co/XxhVDrP8/0eec50b0ae2a.jpg",
      "https://i.ibb.co/XxhVDrP8/0eec50b0ae2a.jpg",
      "https://i.ibb.co/DPrVpPBc/92c2892b2292.jpg",
      "https://i.ibb.co/FLBNXZDH/cd8cc0e34018.jpg",
      "https://i.ibb.co/ZRXmPLZv/7ced80580dd3.jpg",
      "https://i.ibb.co/9k8SjR5h/55c30a77e73b.jpg",
      "https://i.ibb.co/WWtTsdCK/0e4bf6b5a499.webp",
      "https://i.ibb.co/bjTHmZqy/3db7e480c5cb.webp",
      "https://i.ibb.co/1fdrPC0h/7a901499d061.jpg",
      "https://i.ibb.co/Lh8QYFX2/b29b3862baf3.png",
      "https://i.ibb.co/fVWGHwrj/d74c3132b3a2.jpg",
      "https://i.ibb.co/4ZXryGHk/8ee6fb873b5a.jpg",
      "https://i.ibb.co/mFHtz6TR/4346129c5464.webp",
      "https://i.ibb.co/pBKM4TK4/4447e14952f0.jpg",
      "https://i.ibb.co/sdDTss97/5be0efa1cc2b.jpg",
      "https://i.ibb.co/xKdszh1N/1683294b1a74.jpg",
      "https://i.ibb.co/xKjhnK0m/1b965c3d3db7.webp",
      "https://i.ibb.co/N6n0TJtd/ab2c1bb8bb00.webp",
      "https://i.ibb.co/DPjFqGS8/ea534be9cdbb.jpg"
    ];

    // Dificultad definida a mano y progresiva: [columnas, filas] por fotografía.
    // 6 fotos en 2x2, 12 en 2x3 y solo las 8 últimas en 3x3. Para más fácil usa [2,2]; para más difícil, [3,3].
    const tableros = [
      [2,2],[2,2],[2,2],[2,2],[2,2],[2,2],
      [2,3],[2,3],[2,3],[2,3],[2,3],[2,3],[2,3],[2,3],[2,3],[2,3],[2,3],[2,3],
      [3,3],[3,3],[3,3],[3,3],[3,3],[3,3]
    ];


    const frases = [
      "Hay momentos que simplemente se sienten especiales.",
    "Hay instantes que se quedan a vivir en una sonrisa.",
    "Qué bonito volver a encontrarnos con este recuerdo.",
    "Este recuerdo todavía tiene algo que lo hace especial.",
    "Lo cotidiano contigo siempre se vuelve extraordinario.",
    "Un momento sencillo que hoy significa muchísimo.",
    "Hay recuerdos que merecen volver a mirarse una y otra vez.",
    "Cada pequeño momento puede guardar algo muy grande.",
    "Hay miradas que dicen más de lo que cualquier frase podría decir.",
    "Qué bonito volver a mirar un momento así.",
    "Hay recuerdos que siempre se sienten un poquito diferentes.",
    "No hacía falta que fuera un momento perfecto para hacerlo especial.",
    "Hay recuerdos que todavía consiguen sacarnos una sonrisa.",
    "Algunos momentos se vuelven especiales simplemente por haberlos vivido.",
    "Cada detalle puede guardar una pequeña parte de lo que sentimos.",
    "Lo más bonito de una fotografía muchas veces es todo lo que nos hace sentir.",
    "Hasta los momentos más sencillos pueden convertirse en recuerdos inolvidables.",
    "Un pequeño recuerdo capaz de guardar muchísimo.",
    "Otra pequeña pieza de todos esos momentos que compartimos.",
    "Contigo, hasta los momentos más simples tienen algo especial.",
    "Hay momentos que uno quisiera poder guardar para siempre.",
    "Qué bonito tener recuerdos a los que siempre podemos volver.",
    "Lo que sentimos también vive en estos pequeños momentos.",
    "Una imagen, un instante y un recuerdo que vale la pena conservar."
    ];

    const niveles = fotos.map((imagen, i) => ({ imagen, columnas: tableros[i][0], filas: tableros[i][1], frase: frases[i] }));
    const CLAVE = 'rompecabezas-recuerdos-v1';

    /* ---------- ESTADO ---------- */
    const estado = {
      fotoActual: 0,     // índice del nivel en curso
      tablero: null,     // tablero[posicion] = id de pieza; la pieza vacía es la de id n-1
      resuelta: false,   // la foto actual ya está completada (esperando "Siguiente")
      completado: false  // todas las fotos terminadas
    };
    let bloqueado = true, aspecto = 1, piezas = [], arrastre = null, token = 0;

    /* ---------- REFERENCIAS ---------- */
    const $ = id => document.getElementById(id);
    const el = {
      juego: $('juego'), final: $('final'), tablero: $('tablero'), escenario: $('escenario'),
      saltar: $('btn-saltar'), carga: $('estado-carga'), cargaTxt: $('carga-texto'), reintentar: $('btn-reintentar'),
      frase: $('frase'), siguiente: $('btn-siguiente'), texto: $('progreso-texto'),
      barra: $('progreso-barra'), pista: $('progreso'), musica: $('btn-musica'),
      pantalla: $('btn-pantalla'), reiniciar: $('btn-reiniciar')
    };

    /* ---------- GUARDADO AUTOMÁTICO ---------- */
    function guardar() {
      try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* almacenamiento no disponible */ }
    }
    function restaurar() {
      try {
        const s = JSON.parse(localStorage.getItem(CLAVE));
        if (!s || !Number.isInteger(s.fotoActual)) return;
        estado.fotoActual = Math.min(Math.max(s.fotoActual, 0), niveles.length - 1);
        estado.completado = s.completado === true;
        estado.resuelta = s.resuelta === true;
        const n = tam(estado.fotoActual);
        const t = s.tablero;
        const valido = Array.isArray(t) && t.length === n && [...t].sort((a, b) => a - b).every((v, i) => v === i);
        estado.tablero = valido ? t : null;
      } catch (e) { /* datos dañados: se empieza desde cero */ }
    }
    const tam = i => niveles[i].columnas * niveles[i].filas;

    /* ---------- MEZCLA SOLUCIONABLE (movimientos válidos desde el estado resuelto) ---------- */
    function vecinos(pos, c, f) {
      const x = pos % c, y = (pos / c) | 0, v = [];
      if (x > 0) v.push(pos - 1);
      if (x < c - 1) v.push(pos + 1);
      if (y > 0) v.push(pos - c);
      if (y < f - 1) v.push(pos + c);
      return v;
    }
    const estaResuelto = t => t.every((v, i) => v === i);
    function mezclar(c, f) {
      const n = c * f;
      for (let intento = 0; intento < 200; intento++) {
        const t = Array.from({ length: n }, (_, i) => i);
        // Pocos pasos (cada uno es un movimiento válido): el tablero queda mezclado pero resoluble.
        const pasos = n <= 4 ? 4 + ((Math.random() * 5) | 0) : n * 3 + ((Math.random() * 5) | 0);
        let vacio = n - 1, previo = -1;
        for (let k = 0; k < pasos; k++) {
          const op = vecinos(vacio, c, f).filter(p => p !== previo);
          const s = op[(Math.random() * op.length) | 0];
          t[vacio] = t[s]; t[s] = n - 1;
          previo = vacio; vacio = s;
        }
        if (!estaResuelto(t)) return t;
      }
      // Respaldo: un solo movimiento desde el estado resuelto (siempre resoluble y nunca bucle infinito)
      const t = Array.from({ length: n }, (_, i) => i);
      t[n - 1] = t[n - 2]; t[n - 2] = n - 1;
      return t;
    }

    /* ---------- CARGA DE NIVEL ---------- */
    function cargarNivel() {
      const mi = ++token, nv = niveles[estado.fotoActual];
      bloqueado = true;
      el.tablero.classList.remove('listo', 'resuelto');
      el.frase.classList.remove('visible');
      el.siguiente.hidden = true;
      el.carga.hidden = false; el.reintentar.hidden = true; el.saltar.hidden = true; el.cargaTxt.hidden = false;
      el.cargaTxt.textContent = 'Revelando el recuerdo';
      actualizarProgreso();

      const img = new Image();
      img.onload = () => { if (mi === token) construir(nv, img); };
      img.onerror = () => {
        if (mi !== token) return;
        el.cargaTxt.textContent = 'No se pudo cargar esta fotografía.';
        el.reintentar.hidden = false; el.saltar.hidden = false;
      };
      const fallo = () => {
        if (mi !== token) return;
        el.cargaTxt.textContent = 'No se pudo cargar esta fotografía.';
        el.reintentar.hidden = false; el.saltar.hidden = false;
      };
      setTimeout(() => { if (mi === token && !el.tablero.classList.contains('listo') && !img.complete) fallo(); }, 15000);
      img.src = nv.imagen;
    }

    function construir(nv, img) {
      const c = nv.columnas, f = nv.filas, n = c * f;
      aspecto = img.naturalWidth / img.naturalHeight;   // el tablero adopta la proporción real de la foto
      if (!estado.tablero) { estado.tablero = mezclar(c, f); estado.resuelta = false; guardar(); }

      el.tablero.textContent = '';
      el.tablero.style.setProperty('--img', `url("${nv.imagen}")`);
      el.tablero.style.setProperty('--c', c);
      el.tablero.style.setProperty('--r', f);
      piezas = [];
      const frag = document.createDocumentFragment();
      for (let id = 0; id < n; id++) {
        const p = document.createElement('div');
        p.className = 'pieza' + (id === n - 1 ? ' vacio' : '');
        p.dataset.id = id;
        // Posición del recorte: cada pieza muestra exactamente su zona de la foto.
        p.style.backgroundPosition = `${(id % c) / (c - 1) * 100}% ${((id / c) | 0) / (f - 1) * 100}%`;
        piezas[id] = p; frag.appendChild(p);
      }
      el.tablero.appendChild(frag);
      colocar();
      ajustar();
      el.carga.hidden = true;
      el.tablero.classList.add('listo');

      if (estaResuelto(estado.tablero)) { estado.resuelta = true; guardar(); }
      if (estado.resuelta) mostrarResuelta(false); else bloqueado = false;
      const sig = niveles[estado.fotoActual + 1];
      if (sig) new Image().src = sig.imagen;   // precarga la siguiente
    }

    // Coloca cada pieza según estado.tablero (posiciones vía variables CSS)
    function colocar() {
      const c = niveles[estado.fotoActual].columnas;
      estado.tablero.forEach((id, pos) => {
        piezas[id].style.setProperty('--x', pos % c);
        piezas[id].style.setProperty('--y', (pos / c) | 0);
      });
    }

    // Calcula el mayor tablero que cabe en el escenario sin deformar la foto
    function ajustar() {
      const cs = getComputedStyle(el.escenario);
      const w0 = el.escenario.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h0 = el.escenario.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (w0 <= 0 || h0 <= 0) return;
      let w = w0, h = w / aspecto;
      if (h > h0) { h = h0; w = h * aspecto; }
      el.tablero.style.width = w + 'px';
      el.tablero.style.height = h + 'px';
    }

    /* ---------- MOVIMIENTO (Pointer Events: mouse, dedo y lápiz) ---------- */
    function geometria() {
      const nv = niveles[estado.fotoActual], t = estado.tablero, n = nv.columnas * nv.filas;
      return { c: nv.columnas, f: nv.filas, vacio: t.indexOf(n - 1), t };
    }

    el.tablero.addEventListener('pointerdown', e => {
      if (bloqueado) return;
      cancelarArrastre();                                     // nunca queda un arrastre "colgado"
      const p = e.target.closest('.pieza');
      if (!p || p.classList.contains('vacio')) return;
      const { c, vacio, t } = geometria(), pos = t.indexOf(+p.dataset.id);
      const vx = (vacio % c) - (pos % c), vy = ((vacio / c) | 0) - ((pos / c) | 0);
      if (Math.abs(vx) + Math.abs(vy) !== 1) return;          // solo piezas junto al hueco
      const r = el.tablero.getBoundingClientRect(), nv = niveles[estado.fotoActual];
      arrastre = { p, pos, vacio, vx, vy, x0: e.clientX, y0: e.clientY, prog: 0, mov: 0,
        tam: vx ? r.width / nv.columnas : r.height / nv.filas, id: e.pointerId };
      p.classList.add('arrastre');
      try { el.tablero.setPointerCapture(e.pointerId); } catch (err) {}
    });

    el.tablero.addEventListener('pointermove', e => {
      const a = arrastre;
      if (!a || e.pointerId !== a.id) return;
      const dx = e.clientX - a.x0, dy = e.clientY - a.y0;
      a.mov = Math.max(a.mov, Math.abs(dx) + Math.abs(dy));
      a.prog = Math.min(Math.max(dx * a.vx + dy * a.vy, 0), a.tam);   // solo avanza hacia el hueco
      a.p.style.setProperty('--dx', a.vx * a.prog + 'px');
      a.p.style.setProperty('--dy', a.vy * a.prog + 'px');
    });

    function cancelarArrastre() {
      const a = arrastre;
      if (!a) return;
      arrastre = null;
      a.p.classList.remove('arrastre');
      a.p.style.removeProperty('--dx'); a.p.style.removeProperty('--dy');
    }
    el.tablero.addEventListener('lostpointercapture', cancelarArrastre);
    addEventListener('blur', cancelarArrastre);
    document.addEventListener('visibilitychange', cancelarArrastre);

    function soltar(e, cancelado) {
      const a = arrastre;
      if (!a || e.pointerId !== a.id) return;
      arrastre = null;
      a.p.classList.remove('arrastre');
      a.p.style.removeProperty('--dx'); a.p.style.removeProperty('--dy');
      const toque = a.mov < 8;                                          // un toque también mueve la pieza
      if (!cancelado && (toque || a.prog > a.tam * 0.3)) mover(a.pos, a.vacio);
    }
    el.tablero.addEventListener('pointerup', e => soltar(e, false));
    el.tablero.addEventListener('pointercancel', e => soltar(e, true));

    function mover(pos, vacio) {
      const t = estado.tablero;
      [t[pos], t[vacio]] = [t[vacio], t[pos]];
      colocar();
      guardar();
      if (estaResuelto(t)) {
        estado.resuelta = true; guardar();
        bloqueado = true;
        setTimeout(() => mostrarResuelta(true), 200);
      }
    }

    /* ---------- FOTO COMPLETADA ---------- */
    function mostrarResuelta(animar) {
      bloqueado = true;
      el.tablero.classList.add('resuelto');
      piezas[piezas.length - 1].classList.remove('vacio');   // aparece la pieza que faltaba
      el.frase.textContent = niveles[estado.fotoActual].frase;
      setTimeout(() => { el.frase.classList.add('visible'); el.siguiente.hidden = false; }, animar ? 900 : 0);
      actualizarProgreso();
    }

    function avanzar() {
      if (estado.fotoActual >= niveles.length - 1) {
        estado.completado = true; guardar(); mostrarFinal();
        return;
      }
      estado.fotoActual++; estado.tablero = null; estado.resuelta = false;
      guardar();
      cargarNivel();
    }
    el.siguiente.addEventListener('click', avanzar);
    el.saltar.addEventListener('click', avanzar);
    el.reintentar.addEventListener('click', cargarNivel);

    function actualizarProgreso() {
      const total = niveles.length, hechas = estado.fotoActual + (estado.resuelta ? 1 : 0);
      const nv = niveles[estado.fotoActual];
      el.texto.textContent = `Fotografía ${estado.fotoActual + 1} de ${total}  ·  ${nv.columnas}×${nv.filas}`;
      el.barra.style.width = (hechas / total * 100) + '%';
      el.pista.setAttribute('aria-valuenow', Math.round(hechas / total * 100));
    }

    /* ---------- FINAL Y REINICIO ---------- */
    function mostrarFinal() {
      el.juego.hidden = true; el.final.hidden = false;
    }
    el.reiniciar.addEventListener('click', () => {
      try { localStorage.removeItem(CLAVE); } catch (e) {}
      Object.assign(estado, { fotoActual: 0, tablero: null, resuelta: false, completado: false });
      el.final.hidden = true; el.juego.hidden = false;
      cargarNivel();
    });

    /* ---------- MÚSICA (el autoplay bloqueado nunca rompe el juego) ---------- */
    const audio = new Audio('audio/musica02.mp3');
    audio.loop = true; audio.volume = 0.5; audio.preload = 'auto';
    let silenciada = false;
    const iconoMusica = () => {
      el.musica.firstElementChild.textContent = silenciada ? 'music_off' : 'music_note';
      el.musica.setAttribute('aria-label', silenciada ? 'Activar música' : 'Silenciar música');
    };
    const intentarMusica = () => { if (!silenciada) audio.play().catch(() => {}); };
    el.musica.addEventListener('click', e => {
      e.stopPropagation();
      silenciada = !silenciada;
      silenciada ? audio.pause() : audio.play().catch(() => {});
      iconoMusica();
    });
    intentarMusica();

    /* ---------- PANTALLA COMPLETA (solo móviles, nunca obligatoria) ---------- */
    const esMovil = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || matchMedia('(pointer: coarse)').matches;
    const raiz = document.documentElement;
    const pedirPantalla = raiz.requestFullscreen || raiz.webkitRequestFullscreen;
    const enPantalla = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
    const activarPantalla = () => {
      try { const r = pedirPantalla.call(raiz); if (r && r.catch) r.catch(() => {}); } catch (e) {}
    };
    function actualizarBotonPantalla() { el.pantalla.hidden = !(esMovil && pedirPantalla && !enPantalla()); }
    if (esMovil && pedirPantalla) {
      el.pantalla.addEventListener('click', activarPantalla);
      document.addEventListener('fullscreenchange', actualizarBotonPantalla);
      document.addEventListener('webkitfullscreenchange', actualizarBotonPantalla);
      actualizarBotonPantalla();
      activarPantalla();   // se intenta; si el navegador lo bloquea, queda el botón discreto
    }

    // Primera interacción real: inicia música y reintenta pantalla completa
    function primeraInteraccion() {
      intentarMusica();
      if (esMovil && pedirPantalla && !enPantalla()) activarPantalla();
      if (!audio.paused) removeEventListener('pointerup', primeraInteraccion, true);
    }
    addEventListener('pointerup', primeraInteraccion, true);
    addEventListener('keydown', intentarMusica, { once: true });

    /* ---------- ADAPTACIÓN A TAMAÑO Y ORIENTACIÓN ---------- */
    new ResizeObserver(ajustar).observe(el.escenario);
    addEventListener('orientationchange', () => setTimeout(ajustar, 200));
    el.tablero.addEventListener('contextmenu', e => e.preventDefault());

    /* ---------- INICIO ---------- */
    restaurar();
    iconoMusica();
    if (estado.completado) mostrarFinal(); else cargarNivel();
  })();