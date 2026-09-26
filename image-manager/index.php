<?php
declare(strict_types=1);
require_once __DIR__ . '/config/funciones.php';

$resultado = procesarAccion();
$registros = obtenerRegistros();

// Determina qué pestaña mostrar al cargar la página:
// si hubo un error al crear/actualizar, se queda en el formulario para corregir;
// en cualquier otro caso (incluyendo éxito), se muestra el listado.
$accionEnviada = $_POST['accion'] ?? '';
$vistaInicial  = 'formulario';

if ($accionEnviada !== '') {
    // Después de guardar/actualizar/eliminar, se muestra el CRUD para ver el resultado,
    // salvo que haya un error al crear o actualizar: ahí se queda en el formulario para corregir.
    $vistaInicial = 'crud';

    if ($resultado['tipo'] === 'error' && in_array($accionEnviada, ['crear', 'actualizar'], true)) {
        $vistaInicial = 'formulario';
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Administrador de Imágenes y Recursos</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<div class="contenedor">

    <header class="cabecera">
        <h1>Imágenes &amp; Recursos</h1>
        <p>Administra el material gráfico de tus sucursales en un solo lugar</p>
    </header>

    <?php if ($resultado['mensaje'] !== ''): ?>
        <div class="aviso aviso--<?= e($resultado['tipo']) ?>">
            <?= e($resultado['mensaje']) ?>
        </div>
    <?php endif; ?>

    <nav class="pestanas" role="tablist">
        <button type="button" class="pestana" data-vista="crud" role="tab">Registros (CRUD)</button>
        <button type="button" class="pestana" data-vista="formulario" role="tab">Nuevo registro</button>
    </nav>

    <!-- ============== VISTA: FORMULARIO ============== -->
    <section class="vista" id="vistaFormulario">
        <div class="tarjeta">
            <h2>Nuevo registro</h2>

            <form action="index.php" method="POST" enctype="multipart/form-data" class="formulario" id="formCrear">
                <input type="hidden" name="accion" value="crear">
                <input type="hidden" name="tipo" id="tipoValor" value="<?= TIPO_FOTO ?>">

                <div class="campo campo--toggle">
                    <span class="toggle__etiqueta toggle__etiqueta--activa" id="etqFoto">Foto</span>
                    <label class="toggle" for="tipoToggle">
                        <input type="checkbox" id="tipoToggle">
                        <span class="toggle__riel"><span class="toggle__perilla"></span></span>
                    </label>
                    <span class="toggle__etiqueta" id="etqRecurso">Recurso</span>
                </div>

                <div class="campo">
                    <label for="nombre">Nombre <span class="opcional">(opcional)</span></label>
                    <input type="text" id="nombre" name="nombre" placeholder="Ej. Portada sucursal norte" maxlength="255">
                </div>

                <div class="campo">
                    <label for="imagen">Imagen</label>
                    <input type="file" id="imagen" name="imagen" accept="image/*" required>
                </div>

                <div class="vista-previa" id="vistaPrevia" hidden>
                    <img id="imgPreview" src="" alt="Vista previa de la imagen seleccionada">
                </div>

                <button type="submit" class="boton boton--primario">Guardar</button>
            </form>
        </div>
    </section>

    <!-- ============== VISTA: CRUD / LISTADO ============== -->
    <section class="vista" id="vistaCrud">
        <div class="tarjeta">
            <h2>Registros existentes</h2>

            <?php if (empty($registros)): ?>
                <p class="vacio">Todavía no hay imágenes ni recursos guardados.</p>
            <?php else: ?>
                <div class="tabla-envoltorio">
                    <table class="tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($registros as $registro): ?>
                                <tr>
                                    <td data-etiqueta="ID"><?= e((string) $registro['id']) ?></td>
                                    <td data-etiqueta="Nombre"><?= $registro['nombre'] !== null ? e($registro['nombre']) : '<span class="vacio">Sin nombre</span>' ?></td>
                                    <td data-etiqueta="Tipo">
                                        <span class="etiqueta-tipo etiqueta-tipo--<?= (int) $registro['tipo'] === TIPO_FOTO ? 'foto' : 'recurso' ?>">
                                            <?= e(etiquetaTipo((int) $registro['tipo'])) ?>
                                        </span>
                                    </td>
                                    <td data-etiqueta="Acciones" class="tabla__acciones">
                                        <a class="boton boton--secundario boton--pequeno"
                                           href="<?= e($registro['enlace']) ?>"
                                           target="_blank" rel="noopener">Ver</a>

                                        <button type="button"
                                                class="boton boton--secundario boton--pequeno boton-copiar"
                                                data-enlace="<?= e($registro['enlace']) ?>">
                                            Copiar enlace
                                        </button>

                                        <button type="button"
                                                class="boton boton--secundario boton--pequeno"
                                                onclick='abrirEdicion(<?= json_encode($registro, JSON_UNESCAPED_UNICODE | JSON_HEX_APOS) ?>)'>
                                            Editar
                                        </button>

                                        <form action="index.php" method="POST" class="form-en-linea"
                                              onsubmit="return confirm('¿Eliminar este registro? Esta acción no se puede deshacer.');">
                                            <input type="hidden" name="accion" value="eliminar">
                                            <input type="hidden" name="id" value="<?= e((string) $registro['id']) ?>">
                                            <button type="submit" class="boton boton--peligro boton--pequeno">Eliminar</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </section>

</div>

<!-- Modal de edición -->
<div class="modal" id="modalEdicion" hidden>
    <div class="modal__contenido">
        <h2>Editar registro</h2>

        <form action="index.php" method="POST" enctype="multipart/form-data" class="formulario">
            <input type="hidden" name="accion" value="actualizar">
            <input type="hidden" name="id" id="editId" value="">
            <input type="hidden" name="tipo" id="editTipoValor" value="<?= TIPO_FOTO ?>">

            <div class="campo campo--toggle">
                <span class="toggle__etiqueta toggle__etiqueta--activa" id="editEtqFoto">Foto</span>
                <label class="toggle" for="editTipoToggle">
                    <input type="checkbox" id="editTipoToggle">
                    <span class="toggle__riel"><span class="toggle__perilla"></span></span>
                </label>
                <span class="toggle__etiqueta" id="editEtqRecurso">Recurso</span>
            </div>

            <div class="campo">
                <label for="editNombre">Nombre <span class="opcional">(opcional)</span></label>
                <input type="text" id="editNombre" name="nombre" maxlength="255">
            </div>

            <div class="campo">
                <label for="editImagen">Reemplazar imagen <span class="opcional">(opcional)</span></label>
                <input type="file" id="editImagen" name="imagen" accept="image/*">
            </div>

            <div class="vista-previa" id="editVistaPrevia" hidden>
                <img id="editImgPreview" src="" alt="Vista previa de la imagen actual">
            </div>

            <div class="modal__acciones">
                <button type="button" class="boton boton--secundario" onclick="cerrarEdicion()">Cancelar</button>
                <button type="submit" class="boton boton--primario">Actualizar</button>
            </div>
        </form>
    </div>
</div>

<script>
const TIPO_FOTO = <?= TIPO_FOTO ?>;
const TIPO_RECURSO = <?= TIPO_RECURSO ?>;

// ---------------------------------------------------------
// Cambio de pestañas (Formulario <-> CRUD) en la misma página
// ---------------------------------------------------------
function mostrarVista(nombre) {
    document.getElementById('vistaFormulario').classList.toggle('vista--oculta', nombre !== 'formulario');
    document.getElementById('vistaCrud').classList.toggle('vista--oculta', nombre !== 'crud');

    document.querySelectorAll('.pestana').forEach((boton) => {
        boton.classList.toggle('pestana--activa', boton.dataset.vista === nombre);
    });
}

document.querySelectorAll('.pestana').forEach((boton) => {
    boton.addEventListener('click', () => mostrarVista(boton.dataset.vista));
});

mostrarVista('<?= e($vistaInicial) ?>');

// ---------------------------------------------------------
// Toggle Foto / Recurso
// ---------------------------------------------------------
function configurarToggle(toggleId, valorInputId, etqFotoId, etqRecursoId) {
    const toggle = document.getElementById(toggleId);
    const valorInput = document.getElementById(valorInputId);
    const etqFoto = document.getElementById(etqFotoId);
    const etqRecurso = document.getElementById(etqRecursoId);

    toggle.addEventListener('change', () => {
        const esRecurso = toggle.checked;
        valorInput.value = esRecurso ? TIPO_RECURSO : TIPO_FOTO;
        etqFoto.classList.toggle('toggle__etiqueta--activa', !esRecurso);
        etqRecurso.classList.toggle('toggle__etiqueta--activa', esRecurso);
    });

    return { toggle, valorInput, etqFoto, etqRecurso };
}

const toggleCrear = configurarToggle('tipoToggle', 'tipoValor', 'etqFoto', 'etqRecurso');
const toggleEditar = configurarToggle('editTipoToggle', 'editTipoValor', 'editEtqFoto', 'editEtqRecurso');

// ---------------------------------------------------------
// Vista previa de imagen antes de guardar
// ---------------------------------------------------------
function configurarVistaPrevia(inputId, contenedorId, imgId) {
    const input = document.getElementById(inputId);
    const contenedor = document.getElementById(contenedorId);
    const img = document.getElementById(imgId);

    input.addEventListener('change', () => {
        const archivo = input.files[0];
        if (!archivo) {
            return;
        }
        const lector = new FileReader();
        lector.onload = (evento) => {
            img.src = evento.target.result;
            contenedor.hidden = false;
        };
        lector.readAsDataURL(archivo);
    });
}

configurarVistaPrevia('imagen', 'vistaPrevia', 'imgPreview');
configurarVistaPrevia('editImagen', 'editVistaPrevia', 'editImgPreview');

// ---------------------------------------------------------
// Modal de edición
// ---------------------------------------------------------
function abrirEdicion(registro) {
    document.getElementById('editId').value = registro.id;
    document.getElementById('editNombre').value = registro.nombre ?? '';
    document.getElementById('editImgPreview').src = registro.enlace;
    document.getElementById('editVistaPrevia').hidden = false;
    document.getElementById('editImagen').value = '';

    const esRecurso = parseInt(registro.tipo, 10) === TIPO_RECURSO;
    toggleEditar.toggle.checked = esRecurso;
    toggleEditar.valorInput.value = esRecurso ? TIPO_RECURSO : TIPO_FOTO;
    toggleEditar.etqFoto.classList.toggle('toggle__etiqueta--activa', !esRecurso);
    toggleEditar.etqRecurso.classList.toggle('toggle__etiqueta--activa', esRecurso);

    document.getElementById('modalEdicion').hidden = false;
    document.body.classList.add('modal-abierto');
}

function cerrarEdicion() {
    document.getElementById('modalEdicion').hidden = true;
    document.body.classList.remove('modal-abierto');
}

document.getElementById('modalEdicion').addEventListener('click', (evento) => {
    if (evento.target.id === 'modalEdicion') {
        cerrarEdicion();
    }
});

// ---------------------------------------------------------
// Copiar enlace de la imagen al portapapeles
// ---------------------------------------------------------
function copiarAlPortapapeles(texto, boton) {
    const mostrarConfirmacion = () => {
        const textoOriginal = boton.textContent;
        boton.textContent = '¡Copiado!';
        boton.disabled = true;
        setTimeout(() => {
            boton.textContent = textoOriginal;
            boton.disabled = false;
        }, 1500);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(mostrarConfirmacion).catch(() => {
            copiarConAreaTemporal(texto, mostrarConfirmacion);
        });
    } else {
        copiarConAreaTemporal(texto, mostrarConfirmacion);
    }
}

function copiarConAreaTemporal(texto, alCopiar) {
    const area = document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
        document.execCommand('copy');
        alCopiar();
    } finally {
        document.body.removeChild(area);
    }
}

document.querySelectorAll('.boton-copiar').forEach((boton) => {
    boton.addEventListener('click', () => copiarAlPortapapeles(boton.dataset.enlace, boton));
});
</script>

</body>
</html>