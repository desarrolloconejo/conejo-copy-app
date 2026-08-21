# Conejo Copy Check

Herramienta interna de *el conejo del sombrero* para escribir y auditar **hooks de vídeo corto** — los primeros dos o tres segundos de un Reel, un TikTok, un Short o un anuncio vertical.

El flujo de trabajo es: elegir cliente → definir objetivo → escribir tensión y prueba → construir hook e Insert-Titulo → **auditar** → guardar ficha → registrar el resultado real cuando la pieza se publica.

El auditor es determinista: nueve controles sobre listas de expresiones y patrones, con un umbral de paso de 70/100. No interviene ningún modelo de lenguaje, así que la puntuación es reproducible y explicable.

## Qué hay dentro

| Elemento | Ubicación | Propósito |
| --- | --- | --- |
| Aplicación React | `client/` | Mesa de producción, Canvas, auditor, manual, historial, reglas y referencias de tendencia. |
| API y autenticación | `server/` | Express + tRPC, procedimientos protegidos, contraseñas y sesión. |
| Datos y migraciones | `drizzle/` | Esquema MySQL y migraciones. |
| Tipos compartidos | `shared/` | Contratos y constantes comunes. |
| Criterio editorial | `client/src/lib/hookManual.ts` | Las 42 plantillas de hook y la función de auditoría. |
| Pruebas | `**/*.test.ts(x)` | 47 pruebas unitarias y de guardas de acceso. |
| Smoke autenticado | `scripts/smoke.mjs` | Comprobación de extremo a extremo en navegador. |
| Referencia | `docs/` | Marca, dirección de diseño, modelo de datos y evidencia de QA histórica. |

## Requisitos

Node.js 22 o superior, pnpm 10 y una base MySQL 8 o TiDB compatible.

## Puesta en marcha

```bash
pnpm install --frozen-lockfile
# Crea .env siguiendo ENVIRONMENT_TEMPLATE.md
pnpm drizzle-kit migrate
pnpm create-admin tu@email.com "Tu Nombre"
pnpm dev
```

`create-admin` imprime una contraseña temporal **una sola vez**. Se pedirá cambiarla al entrar.

Para una base local con Docker:

```bash
docker run -d --name conejo-mysql \
  -e MYSQL_ROOT_PASSWORD=CONTRASEÑA -e MYSQL_DATABASE=conejo_copy_check \
  -p 3307:3306 mysql:8
```

## Producción con Docker

Es la vía recomendada: el servidor solo necesita Docker con el plugin `compose`. Ni Node, ni pnpm, ni MySQL instalados en la máquina.

```bash
cp .env.example .env          # rellena JWT_SECRET y MYSQL_ROOT_PASSWORD
docker compose build
docker compose --profile tools run --rm migrate
docker compose up -d
docker compose exec app node dist/admin.js tu@email.com "Tu Nombre"
```

Las migraciones son un paso deliberado, bajo el perfil `tools`: un reinicio no debe poder alterar el esquema por su cuenta.

La base **no publica puerto al host**: solo la alcanza la aplicación por la red interna del compose. Los datos viven en el volumen `db-data`, que sobrevive a `docker compose down` — pero no a `down -v`.

### Copias de seguridad

```bash
docker compose exec db mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" conejo_copy_check > copia.sql
```

Hazlas antes de que haya trabajo real dentro, y prueba una restauración al menos una vez. El volumen por sí solo no es una copia de seguridad.

## Producción sin Docker

```bash
pnpm install --frozen-lockfile
pnpm build
NODE_ENV=production pnpm migrate
NODE_ENV=production pnpm start
```

El build produce `dist/index.js` (servidor), `dist/public/` (cliente), `dist/migrate.js` y `dist/admin.js`. El servidor va empaquetado: la única dependencia que necesita instalada es `mysql2`, que resuelve módulos en tiempo de ejecución y no sobrevive al empaquetado.

## Autenticación y cuentas

Acceso con email y contraseña contra la propia base de datos. Las contraseñas se guardan como digest `scrypt` con sus parámetros de coste incrustados, de modo que se pueden endurecer más adelante sin invalidar las existentes.

**No hay registro público.** Las cuentas las crea un administrador desde `/usuarios`, que entrega una contraseña temporal de un solo uso. Desde ahí también se desactivan cuentas y se emiten contraseñas nuevas. Desactivar conserva todo el trabajo de esa persona; borrar arrastraría en cascada sus clientes, fichas y resultados.

La sesión viaja en una cookie `httpOnly` con `SameSite=Lax`, firmada con `JWT_SECRET`. El atributo `Secure` se activa solo cuando la petición llega por HTTPS.

> **Sin TLS, las contraseñas viajan en claro.** Mientras no haya un proxy inverso con certificado delante, no expongas el puerto de la aplicación a internet: limítalo a red privada, VPN o IP autorizada en el cortafuegos.

Los datos operativos se aíslan por `ownerId`: cada persona solo ve sus clientes, reglas, fichas, resultados y referencias.

## Comprobaciones

```bash
pnpm test    # 47 pruebas
pnpm check   # tipos
pnpm build   # compilación
node scripts/smoke.mjs tu@email.com "tu contraseña"   # navegador, con la app levantada
```

El smoke necesita Chrome. Si no está en la ruta habitual del sistema, indícala con `CHROME_PATH`.

## Ampliación

Los puntos de entrada naturales son `drizzle/schema.ts` para datos, `server/routers.ts` para procedimientos y `client/src/pages/Home.tsx` para interfaz. Ten en cuenta que `Home.tsx` concentra las trece secciones de la aplicación en un solo archivo: lo nuevo conviene sacarlo a archivos propios, como se hizo con el panel de usuarios.
