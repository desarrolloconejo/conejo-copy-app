# Validación — referencias de hooks en tendencia

La zona de referencias se insertó al inicio de Biblioteca, antes de las 42 aperturas modelo. Mantiene la separación entre un hook observado y la adaptación que el equipo hará para cada cliente.

| Área | Validación | Resultado |
| --- | --- | --- |
| Carga | Hook, por qué funciona, Insert-Titulo, plataforma, territorio, fuente y etiquetas aparecen en una sola zona de formulario. | Aprobado. |
| Consulta | El banco incluye búsqueda y filtros independientes de plataforma y territorio. | Aprobado. |
| Reutilización | Cada referencia persistida tiene la acción “Usar como punto de partida”, que completa hook e Insert-Titulo en Canvas. | Validado en navegador autenticado. |
| Escritorio | La carga ocupa dos columnas, conserva jerarquía editorial y deja visibles filtros y estado vacío. | Aprobado. |
| Móvil | Los campos pasan a una sola columna; filtros, búsqueda y estado vacío se mantienen legibles sin desbordamiento. | Aprobado. |

> El estado no autenticado conserva la lectura del banco y muestra un acceso explícito para iniciar sesión antes de guardar. La persistencia de una referencia se validó mediante una integración protegida y reversible.

## Evidencia funcional completa

La prueba autenticada de navegador creó una referencia temporal, la excluyó al seleccionar una plataforma y un territorio distintos, y la recuperó al restablecer sus filtros de plataforma **TikTok** y territorio **B**. Después la localizó por texto dentro de la búsqueda del banco y pulsó “Usar como punto de partida”. Se verificó que el hook y el Insert-Titulo se copiaron al Canvas, sin perder los demás campos de la ficha. Al cerrar la prueba, el registro de QA se eliminó de la base de datos.
