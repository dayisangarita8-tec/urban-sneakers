document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formCategoria");
    const tablaCategorias = document.getElementById("tablaCategorias");

    // Guarda el ID de la categoría que estamos editando
    let categoriaEditando = null;


    // ==========================================
    // GUARDAR / EDITAR CATEGORÍA
    // ==========================================

    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const activo = document.getElementById("activo").value;

        if (!nombre || activo === "") {

            alert("Complete todos los campos.");
            return;
        }

        const categoria = {
            nombre: nombre,
            activo: parseInt(activo)
        };


        try {

            let respuesta;

    console.log("categoriaEditando:", categoriaEditando);

            // ==========================================
            // EDITAR
            // ==========================================

            if (categoriaEditando !== null) {

                respuesta = await fetch(
                    `/api/categorias/${categoriaEditando}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(categoria)
                    }
                );

            }

            // ==========================================
            // CREAR
            // ==========================================

            else {

                respuesta = await fetch(
                    "/api/categorias/",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(categoria)
                    }
                );

            }


            const datos = await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    datos.detail || "Error al guardar la categoría"
                );

            }


            alert(datos.mensaje);


            // Limpiar formulario
            formulario.reset();

            // Salir del modo edición
            categoriaEditando = null;


            // Cambiar texto del botón
            formulario.querySelector("button[type='submit']").innerHTML =
                '<i class="fas fa-save"></i> Guardar Categoría';


            // Actualizar tabla
            cargarCategorias();


        } catch (error) {

            console.error("Error:", error);

            alert(
                "No se pudo guardar la categoría: " +
                error.message
            );

        }

    });


    // ==========================================
    // CARGAR CATEGORÍAS
    // ==========================================

    async function cargarCategorias() {

        try {

            const respuesta = await fetch(
                "/api/categorias/"
            );


            if (!respuesta.ok) {

                throw new Error(
                    "No se pudieron obtener las categorías"
                );

            }


            const categorias = await respuesta.json();


            tablaCategorias.innerHTML = "";


            categorias.forEach(function (categoria) {

                const fila = document.createElement("tr");
                const id = Number(categoria.id_categoria);
                const agregarCelda = (valor) => {
                    const celda = document.createElement("td");
                    celda.textContent = valor;
                    fila.appendChild(celda);
                };

                agregarCelda(String(id));
                agregarCelda(categoria.nombre ?? "");
                agregarCelda(Number(categoria.activo) ? "Activo" : "Inactivo");

                const acciones = document.createElement("td");
                [
                    ["Editar", () => window.editarCategoria(id)],
                    ["Activar", () => window.activarCategoria(id)],
                    ["Inactivar", () => window.inactivarCategoria(id)]
                ].forEach(([etiqueta, accion]) => {
                    const boton = document.createElement("button");
                    boton.type = "button";
                    boton.textContent = etiqueta;
                    boton.addEventListener("click", accion);
                    acciones.appendChild(boton);
                });
                fila.appendChild(acciones);
                tablaCategorias.appendChild(fila);

            });


        } catch (error) {

            console.error(
                "Error cargando categorías:",
                error
            );

        }

    }


    // ==========================================
    // EDITAR CATEGORÍA
    // ==========================================

    window.editarCategoria = async function (id_categoria) {

        try {

            const respuesta = await fetch(
                "/api/categorias/"
            );


            if (!respuesta.ok) {

                throw new Error(
                    "No se pudieron obtener las categorías"
                );

            }


            const categorias = await respuesta.json();


            const categoria = categorias.find(
                c => Number(c.id_categoria) === Number(id_categoria)
            );


            if (!categoria) {

                alert("Categoría no encontrada.");
                return;

            }


            // Guardamos el ID que estamos editando
            categoriaEditando = id_categoria;


            // Cargar información en el formulario
            document.getElementById("nombre").value =
                categoria.nombre;


            document.getElementById("activo").value =
                String(categoria.activo);


            // Cambiar texto del botón
            formulario.querySelector("button[type='submit']").innerHTML =
                '<i class="fas fa-edit"></i> Actualizar Categoría';


            // Llevar al usuario hacia el formulario
            formulario.scrollIntoView({
                behavior: "smooth"
            });


        } catch (error) {

            console.error(
                "Error editando categoría:",
                error
            );

            alert(
                "No se pudo cargar la categoría: " +
                error.message
            );

        }

    };


    // ==========================================
    // ACTIVAR CATEGORÍA
    // ==========================================

    window.activarCategoria = async function (id_categoria) {

        if (!confirm("¿Desea activar esta categoría?")) {
            return;
        }


        try {

            const respuesta = await fetch(
                `/api/categorias/${id_categoria}/activar`,
                {
                    method: "PUT"
                }
            );


            const datos = await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    datos.detail || "Error al activar la categoría"
                );

            }


            alert(datos.mensaje);


            // Actualizar listado
            cargarCategorias();


        } catch (error) {

            console.error(
                "Error activando categoría:",
                error
            );

            alert(
                "No se pudo activar la categoría: " +
                error.message
            );

        }

    };


    // ==========================================
    // INACTIVAR CATEGORÍA
    // ==========================================

    window.inactivarCategoria = async function (id_categoria) {

        if (!confirm("¿Desea inactivar esta categoría?")) {
            return;
        }


        try {

            const respuesta = await fetch(
                `/api/categorias/${id_categoria}/inactivar`,
                {
                    method: "PUT"
                }
            );


            const datos = await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    datos.detail || "Error al inactivar la categoría"
                );

            }


            alert(datos.mensaje);


            // Actualizar listado
            cargarCategorias();


        } catch (error) {

            console.error(
                "Error inactivando categoría:",
                error
            );

            alert(
                "No se pudo inactivar la categoría: " +
                error.message
            );

        }

    };


    // ==========================================
    // CARGAR AL ABRIR LA PÁGINA
    // ==========================================

    cargarCategorias();

});
