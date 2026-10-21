const rutasMenu = {
    "btn-inicio": "/",
    "btn-cat1": "/?categoria=Deportivas",
    "btn-cat2": "/?categoria=Casuales",
    "btn-cat3": "/?categoria=Premium",
    "btn-categorias": "/categorias",
    "btn-productos": "/productos",
    "btn-Productos": "/productos",
    "btn-pedidos": "/pedidos",
    "btn-clientes": "/clientes",
    "btn-reportes": "/reportes"
};

Object.entries(rutasMenu).forEach(([id, ruta]) => {
    const boton = document.getElementById(id);
    if (boton) {
        boton.addEventListener("click", () => {
            window.location.href = ruta;
        });
    }
});
