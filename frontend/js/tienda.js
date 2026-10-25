const carritoTienda = JSON.parse(localStorage.getItem("cart") || "[]");
let sesionTienda = null;
let productosTienda = [];
let filtroCategoria = null;

const formatoCOP = (valor) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0
}).format(Number(valor) || 0);

async function apiTienda(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.detail || "No fue posible completar la operación");
    return body;
}

document.addEventListener("DOMContentLoaded", async () => {
    document.querySelectorAll("#catalogo1, #catalogo2, #catalogo3").forEach((el) => el.remove());
    prepararCatalogo();
    prepararCarrito();
    prepararCuenta();
    prepararContacto();
    dibujarCarrito();
    await cargarSesion();
    await cargarCatalogo();
});

function prepararCatalogo() {
    const catalogo = document.createElement("section");
    catalogo.id = "catalogo-dinamico";
    catalogo.className = "catalogo-dinamico";
    catalogo.innerHTML = '<h2 class="section-title">Catálogo Urban Sneakers</h2><div id="filtros-categorias" class="filtros-categorias"></div><div id="productos-lista" class="productos"></div><p id="mensaje-catalogo" role="status"></p>';
    const main = document.querySelector("main");
    const carrusel = main?.querySelector(".carousel-container");
    if (carrusel) carrusel.insertAdjacentElement("afterend", catalogo);
    else main?.append(catalogo);

    document.getElementById("btn-cat1")?.addEventListener("click", () => filtrarCategoriaPorNombre("Deportivas"));
    document.getElementById("btn-cat2")?.addEventListener("click", () => filtrarCategoriaPorNombre("Casuales"));
    document.getElementById("btn-cat3")?.addEventListener("click", () => filtrarCategoriaPorNombre("Premium"));
    document.getElementById("btn-inicio")?.addEventListener("click", () => {
        filtroCategoria = null;
        mostrarProductos();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.getElementById("search-btn")?.addEventListener("click", buscarProductos);
    document.getElementById("search-input")?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") buscarProductos();
    });
}

async function cargarCatalogo() {
    const lista = document.getElementById("productos-lista");
    if (!lista) return;
    try {
        const [categorias, productos] = await Promise.all([
            apiTienda("/api/categorias/"),
            apiTienda("/api/productos/")
        ]);
        productosTienda = productos;
        const categoriaSolicitada = new URLSearchParams(window.location.search).get("categoria");
        if (categoriaSolicitada) filtrarCategoriaPorNombre(categoriaSolicitada);
        const filtros = document.getElementById("filtros-categorias");
        const todos = document.createElement("button");
        todos.type = "button";
        todos.textContent = "Todos";
        todos.addEventListener("click", () => { filtroCategoria = null; mostrarProductos(); });
        filtros.append(todos);
        categorias.filter((c) => Number(c.activo) === 1).forEach((categoria) => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.textContent = categoria.nombre;
            boton.addEventListener("click", () => {
                filtroCategoria = Number(categoria.id_categoria);
                mostrarProductos();
            });
            filtros.append(boton);
        });
        mostrarProductos();
    } catch (error) {
        document.getElementById("mensaje-catalogo").textContent = error.message;
    }
}

function filtrarCategoriaPorNombre(nombre) {
    const categoria = productosTienda.find((p) => (p.categoria || "").toLowerCase() === nombre.toLowerCase());
    if (categoria) filtroCategoria = Number(categoria.id_categoria);
    mostrarProductos();
    document.getElementById("catalogo-dinamico")?.scrollIntoView({ behavior: "smooth" });
}

function mostrarProductos(termino = "") {
    const lista = document.getElementById("productos-lista");
    if (!lista) return;
    lista.replaceChildren();
    const encontrados = productosTienda.filter((producto) =>
        (!filtroCategoria || Number(producto.id_categoria) === filtroCategoria) &&
        `${producto.nombre} ${producto.marca} ${producto.categoria || ""}`.toLowerCase().includes(termino)
    );
    encontrados.forEach((producto) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "producto";
        const imagen = document.createElement("img");
        imagen.src = `/images/${encodeURIComponent(producto.imagen)}`;
        imagen.alt = `${producto.marca} ${producto.nombre}`;
        const contenido = document.createElement("div");
        contenido.className = "producto-content";
        const marca = document.createElement("p");
        marca.textContent = `${producto.marca} · ${producto.categoria || "Calzado"}`;
        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;
        const precio = document.createElement("p");
        precio.className = "price";
        const precioFinal = Number(producto.precio) * (1 - Number(producto.descuento) / 100);
        precio.textContent = formatoCOP(precioFinal);
        if (Number(producto.descuento) > 0) precio.textContent += ` (${producto.descuento}% de descuento)`;
        const stock = document.createElement("p");
        stock.textContent = Number(producto.stock) > 0 ? `Disponibles: ${producto.stock}` : "Agotado";
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = Number(producto.stock) > 0 ? "Agregar al carrito" : "Sin inventario";
        boton.disabled = Number(producto.stock) <= 0;
        boton.addEventListener("click", () => agregarAlCarrito(producto, precioFinal));
        contenido.append(marca, nombre, precio, stock, boton);
        tarjeta.append(imagen, contenido);
        lista.append(tarjeta);
    });
    document.getElementById("mensaje-catalogo").textContent = encontrados.length ? "" : "No hay productos para mostrar.";
}

