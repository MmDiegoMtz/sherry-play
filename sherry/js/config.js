const CONFIG = {

    // ---------------------------------------------------------------
    // MAPA
    // ---------------------------------------------------------------
    mapa: {
        ancho: 3200,   // Ancho total del mundo, en píxeles
        alto: 2200,    // Alto total del mundo, en píxeles
        margenColision: 40, // Grosor del borde invisible que impide salir del mapa
    },

    // ---------------------------------------------------------------
    // SNOOPY (jugador)
    // ---------------------------------------------------------------
    jugador: {
        x: 1600,              // Posición inicial X (dentro del mapa) — se usa solo si no hay partida guardada
        y: 1250,              // Posición inicial Y (cerca del centro/fuente) — se usa solo si no hay partida guardada
        velocidad: 260,       // Píxeles por segundo
        radioColision: 22,    // Radio del cuerpo de Snoopy para chocar con obstáculos
        escala: (window.matchMedia('(pointer: coarse)').matches ? 0.65 : 0.8),             // Tamaño relativo de Snoopy (1 = normal)
    },

    // ---------------------------------------------------------------
    // GUARDADO AUTOMÁTICO (posición del jugador y ciclo día/noche)
    // Se guarda en localStorage, sin que el usuario tenga que hacer nada.
    // ---------------------------------------------------------------
    guardado: {
        clave: "bosqueSnoopy_estado_v1",   // Cambia esto si alguna vez cambias el formato guardado
        intervaloSegundos: 4,               // Cada cuánto se autoguarda como máximo, en segundos
        distanciaMinimaParaGuardar: 60,     // Si Snoopy se mueve más de esto, se guarda antes del intervalo normal
    },

    // ---------------------------------------------------------------
    // MÚSICA DE FONDO
    // Coloca tu archivo en la carpeta /audio y ajusta la ruta si es necesario.
    // ---------------------------------------------------------------
    musica: {
        ruta: "audio/musica.mp3",
        volumen: 0.48,
    },

    // ---------------------------------------------------------------
    // ZONA CENTRAL (plaza con fuente)
    // ---------------------------------------------------------------
    centro: {
        x: 1600,
        y: 1100,
        radioPlaza: 230,     // Radio del área despejada alrededor de la fuente
        radioFuente: 60,     // Radio visual de referencia (colisión y halo de fondo)
        radioColisionFuente: 50,
        imagenUrl: "https://i.ibb.co/xSL5mQnR/1aa5dfd5e519.png", // Reemplaza el círculo del centro del mapa
        anchoImagen: 150,    // Ancho en pantalla de esa imagen central
    },

 
    ubicaciones: [
        {
            id: "fotografia",
            nombre: "Sala de Fotografía",
            icono: "photo_camera",
            imagenUrl: "https://i.ibb.co/D68ssfG/1f9db3cb8fab.png",
            x: 2300,
            y: 420,
            anchoObjetivo: 210,
            url: "imagenes.html",
        },
        {
            id: "juegos",
            nombre: "Sala de Juegos",
            icono: "sports_esports",
            imagenUrl: "https://i.ibb.co/k2Tk8RR2/dd87664bf5e7.png",
            x: 650,
            y: 420,
            anchoObjetivo: 210,
            url: "juegos.html",
        },
        {
            id: "correo",
            nombre: "Correo",
            icono: "mail",
            imagenUrl: "https://i.ibb.co/TDPFZx6y/e3f34d02fbb8.png",
            x: 420,
            y: 1300,
            anchoObjetivo: 200,
            url: "carta.html",
        },
        {
            id: "animaciones",
            nombre: "Casa de Animaciones",
            icono: "animation",
            imagenUrl: "https://i.ibb.co/d40HXCc4/38d8e936e2fa.png",
            x: 2500,
            y: 1850,
            anchoObjetivo: 220,
            url: "animacion.html",
        },
        {
            id: "musica",
            nombre: "Estudio de Música",
            icono: "music_note",
            imagenUrl: "https://i.ibb.co/QjzXpY59/eb723168fb03.png",
            x: 2750,
            y: 1300,
            anchoObjetivo: 220,
            url: "musica.html",
        },
        {
            id: "mensajes",
            nombre: "Sala de Mensajes",
            icono: "chat",
            imagenUrl: "https://i.ibb.co/4w1j3F6F/e7cf8434eab2.png",
            x: 1600,
            y: 1950,
            anchoObjetivo: 210,
            url: "cafeteria.html",
        },
    ],

    // ---------------------------------------------------------------
    // CAMINOS (conexiones entre el centro y cada ubicación, y algunas
    // conexiones extra entre ubicaciones vecinas para que el bosque se
    // sienta como un mundo conectado y no como una simple lista).
    // Cada entrada es [origen, destino, curvatura]. "centro" es la plaza.
    // La curvatura desplaza el camino para que no sea una línea recta.
    // ---------------------------------------------------------------
    caminos: [
        ["centro", "fotografia", 40],
        ["centro", "juegos", -40],
        ["centro", "correo", 30],
        ["centro", "musica", -30],
        ["centro", "mensajes", 20],
        ["centro", "animaciones", -25],
        ["juegos", "fotografia", -50],
        ["correo", "mensajes", 45],
        ["musica", "animaciones", 35],
        ["mensajes", "animaciones", -35],
    ],
    anchoCamino: 78,

    // ---------------------------------------------------------------
    // ÁRBOLES
    // - anchoBase: ancho visual completo del árbol en pantalla (copa
    //   incluida), a escala 1. Solo se usa para dibujar.
    // - radioTronco: radio de colisión REAL, pensado para cubrir
    //   únicamente el tronco (la parte física con la que Snoopy choca).
    //   Ajusta este número mirando tu imagen: debe ser aproximadamente
    //   la mitad del ancho del tronco tal como se ve en pantalla, NO
    //   la mitad del ancho de la copa. Si Snoopy todavía se detiene
    //   antes de tocar visualmente el tronco, baja este valor; si logra
    //   atravesar el tronco, súbelo un poco.
    // ---------------------------------------------------------------
    arboles: {
        tipos: [
            { imagenUrl: "https://i.ibb.co/Mxz3d6dJ/c378cd5d9e52.png", anchoBase: 130, radioTronco: 12 },
            { imagenUrl: "https://i.ibb.co/nq5vJjYh/f45aaf1606dd.png", anchoBase: 130, radioTronco: 12 },
        ],
        cantidad: 260,             // Cuántos árboles intentar colocar
        escalaMin: 0.75,
        escalaMax: 1.35,
        separacionMinima: 95,      // Distancia mínima entre troncos (deja hueco suficiente para pasar)
        margenCaminos: 70,         // Distancia mínima de un árbol a cualquier camino
        margenEdificios: 90,       // Distancia mínima de un árbol a un edificio
        margenEstanques: 35,       // Distancia mínima de un árbol al borde de un estanque
        semilla: 20260918,         // Semilla fija: el bosque siempre se genera igual
    },

    // ---------------------------------------------------------------
    // ESTANQUES decorativos (sin colisión, solo ambiente)
    // ---------------------------------------------------------------
    estanques: [
        { x: 300, y: 1750, radioX: 220, radioY: 140 },
        { x: 1150, y: 2020, radioX: 170, radioY: 100 },
    ],

    // ---------------------------------------------------------------
    // EFECTO DE AGUA (ondas al caminar dentro de un estanque)
    // ---------------------------------------------------------------
    efectosAgua: {
        intervaloOndas: 0.32,   // Segundos entre cada onda nueva
        duracionOnda: 0.9,      // Cuánto tarda una onda en desvanecerse
        radioInicial: 5,
        radioFinal: 28,
        alphaInicial: 0.5,
    },

    // ---------------------------------------------------------------
    // HUELLAS al salir del agua y caminar sobre el pasto
    // ---------------------------------------------------------------
    huellas: {
        ventanaSpawnSegundos: 3,   // Tiempo tras salir del agua en el que se generan huellas nuevas
        vidaTotalSegundos: 5,      // Cuánto dura cada huella antes de desaparecer del todo
        inicioDesvanecido: 3.5,    // A partir de qué edad empieza a desvanecerse
        intervaloPasos: 0.28,      // Tiempo entre cada huella al caminar
        separacionLateral: 6,      // Separación entre pie izquierdo/derecho
        alphaInicial: 0.45,
    },

    // ---------------------------------------------------------------
    // LÁMPARAS (solo el poste; sin base — la base se usa en el centro del mapa)
    // ---------------------------------------------------------------
    farola: {
        imagenPoste: "https://i.ibb.co/hR0G82KD/6c975723ae2d.png",
        anchoPoste: 34,     // Ancho en pantalla del poste; el alto se calcula por proporción
        alturaLuz: 58,      // A qué altura sobre el punto base aparece el resplandor
        brillo: {
            radio: 85,               // Qué tan grande se ve el resplandor de cada lámpara
            colorRGB: "255, 210, 122", // Tono cálido del resplandor
            alphaMax: 0.65,          // Intensidad máxima en plena noche
        },
    },

    // Lámparas adicionales junto a cada edificio (además de las 4 de la
    // plaza), para reforzar la iluminación nocturna en los puntos donde el
    // jugador se detiene a interactuar.
    farolasExtra: {
        distanciaHaciaCentro: 120,  // Qué tan lejos del edificio, sobre el camino hacia el centro
        desplazamientoLateral: 45,  // Desplazamiento a un lado del camino
    },

    // ---------------------------------------------------------------
    // CICLO DE DÍA Y NOCHE
    // ---------------------------------------------------------------
    cicloDiaNoche: {
        duracionSegundos: 300,   // Un ciclo completo día → noche → día
        oscuridadMaxima: 0.55,   // Qué tan oscuro se pone en el punto más "de noche" (0-1)
        colorNoche: "20, 12, 45", // Componentes RGB del tinte nocturno
    },

    // ---------------------------------------------------------------
    // PARTÍCULAS MÁGICAS
    // ---------------------------------------------------------------
    particulas: {
        cantidad: 70,          // Discretas: no llenar la pantalla
        radioMin: 1.2,
        radioMax: 3,
        velocidad: 10,         // Deriva lenta, píxeles por segundo aprox.
        colores: ["#FFD27A", "#EFA3C8", "#B99AD9"],
    },

    // ---------------------------------------------------------------
    // PALETA DE COLORES DEL BOSQUE
    // ---------------------------------------------------------------
    colores: {
        rosaPastel: "#EFA3C8",
        rosa: "#D85B9F",
        lilaPastel: "#B99AD9",
        lila: "#8E6BB5",
        purpura: "#68458F",
        purpuraOscuro: "#3E285E",
        luzCalida: "#FFD27A",
        verde: "#6E9B72",
        pastoClaro: "#7CA274",
        pastoMedio: "#5F8A62",
        pastoOscuro: "#4C7256",
        tintePasto: "#9B86B8",
        camino: "#E8C79B",
        caminoBorde: "#C79F6E",
        agua: "#8FC3D9",
    },

    // ---------------------------------------------------------------
    // TEXTOS DE INTERFAZ
    // ---------------------------------------------------------------
    textos: {
        preguntaInteraccion: "¿Encontraste algo?",
        pistaTeclado: "Presiona E para entrar",
        botonMovil: "Aceptar",
        sinEnlace: "Este lugar todavía no tiene un enlace configurado",
        iconoSinEnlace: "info",
    },
};