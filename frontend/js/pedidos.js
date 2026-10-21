async function cargarPedidos() {
    const mensaje = document.getElementById("mensaje-pedidos");
    const tabla = document.getElementById("tablaPedidos");
    try {
        const [pedidos, sesion] = await Promise.all([
            fetch("/api/pedidos", { credentials: "same-origin" }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.detail); return d; }),
            fetch("/api/auth/me", { credentials: "same-origin" }).then((r) => r.ok ? r.json() : null)
        ]);
        tabla.replaceChildren();
        pedidos.forEach((pedido) => {
            const fila = document.createElement("tr");
            [pedido.id_pedido, pedido.cliente || "Mi cuenta", new Date(pedido.fecha).toLocaleDateString("es-CO"),
                new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(pedido.total),
                pedido.direccion, pedido.estado].forEach((valor) => { const td = document.createElement("td"); td.textContent = valor ?? ""; fila.append(td); });
            const celda = document.createElement("td");
            if (sesion?.rol === "administrador") {
                const select = document.createElement("select");
                ["Pendiente", "En proceso", "Enviado", "Entregado", "Cancelado"].forEach((estado) => select.add(new Option(estado, estado)));
                select.value = pedido.estado;
                select.addEventListener("change", async () => {
                    try {
                        const r = await fetch(`/api/pedidos/${pedido.id_pedido}/estado`, { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: select.value }) });
                        const data = await r.json(); if (!r.ok) throw new Error(data.detail);
                        mensaje.textContent = data.mensaje;
                    } catch (error) { mensaje.textContent = error.message; }
                });
                celda.append(select);
            } else celda.textContent = "Seguimiento disponible";
            fila.append(celda); tabla.append(fila);
        });
        if (!pedidos.length) mensaje.textContent = "Todavía no hay pedidos.";
    } catch (error) { mensaje.textContent = error.message || "Inicia sesión para consultar pedidos."; }
}
document.addEventListener("DOMContentLoaded", cargarPedidos);
