from fastapi import APIRouter, HTTPException, Request, status

from app.database import obtener_conexion
from app.schemas.usuario import RegistroUsuario, UsuarioAdminActualizar
from app.security import generar_hash


router = APIRouter(prefix="/api/usuarios", tags=["Clientes"])


def _require_admin(request: Request):
    usuario = request.session.get("usuario")
    if not usuario or usuario.get("rol") != "administrador":
        raise HTTPException(status_code=403, detail="Se requiere una cuenta administradora")


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_usuario(datos: RegistroUsuario):
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute("SELECT 1 FROM usuarios WHERE email = %s", (datos.email.strip().lower(),))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo")
        cursor.execute(
            "INSERT INTO usuarios (nombre, email, contrasena, rol, Activo) "
            "VALUES (%s, %s, %s, 'cliente', 1)",
            (datos.nombre.strip(), datos.email.strip().lower(), generar_hash(datos.contrasena)),
        )
        conexion.commit()
        return {"mensaje": "Cuenta creada. Ya puede iniciar sesión."}
    except HTTPException:
        if conexion:
            conexion.rollback()
        raise
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise HTTPException(status_code=503, detail="No fue posible registrar la cuenta") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.get("/")
def listar_usuarios(request: Request):
    _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute(
            "SELECT id_usuario, nombre, email, rol, Activo AS activo "
            "FROM usuarios ORDER BY id_usuario DESC"
        )
        return cursor.fetchall()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="No fue posible consultar los clientes") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.put("/{id_usuario}")
def actualizar_usuario(id_usuario: int, datos: UsuarioAdminActualizar, request: Request):
    _require_admin(request)
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute(
            "UPDATE usuarios SET rol = %s, Activo = %s WHERE id_usuario = %s",
            (datos.rol, datos.activo, id_usuario),
        )
        if cursor.rowcount == 0:
            cursor.execute("SELECT 1 FROM usuarios WHERE id_usuario = %s", (id_usuario,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Cliente no encontrado")
        conexion.commit()
        return {"mensaje": "Cliente actualizado"}
    except HTTPException:
        if conexion:
            conexion.rollback()
        raise
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise HTTPException(status_code=503, detail="No fue posible actualizar el cliente") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()
