# Variables de entorno

Configura estos valores en el archivo `.env` de la raíz, o en el panel de secretos de tu proveedor. `.env` está en `.gitignore`: no subas credenciales reales a un repositorio.

## Obligatorias

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Conexión MySQL 8 o TiDB compatible. Formato: `mysql://USUARIO:CONTRASEÑA@HOST:3306/conejo_copy_check`. |
| `JWT_SECRET` | Clave con la que se firman las sesiones. Larga, aleatoria y exclusiva de este despliegue. |

El servidor **no arranca** si falta cualquiera de las dos: `assertEnv()` falla al iniciar con un mensaje explícito, en vez de dejar la aplicación en pie y fallar en cada petición.

Para generar una clave:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Opcionales

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `NODE_ENV` | `development` | Usa `production` en el despliegue final. |
| `PORT` | `3000` | Puerto de escucha. Si está ocupado, el servidor busca el siguiente libre. |
| `SESSION_TTL_DAYS` | `30` | Vida de la sesión. No hay revocación: bajarlo acota la ventana de un token filtrado. |
| `VITE_APP_TITLE` | — | Nombre visible de la aplicación. |

## Sobre `JWT_SECRET`

Es la llave maestra de la autenticación. Quien la tenga puede fabricar una sesión válida para cualquier cuenta, sin conocer ninguna contraseña.

- No la reutilices entre desarrollo y producción.
- Cambiarla invalida **todas** las sesiones activas de golpe. Es la única forma de forzar un cierre de sesión global, ya que no existe tabla de sesiones.
- Si se filtra, cámbiala de inmediato.

## Ejemplo de `.env` para desarrollo

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://root:CONTRASEÑA@127.0.0.1:3307/conejo_copy_check
JWT_SECRET=genera-el-tuyo-con-el-comando-de-arriba
SESSION_TTL_DAYS=30
VITE_APP_TITLE=Conejo Copy Check
```
