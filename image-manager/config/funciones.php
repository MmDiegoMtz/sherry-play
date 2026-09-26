<?php
declare(strict_types=1);

// ==========================================================
// CONFIGURACIÓN
// ==========================================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'sherry');
define('DB_USER', 'root');
define('DB_PASS', '');

define('IMGBB_API_KEY', '4e24bee093c51464a9820e6ac7db3dd0');
define('IMGBB_UPLOAD_URL', 'https://api.imgbb.com/1/upload');

const TIPO_FOTO    = 1;
const TIPO_RECURSO = 2;

// ==========================================================
// CONEXIÓN A BASE DE DATOS
// ==========================================================

/**
 * Devuelve una única instancia de conexión PDO (patrón singleton simple).
 */
function obtenerConexion(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        } catch (PDOException $error) {
            throw new RuntimeException('No fue posible conectar con la base de datos.');
        }
    }

    return $pdo;
}

// ==========================================================
// UTILIDADES
// ==========================================================

/**
 * Escapa una cadena para mostrarla de forma segura en HTML.
 */
function e(?string $valor): string
{
    return htmlspecialchars($valor ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Valida que el tipo recibido sea uno de los permitidos (1 = Foto, 2 = Recurso).
 */
function validarTipo(mixed $tipo): int
{
    // Si no llegó valor (campo vacío o ausente), se asume "Foto" por defecto.
    if ($tipo === null || $tipo === '') {
        return TIPO_FOTO;
    }

    $tipo = (int) $tipo;

    if (!in_array($tipo, [TIPO_FOTO, TIPO_RECURSO], true)) {
        throw new InvalidArgumentException('El tipo seleccionado no es válido.');
    }

    return $tipo;
}

/**
 * Devuelve la etiqueta legible de un tipo numérico.
 */
function etiquetaTipo(int $tipo): string
{
    return $tipo === TIPO_FOTO ? 'Foto' : 'Recurso';
}

// ==========================================================
// ALOJAMIENTO DE IMÁGENES (imgBB)
// ==========================================================

/**
 * Sube un archivo de imagen a imgBB y devuelve la URL pública resultante.
 *
 * @param array $archivo Elemento correspondiente de $_FILES.
 * @throws RuntimeException Si el archivo no es válido o la subida falla.
 */
function subirImagenImgBB(array $archivo): string
{
    set_time_limit(150);

    if (!isset($archivo['tmp_name'], $archivo['error']) || $archivo['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('No se pudo procesar el archivo enviado.');
    }

    $tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $tipoMime        = mime_content_type($archivo['tmp_name']);

    if (!in_array($tipoMime, $tiposPermitidos, true)) {
        throw new RuntimeException('El archivo debe ser una imagen (JPG, PNG, GIF o WEBP).');
    }

    $curl = curl_init(IMGBB_UPLOAD_URL . '?key=' . IMGBB_API_KEY);

    curl_setopt_array($curl, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => [
            'image' => new CURLFile($archivo['tmp_name'], $tipoMime, $archivo['name'] ?? 'imagen'),
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_TIMEOUT        => 120,
        CURLOPT_IPRESOLVE      => CURL_IPRESOLVE_V4,
        CURLOPT_HTTPHEADER     => ['Expect:'],
    ]);

    $respuesta  = curl_exec($curl);
    $errorCurl  = curl_error($curl);
    $codigoHttp = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($respuesta === false) {
        throw new RuntimeException('Error de conexión con el servicio de imágenes: ' . $errorCurl);
    }

    $datos = json_decode($respuesta, true);

    if (empty($datos['success']) || empty($datos['data']['url'])) {
        $detalle = $datos['error']['message']
            ?? ('HTTP ' . $codigoHttp . ' - ' . mb_substr(strip_tags($respuesta), 0, 200));
        throw new RuntimeException('No se pudo subir la imagen: ' . $detalle);
    }

    return $datos['data']['url'];
}

// ==========================================================
// OPERACIONES CRUD SOBRE LA TABLA "images"
// ==========================================================

/**
 * Inserta un nuevo registro de imagen/recurso.
 */
function crearRegistro(string $nombre, int $tipo, string $enlace): void
{
    $pdo  = obtenerConexion();
    $stmt = $pdo->prepare(
        'INSERT INTO images (nombre, tipo, enlace) VALUES (:nombre, :tipo, :enlace)'
    );

    $stmt->execute([
        ':nombre' => $nombre !== '' ? $nombre : null,
        ':tipo'   => $tipo,
        ':enlace' => $enlace,
    ]);
}

/**
 * Devuelve todos los registros, del más reciente al más antiguo.
 */
function obtenerRegistros(): array
{
    $pdo  = obtenerConexion();
    $stmt = $pdo->query('SELECT id, nombre, tipo, enlace FROM images ORDER BY id DESC');

    return $stmt->fetchAll();
}

/**
 * Busca un registro por su ID. Devuelve null si no existe.
 */
function obtenerRegistroPorId(int $id): ?array
{
    $pdo  = obtenerConexion();
    $stmt = $pdo->prepare('SELECT id, nombre, tipo, enlace FROM images WHERE id = :id');
    $stmt->execute([':id' => $id]);

    $registro = $stmt->fetch();

    return $registro !== false ? $registro : null;
}

/**
 * Actualiza nombre y tipo de un registro. Si se indica un nuevo enlace,
 * también se reemplaza la imagen asociada.
 */
function actualizarRegistro(int $id, string $nombre, int $tipo, ?string $nuevoEnlace = null): void
{
    $pdo = obtenerConexion();

    if ($nuevoEnlace !== null) {
        $stmt = $pdo->prepare(
            'UPDATE images SET nombre = :nombre, tipo = :tipo, enlace = :enlace WHERE id = :id'
        );
        $stmt->execute([
            ':nombre' => $nombre !== '' ? $nombre : null,
            ':tipo'   => $tipo,
            ':enlace' => $nuevoEnlace,
            ':id'     => $id,
        ]);
        return;
    }

    $stmt = $pdo->prepare('UPDATE images SET nombre = :nombre, tipo = :tipo WHERE id = :id');
    $stmt->execute([
        ':nombre' => $nombre !== '' ? $nombre : null,
        ':tipo'   => $tipo,
        ':id'     => $id,
    ]);
}

/**
 * Elimina un registro por su ID.
 */
function eliminarRegistro(int $id): void
{
    $pdo  = obtenerConexion();
    $stmt = $pdo->prepare('DELETE FROM images WHERE id = :id');
    $stmt->execute([':id' => $id]);
}

// ==========================================================
// PROCESAMIENTO DE ACCIONES (POST)
// ==========================================================

/**
 * Revisa si llegó una acción por POST (crear, actualizar, eliminar),
 * la ejecuta y devuelve un mensaje de resultado para mostrar en pantalla.
 *
 * @return array{mensaje: string, tipo: string}
 */
function procesarAccion(): array
{
    $mensaje = '';
    $tipoAviso = '';

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return ['mensaje' => $mensaje, 'tipo' => $tipoAviso];
    }

    $accion = $_POST['accion'] ?? '';

    try {
        switch ($accion) {
            case 'crear':
                $nombre = trim((string) ($_POST['nombre'] ?? ''));
                $tipo   = validarTipo($_POST['tipo'] ?? '');

                if (empty($_FILES['imagen']['name'])) {
                    throw new InvalidArgumentException('Debes seleccionar una imagen.');
                }

                $enlace = subirImagenImgBB($_FILES['imagen']);
                crearRegistro($nombre, $tipo, $enlace);

                $mensaje   = 'El registro se guardó correctamente.';
                $tipoAviso = 'exito';
                break;

            case 'actualizar':
                $id = (int) ($_POST['id'] ?? 0);

                if ($id <= 0) {
                    throw new InvalidArgumentException('El registro indicado no es válido.');
                }

                $nombre      = trim((string) ($_POST['nombre'] ?? ''));
                $tipo        = validarTipo($_POST['tipo'] ?? '');
                $nuevoEnlace = null;

                if (!empty($_FILES['imagen']['name'])) {
                    $nuevoEnlace = subirImagenImgBB($_FILES['imagen']);
                }

                actualizarRegistro($id, $nombre, $tipo, $nuevoEnlace);

                $mensaje   = 'El registro se actualizó correctamente.';
                $tipoAviso = 'exito';
                break;

            case 'eliminar':
                $id = (int) ($_POST['id'] ?? 0);

                if ($id <= 0) {
                    throw new InvalidArgumentException('El registro indicado no es válido.');
                }

                eliminarRegistro($id);

                $mensaje   = 'El registro se eliminó correctamente.';
                $tipoAviso = 'exito';
                break;

            default:
                throw new InvalidArgumentException('La acción solicitada no es válida.');
        }
    } catch (Throwable $error) {
        $mensaje   = $error->getMessage();
        $tipoAviso = 'error';
    }

    return ['mensaje' => $mensaje, 'tipo' => $tipoAviso];
}