from pydantic import BaseModel, Field


class ItemPedido(BaseModel):
    id_producto: int = Field(gt=0)
    cantidad: int = Field(gt=0, le=50)


class PedidoEntrada(BaseModel):
    direccion: str = Field(min_length=5, max_length=255)
    items: list[ItemPedido] = Field(min_length=1, max_length=30)


class PedidoEstado(BaseModel):
    estado: str = Field(pattern=r"^(Pendiente|En proceso|Enviado|Entregado|Cancelado)$")
