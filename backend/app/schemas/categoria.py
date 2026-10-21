from pydantic import BaseModel, Field

class Categorias(BaseModel):

    nombre: str = Field(min_length=1, max_length=50)
    activo: int = Field(ge=0, le=1)

class CategoriaActualizar(BaseModel):
    nombre: str = Field(min_length=1, max_length=50)
    activo: int = Field(ge=0, le=1)
