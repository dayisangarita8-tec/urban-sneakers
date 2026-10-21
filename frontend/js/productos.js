const apiProductos = async (url, options = {}) => {
    const response = await fetch(url, { credentials: "same-origin", ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "No se pudo completar la operación");
    return data;
};
let productoEditando = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarCategoriasProductos();
    cargarInventario();
    document.getElementById("btnGuardar")?.addEventListener("click", () => guardarProducto(false));
    document.getElementById("btnActualizar")?.addEventListener("click", () => guardarProducto(true));
    document.getElementById("btnEliminar")?.addEventListener("click", desactivarProducto);
    document.getElementById("productoForm")?.addEventListener("reset", () => { productoEditando = null; });
});

async function cargarCategoriasProductos() {
    try {
        const categorias = await apiProductos("/api/categorias/");
        const select = document.getElementById("id_categoria");
        select.replaceChildren(new Option("Seleccione una categoría", ""));
        categorias.filter((c) => Number(c.activo) === 1).forEach((c) => select.add(new Option(c.nombre, c.id_categoria)));
    } catch (error) { mostrarMensajeProductos(error.message); }
}

async function cargarInventario() {
    try {
        const productos = await apiProductos("/api/productos/?incluir_inactivos=true");
        const tabla = document.getElementById("tablaProductos");
        tabla.replaceChildren();
        productos.forEach((producto) => {
            const fila = document.createElement("tr");
            [producto.id_producto, producto.nombre, producto.marca, producto.categoria,
                new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(producto.precio),
                producto.stock, Number(producto.activo) ? "Activo" : "Inactivo"].forEach((dato) => {
                const celda = document.createElement("td"); celda.textContent = dato ?? ""; fila.append(celda);
            });
            const acciones = document.createElement("td");
            const editar = document.createElement("button"); editar.textContent = "Editar";
            editar.addEventListener("click", () => llenarProducto(producto));
            acciones.append(editar); fila.append(acciones); tabla.append(fila);
        });
    } catch (error) { mostrarMensajeProductos(error.message); }
}

function llenarProducto(p) {
    productoEditando = Number(p.id_producto);
    ["id_producto", "id_categoria", "nombre", "marca", "precio", "stock", "descuento", "imagen", "activo"]
        .forEach((id) => { document.getElementById(id).value = p[id] ?? ""; });
    document.getElementById("form-productos").scrollIntoView({ behavior: "smooth" });
}

function datosProducto() {
    return {
        id_categoria: Number(document.getElementById("id_categoria").value),
        nombre: document.getElementById("nombre").value.trim(),
        marca: document.getElementById("marca").value.trim(),
        precio: Number(document.getElementById("precio").value),
        stock: Number(document.getElementById("stock").value),
        descuento: Number(document.getElementById("descuento").value),
        imagen: document.getElementById("imagen").value.trim(),
        activo: Number(document.getElementById("activo").value)
    };
}

async function guardarProducto(actualizar) {
    if (actualizar && !productoEditando) return mostrarMensajeProductos("Selecciona un producto de la lista para actualizarlo.");
    try {
        const url = actualizar ? `/api/productos/${productoEditando}` : "/api/productos/";
        const result = await apiProductos(url, { method: actualizar ? "PUT" : "POST", body: JSON.stringify(datosProducto()) });
        mostrarMensajeProductos(result.mensaje || "Producto guardado.");
        document.getElementById("productoForm").reset();
        productoEditando = null;
        cargarInventario();
    } catch (error) { mostrarMensajeProductos(error.message); }
}

async function desactivarProducto() {
    if (!productoEditando) return mostrarMensajeProductos("Selecciona un producto de la lista para desactivarlo.");
    try {
        const result = await apiProductos(`/api/productos/${productoEditando}`, { method: "DELETE" });
        mostrarMensajeProductos(result.mensaje);
        document.getElementById("productoForm").reset();
        productoEditando = null;
        cargarInventario();
    } catch (error) { mostrarMensajeProductos(error.message); }
}

function mostrarMensajeProductos(texto) { document.getElementById("mensaje-productos").textContent = texto; }
