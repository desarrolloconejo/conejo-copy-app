# QA — arreglos técnicos de Conejo Copy Check

| Arreglo | Validación | Resultado |
| --- | --- | --- |
| IDs de biblioteca | Vitest comprueba 42 entradas, IDs únicos y secuenciales de 1 a 42. | Aprobado. |
| Prueba requerida | Vitest valida que la ausencia de prueba con `requireProof` bloquea el veredicto y que una prueba declarada mantiene la aprobación esperada. | Aprobado. |
| Activos de marca | Búsqueda de código confirma que no hay rutas activas a `/manus-storage/`; favicon y símbolos usan SVG integrado. | Aprobado. |
| Flujos existentes | Prueba de humo valida Mesa, Canvas, auditor, historial, filtros y exportaciones. | Aprobado. |
| Reglas ampliadas | Prueba de renderizado estático valida el badge en Reglas y el aviso en el panel de auditoría para una regla 16/8. | Aprobado. |
| Integración autenticada | La prueba protegida crea una regla 16/8, la recupera desde la cartera del usuario junto con clientes, ficha y resultado, y elimina los registros temporales al finalizar. | Aprobado. |
| Renderizado | Capturas a 1280 px y 375 px muestran símbolo integrado y mesa operativa sin recursos de marca externos. | Aprobado. |

La validación se cerró con la alternativa elegida por el usuario: integración autenticada sin sesión personal en navegador. La batería final ejecutó 18 pruebas, comprobación de tipos y compilación de producción correctamente.