function buscarProductos() {
    const termino = (document.getElementById("search-input")?.value || "").trim().toLowerCase();
    filtroCategoria = null;
    mostrarProductos(termino);
    document.getElementById("catalogo-dinamico")?.scrollIntoView({ behavior: "smooth" });
}

function agregarAlCarrito(producto, precio) {
    const id = Number(producto.id_producto);
    const existente = carritoTienda.find((item) => Number(item.id_producto) === id);
    if (existente) existente.cantidad += 1;
    else carritoTienda.push({
        id_producto: id,
        nombre: producto.nombre,
        precio,
        imagen: producto.imagen,
        cantidad: 1
    });
    guardarCarrito();
    dibujarCarrito();
}

function prepararCarrito() {
    document.getElementById("btn-cart")?.addEventListener("click", () => {
        const carrito = document.getElementById("carrito");
        carrito?.classList.remove("oculto");
        carrito?.scrollIntoView({ behavior: "smooth" });
    });
    document.getElementById("seguir-comprando")?.addEventListener("click", () => {
        document.getElementById("catalogo-dinamico")?.scrollIntoView({ behavior: "smooth" });
    });
    document.getElementById("cart-items")?.addEventListener("click", (event) => {
        const boton = event.target.closest("button[data-accion]");
        if (!boton) return;
        const item = carritoTienda.find((producto) => producto.id_producto === Number(boton.dataset.id));
        if (!item) return;
        if (boton.dataset.accion === "quitar") carritoTienda.splice(carritoTienda.indexOf(item), 1);
        if (boton.dataset.accion === "sumar") item.cantidad += 1;
        if (boton.dataset.accion === "restar") item.cantidad = Math.max(1, item.cantidad - 1);
        guardarCarrito();
        dibujarCarrito();
    });
    document.getElementById("checkout-btn")?.addEventListener("click", () => {
        if (!sesionTienda) return mostrarMensaje("Inicia sesión para registrar un pedido.");
        if (!carritoTienda.length) return mostrarMensaje("El carrito está vacío.");
        document.getElementById("checkout-modal").style.display = "flex";
    });
    document.querySelector(".modal-close")?.addEventListener("click", cerrarModal);
    document.getElementById("confirm-purchase")?.addEventListener("click", confirmarPedido);
}

function dibujarCarrito() {
    const lista = document.getElementById("cart-items");
    if (!lista) return;
    lista.replaceChildren();
    carritoTienda.forEach((item) => {
        const fila = document.createElement("div");
        fila.className = "cart-item";
        const titulo = document.createElement("span");
        titulo.textContent = `${item.nombre} · ${formatoCOP(item.precio)}`;
        const cantidad = document.createElement("span");
        cantidad.textContent = `Cantidad: ${item.cantidad}`;
        fila.append(titulo, cantidad);
        [["restar", "−"], ["sumar", "+"], ["quitar", "Quitar"]].forEach(([accion, texto]) => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.dataset.accion = accion;
            boton.dataset.id = item.id_producto;
            boton.textContent = texto;
            fila.append(boton);
        });
        lista.append(fila);
    });
    const subtotal = carritoTienda.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    document.getElementById("cart-subtotal").textContent = formatoCOP(subtotal);
    document.getElementById("cart-shipping").textContent = formatoCOP(0);
    document.getElementById("cart-total").textContent = formatoCOP(subtotal);
    document.getElementById("cart-count").textContent = carritoTienda.reduce((suma, item) => suma + item.cantidad, 0);
}

function guardarCarrito() { localStorage.setItem("cart", JSON.stringify(carritoTienda)); }
function cerrarModal() { document.getElementById("checkout-modal").style.display = "none"; }

