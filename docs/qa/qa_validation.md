# Validación funcional — ampliación de Conejo Copy Check

La validación se ejecutó el 18 de agosto de 2026 sobre el entorno de desarrollo de la aplicación. Las comprobaciones combinaron pruebas unitarias, una prueba de humo del navegador, una integración protegida contra la base de datos y revisión visual en escritorio y móvil.

| Caso | Entorno | Resultado esperado | Resultado obtenido | Estado |
| --- | --- | --- | --- | --- |
| Auditoría de hook | Navegador local, 1280 px | Un preámbulo modifica el diagnóstico de auditoría. | El hook introducido activó la alerta “Empieza en seco”. | Aprobado |
| Filtros de historial | Navegador local, 1280 px | Deben aparecer filtros de cliente, estado y plataforma. | Se detectaron los tres filtros dentro de Historial. | Aprobado |
| Alta de cliente | Navegador local, 1280 px | El botón Cliente debe abrir el formulario correspondiente. | Se mostró el campo “Nombre del cliente”. | Aprobado |
| Exportación CSV | Navegador local, 1280 px | Debe descargarse una ficha como archivo CSV. | Se generó un archivo `.csv` en la carpeta de descargas controlada. | Aprobado |
| Exportación PDF | Navegador local, 1280 px | Debe abrirse la vista imprimible de la ficha. | Se abrió una nueva ventana de impresión. | Aprobado |
| Cliente, regla, ficha y resultado | API protegida y base de datos | Deben persistirse y relacionarse con el usuario actual. | La integración creó las cuatro entidades, verificó estado `analyzed` y resultados; al finalizar eliminó los datos de ensayo. | Aprobado |
| Validaciones de entrada | Vitest | Entradas inválidas deben rechazarse antes de escribir en la base de datos. | Dos pruebas de validación de rutas finalizaron correctamente. | Aprobado |
| Diseño responsive | Captura de escritorio y móvil | Los controles deben conservar jerarquía y legibilidad. | Se revisaron vistas de 1280×720 y 375×812 sin errores de layout observables. | Aprobado |

> Las pruebas de persistencia utilizaron una cuenta existente únicamente para ejercer la autorización. Los registros de QA se eliminaron al cerrar la prueba, por lo que no quedan clientes, reglas, fichas o resultados ficticios en la base de datos.

## Límites de la validación

La exportación PDF se validó como apertura de una vista imprimible en el navegador; la conversión final a archivo PDF depende del diálogo de impresión del sistema del usuario. Las métricas reales se validaron a través de los procedimientos protegidos de la aplicación con datos efímeros y no con datos de campañas de producción.
