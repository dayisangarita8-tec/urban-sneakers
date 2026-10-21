from pydantic import BaseModel, Field


class ProductoEntrada(BaseModel):
    id_categoria: int = Field(gt=0)
    nombre: str = Field(min_length=2, max_length=100)
    marca: str = Field(min_length=1, max_length=50)
    precio: float = Field(gt=0)
    stock: int = Field(ge=0)
    descuento: float = Field(default=0, ge=0, le=90)
    imagen: str = Field(default="imagen1.jpg", max_length=100)
    activo: int = Field(default=1, ge=0, le=1)
