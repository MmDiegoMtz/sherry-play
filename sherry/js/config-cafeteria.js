/* ==========================================================================
   CONFIG-CAFETERIA.JS
   ========================================================================== */

const CONFIG_CAFETERIA = {

    imagenUrl: "img/cafeteria.png",

    // Ruta fija de la música de fondo
    musica: {
        ruta: "audio/cafeteria.mp3",
        volumen: 0.4,
    },

    // A dónde regresa el botón de salida
    salida: {
        url: "index.html",
    },

    // ---------------------------------------------------------------
    // LOS 5 MENSAJES OCULTOS — cada uno es una bolita brillante sobre
    // la imagen, en % (xPorc, yPorc) de la imagen completa. Al hacer
    // clic, se muestra su mensaje.
    // ---------------------------------------------------------------
    mensajesOcultos: [
        {
            id: "estanteria",
            xPorc: 23, yPorc: 29,
            mensaje: "Hola, amorcito. Aunque tuve poquito tiempo para hacer esta página, la hice con muchísimo cariño para ti. Poco a poquito iré mejorando y agregando más cositas.",
        },
        {
            id: "mesa",
            xPorc: 32, yPorc: 46,
            mensaje: "Hola, amorcito. ¡Feliz año y 9 meses juntos! Ya casi llegamos a los dos añitos, qué emoción seguir compartiendo todo esto contigo.",
        },
        {
            id: "barra",
            xPorc: 50, yPorc: 20,
            mensaje: "Si pudiera elegir un lugar para aparecer en cada página de mi vida, sería siempre a tu lado.",
        },
        {
            id: "sillon",
            xPorc: 84, yPorc: 20,
            mensaje: "Podría pasarme horas junto a ti, como Snoopy sobre su casita, sin hacer nada extraordinario y aun así sentir que estoy exactamente donde quiero estar.",
        },
        {
            id: "rincon",
            xPorc: 13, yPorc: 66,
            mensaje: "Si nuestra historia fuera una tira de Peanuts, no necesitaría un final perfecto; solo quisiera que en cada nueva viñeta siguieras apareciendo tú.",
        },
    ],
};