# Conejo Copy Check — paquete de código fuente

Este paquete contiene el código de la aplicación, su esquema de datos, migraciones, pruebas y documentación de producto. No contiene secretos, sesiones, dependencias instaladas, archivos de compilación ni una copia de los datos operativos.

## Qué incluye

| Elemento | Ubicación | Propósito |
| --- | --- | --- |
| Aplicación React | `client/` | Interfaz de Mesa, Canvas, auditor, manual, historial, reglas y referencias de tendencia. |
| API y autenticación | `server/` | Servidor Express/tRPC, procedimientos protegidos y utilidades de sesión. |
| Datos y migraciones | `drizzle/` | Esquema MySQL/TiDB y migraciones de clientes, reglas, fichas, resultados y referencias. |
| Tipos compartidos | `shared/` | Contratos, constantes y errores comunes. |
| Pruebas y QA | `client/**/*.test.*`, `server/**/*.test.*`, `scripts/`, `validacion_*.md` | Pruebas unitarias, de interfaz e integración, más evidencia de QA. |

## Requisitos

Necesitarás Node.js 22+, pnpm 10+, una base de datos MySQL 8 o TiDB compatible y HTTPS para la cookie de sesión de producción. Configura los valores propios descritos en [`ENVIRONMENT_TEMPLATE.md`](./ENVIRONMENT_TEMPLATE.md) mediante el panel de secretos de tu servidor; nunca subas esos valores a un repositorio público.

> **Autenticación actual.** La versión exportada usa el flujo OAuth compatible con Manus que está implementado en `server/_core/sdk.ts`. Para conservar el inicio de sesión tal como funciona ahora, configura una aplicación OAuth compatible y sus variables. Si vas a usar un proveedor propio, sustituye el flujo de `sdk.ts`, `context.ts`, `oauth.ts` y `client/src/const.ts` por tu integración de autenticación.

## Instalación local

```bash
pnpm install --frozen-lockfile
# Configura las variables de ENVIRONMENT_TEMPLATE.md en tu entorno local.
pnpm drizzle-kit migrate
pnpm dev
```

Para aplicar las migraciones en una base de datos nueva puedes usar `pnpm drizzle-kit migrate`. El esquema actual se encuentra en `drizzle/schema.ts`; no ejecutes las migraciones contra una base de producción sin antes hacer una copia de seguridad.

## Producción

```bash
pnpm install --frozen-lockfile
pnpm drizzle-kit migrate
pnpm build
NODE_ENV=production pnpm start
```

El servidor respeta la variable `PORT`; sitúa un proxy inverso con TLS delante de la aplicación. Configura el dominio final como callback permitido en tu proveedor OAuth y utiliza una clave `JWT_SECRET` única y larga.

## Usuarios, roles y ajustes

La tabla `users` contiene el perfil autenticado y el campo `role`, con valores `user` o `admin`. Con el flujo actual, una persona se crea o actualiza la primera vez que inicia sesión mediante OAuth. Para convertir una cuenta existente en administradora, actualiza su campo `role` mediante una migración o consola administrativa protegida; evita exponer una ruta pública que lo haga.

Los datos operativos se aíslan por `ownerId`: cada persona solo recibe sus clientes, reglas, fichas, resultados y referencias de tendencia. Los principales puntos de ampliación son `drizzle/schema.ts` para datos, `server/routers.ts` para procedimientos y `client/src/pages/Home.tsx` para interfaz.

## Datos no incluidos

Por privacidad y seguridad, la exportación no incluye usuarios, clientes, historiales, reglas, resultados ni referencias existentes. Si necesitas trasladar datos, realiza una exportación de la base de datos desde la consola de tu proveedor y restaúrala únicamente en una base de destino protegida; revisa antes los identificadores de usuarios y las dependencias entre tablas.

## Comprobaciones

```bash
pnpm test
pnpm check
pnpm build
```

Las pruebas de navegador e integración bajo `scripts/` están pensadas para el entorno de desarrollo y pueden requerir Chromium y una base de datos de prueba. No las ejecutes contra producción sin comprobar las secciones de limpieza de cada script.
