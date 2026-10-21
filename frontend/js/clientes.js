document.addEventListener("DOMContentLoaded", async () => {
    const mensaje = document.getElementById("mensaje-clientes");
    try {
        const response = await fetch("/api/usuarios/", { credentials: "same-origin" });
        const clientes = await response.json();
        if (!response.ok) throw new Error(clientes.detail || "Inicia sesión como administrador.");
        const tabla = document.getElementById("tablaClientes");
        clientes.forEach((cliente) => {
            const fila = document.createElement("tr");
            [cliente.id_usuario, cliente.nombre, cliente.email].forEach((valor) => { const td = document.createElement("td"); td.textContent = valor; fila.append(td); });
            const rol = document.createElement("td"); const rolSelect = new SelectControl(["cliente", "administrador"], cliente.rol); rol.append(rolSelect.element); fila.append(rol);
            const estado = document.createElement("td"); const estadoSelect = new SelectControl(["1", "0"], String(cliente.activo)); estado.append(estadoSelect.element); fila.append(estado);
            const accion = document.createElement("td"); const boton = document.createElement("button"); boton.textContent = "Guardar";
            boton.addEventListener("click", async () => {
                const r = await fetch(`/api/usuarios/${cliente.id_usuario}`, { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rol: rolSelect.element.value, activo: Number(estadoSelect.element.value) }) });
                const d = await r.json(); mensaje.textContent = r.ok ? d.mensaje : (d.detail || "No se pudo actualizar");
            }); accion.append(boton); fila.append(accion); tabla.append(fila);
        });
        if (!clientes.length) mensaje.textContent = "No hay clientes registrados.";
    } catch (error) { mensaje.textContent = error.message; }
});

class SelectControl {
    constructor(values, selected) {
        this.element = document.createElement("select");
        values.forEach((value) => this.element.add(new Option(value === "1" ? "Activo" : value === "0" ? "Inactivo" : value, value)));
        this.element.value = selected;
    }
}
