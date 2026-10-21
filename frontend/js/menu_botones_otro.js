//prueba
// Ctrl + Shift + R

console.log("menu_botones.js cargado");

const btnCategorias = document.getElementById("btn-categorias");

console.log("Botón categorías:", btnCategorias);

if (btnCategorias) {
    btnCategorias.addEventListener("click", function (event) {
        event.preventDefault();
        console.log("Click en categorías");
        window.location.href = "/categorias";
    });
}
