const API_URL = ""; // Same-origin API URL, so it also works after deployment.

const mensaje =
    document.getElementById("mensaje");

const tablaUsuarios =
    document.getElementById("tablaUsuarios");

const botonRegistrar =
    document.getElementById("btnRegistrar");


// ========================================
// REGISTRAR USUARIO
// ========================================

botonRegistrar.addEventListener(
    "click",
    async function() {

        // Obtener datos de los inputs
        const usuario = {

            nombre:
                document.getElementById("nombre").value,

            usuario:
                document.getElementById("email").value,

            correo:
                document.getElementById("rol").value,

            telefono:
                document.getElementById("activo").value,

            password:
                document.getElementById("password").value
        };


        // ========================================
        // VALIDAR CAMPOS
        // ========================================

        if (
            !usuario.nombre ||
            !usuario.email ||
            !usuario.rol ||
            !usuario.activo ||
            !usuario.password
        ) {

            mensaje.textContent =
                "Todos los campos son obligatorios";

            mensaje.className =
                "error";

            return;
        }


        // ========================================
        // ENVIAR A FASTAPI
        // ========================================

        try {

            const respuesta =
                await fetch(
                    `${API_URL}/api/usuarios/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(usuario)
                    }
                );


            const datos =
                await respuesta.json();


            // ========================================
            // ERROR
            // ========================================

            if (!respuesta.ok) {

                throw new Error(
                    datos.detail ||
                    "No se pudo registrar el usuario"
                );
            }


            // ========================================
            // REGISTRO EXITOSO
            // ========================================

            mensaje.textContent =
                datos.mensaje;

            mensaje.className =
                "exito";


            // Limpiar los campos

            document.getElementById("nombre").value = "";
            document.getElementById("email").value = "";
            document.getElementById("rol").value = "";
            document.getElementById("activo").value = "";
            document.getElementById("password").value = "";


            // Actualizar la tabla

            cargarUsuarios();

        }


        // ========================================
        // ERROR DE CONEXIÓN
        // ========================================

        catch(error) {

            console.error(error);

            mensaje.textContent =
                "Error: " + error.message;

            mensaje.className =
                "error";
        }

    }
);


// ========================================
// CONSULTAR USUARIOS
// ========================================

async function cargarUsuarios() {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/api/usuarios/`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron consultar los usuarios"
            );
        }


        const usuarios =
            await respuesta.json();


        // Limpiar tabla

        tablaUsuarios.innerHTML = "";


        // Recorrer usuarios

        usuarios.forEach(
            usuario => {

                const fila =
                    document.createElement("tr");


                fila.innerHTML = `
                    <td>
                        ${usuario.id_usuario}
                    </td>

                    <td>
                        ${usuario.nombre}
                    </td>

                    <td>
                        ${usuario.email}
                    </td>

                    <td>
                        ${usuario.rol}
                    </td>

                    <td>
                        ${
                            usuario.activo
                            ? "Activo"
                            : "Inactivo"
                        }
                    </td>
                `;


                tablaUsuarios.appendChild(fila);
            }
        );

    }

    catch(error) {

        console.error(
            "Error consultando usuarios:",
            error
        );
    }
}


// ========================================
// CARGAR USUARIOS AL INICIAR
// ========================================

cargarUsuarios();