async function confirmarPedido() {
    const direccion = document.getElementById("checkout-address").value.trim();
    if (direccion.length < 5) return mostrarMensaje("Escribe una dirección de entrega válida.");
    try {
        const pedido = await apiTienda("/api/pedidos", {
            method: "POST",
            body: JSON.stringify({ direccion, items: carritoTienda.map(({ id_producto, cantidad }) => ({ id_producto, cantidad })) })
        });
        carritoTienda.splice(0, carritoTienda.length);
        guardarCarrito();
        dibujarCarrito();
        cerrarModal();
        mostrarMensaje(`Pedido #${pedido.id_pedido} registrado. Total: ${formatoCOP(pedido.total)}.`);
    } catch (error) { mostrarMensaje(error.message); }
}

function prepararCuenta() {
    document.getElementById("btn-login")?.addEventListener("click", () => mostrarFormulario("login-form"));
    document.getElementById("btn-register")?.addEventListener("click", () => mostrarFormulario("register-form"));
    document.getElementById("go-to-register")?.addEventListener("click", (e) => { e.preventDefault(); mostrarFormulario("register-form"); });
    document.getElementById("go-to-login")?.addEventListener("click", (e) => { e.preventDefault(); mostrarFormulario("login-form"); });
    document.getElementById("btn-logout")?.addEventListener("click", async () => {
        await apiTienda("/api/auth/logout", { method: "POST" }).catch(() => {});
        sesionTienda = null;
        actualizarCuenta();
        mostrarMensaje("Sesión cerrada.");
    });
    document.getElementById("login-btn")?.addEventListener("click", iniciarSesion);
    document.getElementById("btnRegistrar")?.addEventListener("click", registrarCuenta);
}

async function cargarSesion() {
    try { sesionTienda = await apiTienda("/api/auth/me"); } catch { sesionTienda = null; }
    actualizarCuenta();
}

function actualizarCuenta() {
    document.getElementById("btn-login")?.classList.toggle("oculto", Boolean(sesionTienda));
    document.getElementById("btn-register")?.classList.toggle("oculto", Boolean(sesionTienda));
    document.getElementById("btn-logout")?.classList.toggle("oculto", !sesionTienda);
    document.getElementById("btn-cart")?.classList.remove("oculto");
    document.getElementById("search-container")?.classList.toggle("oculto", !sesionTienda);
    document.getElementById("user-info")?.classList.toggle("oculto", !sesionTienda);
    if (sesionTienda) document.getElementById("user-name").textContent = sesionTienda.nombre;
}

function mostrarFormulario(id) {
    ["login-form", "register-form"].forEach((formId) => document.getElementById(formId)?.classList.toggle("oculto", formId !== id));
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

async function iniciarSesion() {
    try {
        const body = await apiTienda("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: document.getElementById("login-email").value.trim(), contrasena: document.getElementById("login-pass").value })
        });
        sesionTienda = body.usuario;
        actualizarCuenta();
        mostrarFormulario("");
        mostrarMensaje(`Bienvenido/a ${sesionTienda.nombre}.`);
    } catch (error) { mostrarMensaje(error.message); }
}

async function registrarCuenta() {
    const datos = {
        nombre: document.getElementById("nombre").value.trim(),
        email: document.getElementById("email").value.trim(),
        contrasena: document.getElementById("contrasena").value
    };
    try {
        const respuesta = await apiTienda("/api/usuarios/", { method: "POST", body: JSON.stringify(datos) });
        ["nombre", "email", "contrasena"].forEach((id) => { document.getElementById(id).value = ""; });
        mostrarFormulario("login-form");
        mostrarMensaje(respuesta.mensaje);
    } catch (error) { mostrarMensaje(error.message); }
}

function prepararContacto() {
    document.getElementById("btn-contacto")?.addEventListener("click", () => {
        const contacto = document.getElementById("contacto");
        contacto?.classList.remove("oculto");
        contacto?.scrollIntoView({ behavior: "smooth" });
    });
    document.getElementById("contact-btn")?.addEventListener("click", () => {
        const nombre = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const mensaje = document.getElementById("contact-message").value.trim();
        if (!nombre || !email || !mensaje) return mostrarMensaje("Completa los datos de contacto.");
        apiTienda("/api/contacto/", { method: "POST", body: JSON.stringify({ nombre, email, mensaje }) })
            .then((respuesta) => mostrarMensaje(respuesta.mensaje))
            .catch((error) => mostrarMensaje(error.message));
    });
}

function mostrarMensaje(texto) {
    const toast = document.getElementById("toast-message");
    if (toast) {
        toast.textContent = texto;
        document.getElementById("toast").classList.add("show");
        setTimeout(() => document.getElementById("toast")?.classList.remove("show"), 3500);
    } else window.alert(texto);
}
