# Validación de edición visual

La edición automática aplicó los valores solicitados a múltiples descendientes y creó atributos `style` duplicados, lo que impedía la compilación de JSX. Se sustituyó por una única regla de layout en la sección **Fundamento**: ancho máximo de 444 px y desplazamiento de 312 px solo en escritorio. La tabla de principios conserva la referencia de 758 px dentro de un contenedor con desplazamiento horizontal, en lugar de imponer ese ancho a todos los elementos de tabla.

La comprobación de tipos y la batería de 18 pruebas se ejecutaron correctamente tras la corrección. La revisión visual de escritorio confirmó que la cabina y el inicio del manual se mantienen estables. Una prueba de navegador verificó el resultado del layout: **444 px de ancho y 312 px de margen izquierdo en escritorio**, y **335 px de ancho con 0 px de margen en móvil**, sin desbordamiento horizontal de página.
