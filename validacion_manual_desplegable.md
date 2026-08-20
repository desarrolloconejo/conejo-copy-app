# Validación — manual desplegable

La cabina conserva las áreas de producción abiertas: **Mesa diaria**, **Canvas**, **Auditor**, **Historial** y **Reglas**. El contenido de referencia se presenta cerrado por defecto para que el recorrido inicial priorice elegir cliente, objetivo y redactar.

| Bloque | Estado inicial | Comportamiento validado |
| --- | --- | --- |
| Guía de objetivos | Plegada | Expone Comunidad, Consideración y Acción al pulsar “Ver guía”. |
| Fundamento, Territorios, Biblioteca y Edición | Plegados | Cada encabezado controla su propia explicación y la navegación los abre al dirigirse a la sección. |
| Cementerio, Números, Protocolo y Fuentes | Plegados | Se mantienen como consulta bajo demanda sin desplazar el flujo de producción. |
| Canvas, Auditor, Historial y Reglas | Abiertos | No se convirtieron en paneles plegables. |

La prueba de humo recorre y verifica el estado plegado, apertura y cierre de La Ventana, Fundamento, Territorios, Biblioteca, Edición, Cementerio, Números, Protocolo, Fuentes y Guía de objetivos. También confirma que Canvas no se convierte en un contenedor plegable.

La captura de escritorio muestra Fundamento abierto con sus tres resultados, cinco principios y capas en una jerarquía de dos niveles. La captura móvil confirma una columna continua, botón de cierre a ancho disponible y cabecera compacta sin desbordamiento horizontal. La prueba responsive automatizada verificó la vista abierta en 1280 px y 375 px; la interfaz se validó además con 20 pruebas unitarias, tipado y compilación de producción.
