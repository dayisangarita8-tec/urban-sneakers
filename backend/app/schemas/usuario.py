from pydantic import BaseModel, Field


class RegistroUsuario(BaseModel):
    nombre: str = Field(min_length=2, max_length=50)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=100)
    contrasena: str = Field(min_length=8, max_length=128)


class InicioSesion(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=100)
    contrasena: str = Field(min_length=1, max_length=128)


class UsuarioAdminActualizar(BaseModel):
    rol: str = Field(pattern=r"^(cliente|administrador)$")
    activo: int = Field(ge=0, le=1)
