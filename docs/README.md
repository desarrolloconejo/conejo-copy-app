# Documentación

Material de referencia del proyecto. Para instalar y desplegar, mira el [README de la raíz](../README.md) y [ENVIRONMENT_TEMPLATE.md](../ENVIRONMENT_TEMPLATE.md).

## Producto y diseño

| Documento | Qué contiene |
| --- | --- |
| [brand_notes.md](brand_notes.md) | Paleta oficial, tipografía y motivos gráficos de *el conejo del sombrero*. Es la fuente de los colores que usa la interfaz. |
| [ideas.md](ideas.md) | La dirección de diseño elegida y las dos descartadas, con los principios que explican por qué la pantalla está compuesta así. |
| [feature_spec.md](feature_spec.md) | Modelo de datos y flujos: cliente, regla de auditoría, registro de copy y resultado real. |
| [especificacion_referencias_tendencia.md](especificacion_referencias_tendencia.md) | Alcance del banco de referencias de tendencia. |
| [auditoria_flujo_redaccion.md](auditoria_flujo_redaccion.md) | Por qué la Mesa de producción va antes que el manual. Explica la jerarquía de la navegación. |

## Evidencia de QA

[`qa/`](qa/) recoge las validaciones de la etapa anterior del proyecto, cuando se desarrolló sobre la plataforma Manus. Se conservan como registro de lo que se comprobó y cuándo; **no describen el estado actual**: la autenticación, el despliegue y parte de la interfaz se rehicieron después.

Para el estado actual valen las pruebas del repositorio (`pnpm test`) y el smoke autenticado (`node scripts/smoke.mjs`).
