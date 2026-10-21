from fastapi import APIRouter, HTTPException, status

from app.database import obtener_conexion
from app.schemas.contacto import MensajeContacto


router = APIRouter(prefix="/api/contacto", tags=["Contacto"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_mensaje(datos: MensajeContacto):
    conexion = None
    cursor = None
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute(
            "INSERT INTO contacto (nombre, email, mensaje) VALUES (%s, %s, %s)",
            (datos.nombre.strip(), datos.email.strip().lower(), datos.mensaje.strip()),
        )
        conexion.commit()
        return {"mensaje": "Mensaje recibido. Gracias por contactarnos."}
    except Exception as exc:
        if conexion:
            conexion.rollback()
        raise HTTPException(status_code=503, detail="No fue posible guardar el mensaje") from exc
    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()
