from fastapi import APIRouter, HTTPException, Query, Request, status

from app.database import obtener_conexion
from app.schemas.producto import ProductoEntrada


router = APIRouter(prefix="/api/productos", tags=["Productos"])


def _require_admin(request: Request):
    usuario = request.session.get("usuario")
    if not usuario or usuario.get("rol") != "administrador":
        raise HTTPException(status_code=403, detail="Se requiere una cuenta administradora")


@router.get("/")
def listar_productos(
    request: Request,
    incluir_inactivos: bool = Query(default=False),
    id_categoria: int | None = None,
    busqueda: str | None = Query(default=None, max_length=100),
):
    if incluir_inactivos:
        _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        condiciones = []
        valores = []
        if not incluir_inactivos:
            condiciones.append("p.Activo = 1")
        if id_categoria:
            condiciones.append("p.id_categoria = %s")
            valores.append(id_categoria)
        if busqueda:
            condiciones.append("(p.nombre LIKE %s OR p.marca LIKE %s)")
            termino = f"%{busqueda.strip()}%"
            valores.extend((termino, termino))
        where = f"WHERE {' AND '.join(condiciones)}" if condiciones else ""
        cursor.execute(
            "SELECT p.id_producto, p.id_categoria, c.nombre AS categoria, p.nombre, "
            "p.marca, p.precio, p.stock, p.descuento, p.imagen, p.Activo AS activo "
            f"FROM productos p LEFT JOIN categorias c ON c.id_categoria = p.id_categoria {where} "
            "ORDER BY p.id_producto DESC",
            tuple(valores),
        )
        return cursor.fetchall()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="No fue posible consultar los productos") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_producto(datos: ProductoEntrada, request: Request):
    _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute(
            "INSERT INTO productos (id_categoria, nombre, marca, precio, stock, descuento, imagen, Activo) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (datos.id_categoria, datos.nombre.strip(), datos.marca.strip(), datos.precio,
             datos.stock, datos.descuento, datos.imagen.split("/")[-1], datos.activo),
        )
        conexion.commit()
        return {"id_producto": cursor.lastrowid, "mensaje": "Producto creado"}
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise HTTPException(status_code=503, detail="No fue posible crear el producto") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.put("/{id_producto}")
def actualizar_producto(id_producto: int, datos: ProductoEntrada, request: Request):
    _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute(
            "UPDATE productos SET id_categoria=%s, nombre=%s, marca=%s, precio=%s, stock=%s, "
            "descuento=%s, imagen=%s, Activo=%s WHERE id_producto=%s",
            (datos.id_categoria, datos.nombre.strip(), datos.marca.strip(), datos.precio,
             datos.stock, datos.descuento, datos.imagen.split("/")[-1], datos.activo, id_producto),
        )
        if cursor.rowcount == 0:
            cursor.execute("SELECT 1 FROM productos WHERE id_producto=%s", (id_producto,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Producto no encontrado")
        conexion.commit()
        return {"mensaje": "Producto actualizado"}
    except HTTPException:
        if conexion:
            conexion.rollback()
        raise
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise HTTPException(status_code=503, detail="No fue posible actualizar el producto") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.delete("/{id_producto}")
def eliminar_producto(id_producto: int, request: Request):
    _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute("UPDATE productos SET Activo=0 WHERE id_producto=%s", (id_producto,))
        if cursor.rowcount == 0:
            cursor.execute("SELECT 1 FROM productos WHERE id_producto=%s", (id_producto,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Producto no encontrado")
        conexion.commit()
        return {"mensaje": "Producto desactivado"}
    except HTTPException:
        if conexion:
            conexion.rollback()
        raise
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise HTTPException(status_code=503, detail="No fue posible desactivar el producto") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()
