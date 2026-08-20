# Plantilla de variables de entorno

Configura estos valores en el panel de secretos de tu servidor o proveedor de hosting. No guardes credenciales reales en archivos del proyecto ni en un repositorio público.

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `NODE_ENV` | Sí | Usa `production` en el despliegue final. |
| `PORT` | Sí | Puerto interno de la aplicación, por ejemplo `3000`. |
| `DATABASE_URL` | Sí | URL de conexión MySQL/TiDB, con usuario y contraseña propios. |
| `JWT_SECRET` | Sí | Clave larga, aleatoria y exclusiva para firmar sesiones. |
| `VITE_APP_ID` | Sí con OAuth actual | Identificador de tu aplicación OAuth. |
| `OAUTH_SERVER_URL` | Sí con OAuth actual | Dirección del servidor OAuth compatible. |
| `VITE_OAUTH_PORTAL_URL` | Sí con OAuth actual | Dirección del portal de acceso OAuth. |
| `OWNER_OPEN_ID` | Sí con OAuth actual | Identificador del propietario inicial. |
| `BUILT_IN_FORGE_API_URL` | No | Solo para funciones que usen servicios de plataforma. |
| `BUILT_IN_FORGE_API_KEY` | No | Clave del servicio anterior; tratar siempre como secreto. |
| `VITE_APP_TITLE` | No | Nombre visible de la aplicación. |

Ejemplo de formato de conexión: `mysql://USUARIO:CONTRASEÑA@HOST:3306/conejo_copy_check`.
