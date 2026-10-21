from datetime import date

from fastapi import APIRouter, HTTPException, Request

from app.database import obtener_conexion
from app.schemas.pedido import PedidoEntrada, PedidoEstado


router = APIRouter(prefix="/api", tags=["Pedidos y reportes"])


def _usuario(request: Request):
    usuario = request.session.get("usuario")
    if not usuario:
        raise HTTPException(status_code=401, detail="Inicie sesión para continuar")
    return usuario


def _require_admin(request: Request):
    usuario = _usuario(request)
    if usuario.get("rol") != "administrador":
        raise HTTPException(status_code=403, detail="Se requiere una cuenta administradora")
    return usuario


@router.post("/pedidos", status_code=201)
def crear_pedido(datos: PedidoEntrada, request: Request):
    usuario = _usuario(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        conexion.start_transaction()
        cursor = conexion.cursor(dictionary=True)
        cantidades = {}
        for item in datos.items:
            cantidades[item.id_producto] = cantidades.get(item.id_producto, 0) + item.cantidad
        total = 0.0
        lineas = []
        for id_producto, cantidad in cantidades.items():
            cursor.execute(
                "SELECT id_producto, nombre, precio, stock, descuento FROM productos "
                "WHERE id_producto=%s AND Activo=1 FOR UPDATE",
                (id_producto,),
            )
            producto = cursor.fetchone()
            if not producto or producto["stock"] < cantidad:
                raise HTTPException(status_code=409, detail="Producto no disponible o inventario insuficiente")
            unitario = float(producto["precio"]) * (1 - float(producto["descuento"]) / 100)
            total += unitario * cantidad
            lineas.append((producto, cantidad, unitario))
        cursor.execute(
            "INSERT INTO pedidos (id_usuario, fecha, total, direccion, estado, Activo) "
            "VALUES (%s, %s, %s, %s, 'Pendiente', 1)",
            (usuario["id"], date.today(), round(total, 2), datos.direccion.strip()),
        )
        id_pedido = cursor.lastrowid
        for producto, cantidad, unitario in lineas:
            cursor.execute(
                "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) "
                "VALUES (%s, %s, %s, %s)",
                (id_pedido, producto["id_producto"], cantidad, round(unitario, 2)),
            )
            cursor.execute(
                "UPDATE productos SET stock=stock-%s WHERE id_producto=%s",
                (cantidad, producto["id_producto"]),
            )
        conexion.commit()
        return {"id_pedido": id_pedido, "total": round(total, 2), "estado": "Pendiente"}
    except HTTPException:
        if conexion:
            conexion.rollback()
        raise
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise HTTPException(status_code=503, detail="No fue posible registrar el pedido") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.get("/pedidos")
def listar_pedidos(request: Request):
    usuario = _usuario(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        if usuario["rol"] == "administrador":
            cursor.execute(
                "SELECT p.id_pedido, p.id_usuario, u.nombre AS cliente, p.fecha, p.total, "
                "p.direccion, p.estado, p.Activo AS activo FROM pedidos p "
                "JOIN usuarios u ON u.id_usuario=p.id_usuario ORDER BY p.id_pedido DESC"
            )
        else:
            cursor.execute(
                "SELECT id_pedido, id_usuario, fecha, total, direccion, estado, Activo AS activo "
                "FROM pedidos WHERE id_usuario=%s ORDER BY id_pedido DESC",
                (usuario["id"],),
            )
        return cursor.fetchall()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="No fue posible consultar los pedidos") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.put("/pedidos/{id_pedido}/estado")
def actualizar_estado(id_pedido: int, datos: PedidoEstado, request: Request):
    _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        conexion.start_transaction()
        cursor = conexion.cursor()
        cursor.execute("SELECT estado FROM pedidos WHERE id_pedido=%s FOR UPDATE", (id_pedido,))
        pedido = cursor.fetchone()
        if pedido is None:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        estado_actual = pedido[0]
        if estado_actual == "Cancelado" and datos.estado != "Cancelado":
            raise HTTPException(status_code=409, detail="Un pedido cancelado no se puede reabrir")
        if estado_actual != "Cancelado" and datos.estado == "Cancelado":
            cursor.execute("SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido=%s", (id_pedido,))
            for id_producto, cantidad in cursor.fetchall():
                cursor.execute("UPDATE productos SET stock=stock+%s WHERE id_producto=%s", (cantidad, id_producto))
        cursor.execute("UPDATE pedidos SET estado=%s WHERE id_pedido=%s", (datos.estado, id_pedido))
        conexion.commit()
        return {"mensaje": "Estado del pedido actualizado"}
    except HTTPException:
        if conexion:
            conexion.rollback()
        raise
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise HTTPException(status_code=503, detail="No fue posible actualizar el pedido") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.get("/reportes/resumen")
def reporte_resumen(request: Request):
    _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute(
            "SELECT COUNT(*) AS pedidos, COALESCE(SUM(total), 0) AS ventas "
            "FROM pedidos WHERE Activo=1 AND estado <> 'Cancelado'"
        )
        resumen = cursor.fetchone()
        cursor.execute(
            "SELECT pr.id_producto, pr.nombre, SUM(dp.cantidad) AS unidades "
            "FROM detalle_pedido dp JOIN productos pr ON pr.id_producto=dp.id_producto "
            "JOIN pedidos p ON p.id_pedido=dp.id_pedido "
            "WHERE p.Activo=1 AND p.estado <> 'Cancelado' "
            "GROUP BY pr.id_producto, pr.nombre ORDER BY unidades DESC LIMIT 10"
        )
        resumen["mas_vendidos"] = cursor.fetchall()
        return resumen
    except Exception as exc:
        raise HTTPException(status_code=503, detail="No fue posible generar el reporte") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()
