from pathlib import Path
import os

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routers import auth, categorias, contacto, pedidos, productos, usuarios


BASE_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(title="Urban Sneakers", version="1.0.0")
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "local-development-only-change-me"),
    same_site="lax",
    https_only=os.getenv("COOKIE_SECURE", "false").lower() == "true",
)
for router in (auth.router, categorias.router, contacto.router, productos.router, pedidos.router, usuarios.router):
    app.include_router(router)

for folder in ("css", "js", "images"):
    app.mount(f"/{folder}", StaticFiles(directory=FRONTEND_DIR / folder), name=folder)


@app.get("/health", tags=["Estado"])
def health_check():
    """Lightweight platform health check; the database is checked separately."""
    return {"status": "ok", "service": "urban-sneakers"}


@app.get("/", include_in_schema=False)
def inicio():
    return FileResponse(FRONTEND_DIR / "UrbanSneakers.html")


@app.get("/login", include_in_schema=False)
def login():
    return FileResponse(FRONTEND_DIR / "UrbanSneakers.html")


@app.get("/registro", include_in_schema=False)
def registro():
    return FileResponse(FRONTEND_DIR / "UrbanSneakers.html")


@app.get("/categorias", include_in_schema=False)
def pagina_categorias():
    return FileResponse(FRONTEND_DIR / "categorias.html")


@app.get("/productos", include_in_schema=False)
def pagina_productos():
    return FileResponse(FRONTEND_DIR / "productos.html")


@app.get("/clientes", include_in_schema=False)
def pagina_clientes():
    return FileResponse(FRONTEND_DIR / "clientes.html")


@app.get("/reportes", include_in_schema=False)
def pagina_reportes():
    return FileResponse(FRONTEND_DIR / "reportes.html")


@app.get("/pedidos", include_in_schema=False)
def pagina_pedidos():
    return FileResponse(FRONTEND_DIR / "pedidos.html")
