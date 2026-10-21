# Tablero Kanban para la publicación

Estas tarjetas se pueden crear en Trello para planear y evidenciar la actividad 9_7. Mueve cada tarjeta de **Por hacer** a **En proceso** y luego a **Hecho**; adjunta capturas y enlaces durante la ejecución.

## Por hacer

- Revisar el repositorio y confirmar que `.env`, entornos virtuales y respaldos SQL privados están excluidos.
- Crear la base MySQL de Railway y ejecutar `database/schema.sql`.
- Crear el servicio web conectado al repositorio de GitHub.
- Definir variables MySQL y `SESSION_SECRET` en Railway.
- Registrar la cuenta administradora y asignarle el rol en la base de datos.
- Configurar el dominio público y comprobar `/health`.
- Verificar catálogo, productos, categorías, registro, inicio de sesión, pedidos y reportes.
- Revisar los registros y el consumo del proveedor; anotar incidencias y soluciones.
- Guardar capturas, enlaces y conclusiones en el informe de despliegue.

## Criterio de cierre

El tablero se cierra cuando el sitio está accesible, una lectura y escritura de prueba llegan a MySQL, las variables secretas no están en GitHub y el informe incluye la URL pública, el diagrama y las evidencias.
