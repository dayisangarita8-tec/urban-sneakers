document.addEventListener("DOMContentLoaded", async () => {
    const mensaje = document.getElementById("mensaje-reportes");
    try {
        const response = await fetch("/api/reportes/resumen", { credentials: "same-origin" });
        const reporte = await response.json();
        if (!response.ok) throw new Error(reporte.detail || "Inicia sesión como administrador.");
        document.getElementById("totalPedidos").textContent = reporte.pedidos;
        document.getElementById("totalVentas").textContent = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(reporte.ventas);
        const tabla = document.getElementById("tablaMasVendidos");
        reporte.mas_vendidos.forEach((item) => {
            const fila = document.createElement("tr");
            [item.nombre, item.unidades].forEach((valor) => { const td = document.createElement("td"); td.textContent = valor; fila.append(td); });
            tabla.append(fila);
        });
    } catch (error) { mensaje.textContent = error.message; }
});
