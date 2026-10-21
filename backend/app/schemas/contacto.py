from pydantic import BaseModel, Field


class MensajeContacto(BaseModel):
    nombre: str = Field(min_length=2, max_length=50)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=100)
    mensaje: str = Field(min_length=5, max_length=255)
