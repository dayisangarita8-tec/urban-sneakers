from fastapi import APIRouter, HTTPException, Request, status

from app.database import obtener_conexion
from app.schemas.usuario import InicioSesion
from app.security import verificar_password


router = APIRouter(prefix="/api/auth", tags=["Sesión"])


@router.post("/login")
def iniciar_sesion(datos: InicioSesion, request: Request):
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute(
            "SELECT id_usuario, nombre, email, contrasena, rol, Activo AS activo "
            "FROM usuarios WHERE email = %s LIMIT 1",
            (datos.email.strip().lower(),),
        )
        usuario = cursor.fetchone()
        if not usuario or not usuario["activo"] or not verificar_password(
            datos.contrasena, usuario["contrasena"]
        ):
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
        request.session["usuario"] = {
            "id": usuario["id_usuario"],
            "nombre": usuario["nombre"],
            "email": usuario["email"],
            "rol": usuario["rol"],
        }
        return {"usuario": request.session["usuario"]}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No fue posible iniciar sesión. Revise la conexión con la base de datos.",
        ) from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.post("/logout")
def cerrar_sesion(request: Request):
    request.session.clear()
    return {"mensaje": "Sesión cerrada"}


@router.get("/me")
def sesion_actual(request: Request):
    usuario = request.session.get("usuario")
    if not usuario:
        raise HTTPException(status_code=401, detail="Inicie sesión para continuar")
    return usuario
