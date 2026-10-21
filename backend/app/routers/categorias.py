from fastapi import APIRouter, HTTPException, Request, status

from app.database import obtener_conexion
from app.schemas.categoria import CategoriaActualizar, Categorias


router = APIRouter(prefix="/api/categorias", tags=["Categorías"])


def _database_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="No fue posible conectarse a la base de datos. Revise su configuración.",
    )


def _require_admin(request: Request):
    usuario = request.session.get("usuario")
    if not usuario or usuario.get("rol") != "administrador":
        raise HTTPException(status_code=403, detail="Se requiere una cuenta administradora")


@router.get("/")
def listar_categorias():
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute(
            "SELECT id_categoria, nombre, Activo AS activo "
            "FROM categorias ORDER BY id_categoria"
        )
        return cursor.fetchall()
    except Exception as exc:
        raise _database_error() from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_categoria(categoria: Categorias, request: Request):
    _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute(
            "INSERT INTO categorias (nombre, Activo) VALUES (%s, %s)",
            (categoria.nombre.strip(), categoria.activo),
        )
        conexion.commit()
        return {"mensaje": "Categoría registrada correctamente"}
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise _database_error() from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.put("/{id_categoria}")
def editar_categoria(id_categoria: int, categoria: CategoriaActualizar, request: Request):
    _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute(
            "UPDATE categorias SET nombre = %s, Activo = %s WHERE id_categoria = %s",
            (categoria.nombre.strip(), categoria.activo, id_categoria),
        )
        if cursor.rowcount == 0:
            cursor.execute(
                "SELECT 1 FROM categorias WHERE id_categoria = %s", (id_categoria,)
            )
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Categoría no encontrada")
        conexion.commit()
        return {"mensaje": "Categoría actualizada correctamente"}
    except HTTPException:
        if conexion:
            conexion.rollback()
        raise
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise _database_error() from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


def _cambiar_estado(id_categoria: int, activo: int, request: Request):
    _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute(
            "UPDATE categorias SET Activo = %s WHERE id_categoria = %s",
            (activo, id_categoria),
        )
        if cursor.rowcount == 0:
            cursor.execute(
                "SELECT 1 FROM categorias WHERE id_categoria = %s", (id_categoria,)
            )
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Categoría no encontrada")
        conexion.commit()
        estado = "activada" if activo else "inactivada"
        return {"mensaje": f"Categoría {estado} correctamente"}
    except HTTPException:
        if conexion:
            conexion.rollback()
        raise
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise _database_error() from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.put("/{id_categoria}/activar")
def activar_categoria(id_categoria: int, request: Request):
    return _cambiar_estado(id_categoria, 1, request)


@router.put("/{id_categoria}/inactivar")
def inactivar_categoria(id_categoria: int, request: Request):
    return _cambiar_estado(id_categoria, 0, request)
