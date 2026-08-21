# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Etapa 1 — compilación
#
# Instala todo, incluidas las herramientas de desarrollo, y produce dist/.
# Nada de esta etapa llega a la imagen final salvo los artefactos compilados.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable

# El manifiesto primero: mientras no cambie, Docker reutiliza la capa de
# dependencias y una recompilación no vuelve a descargar nada.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


# ---------------------------------------------------------------------------
# Etapa 2 — dependencias de ejecución
#
# El servidor se empaqueta con esbuild, así que solo queda fuera mysql2, que
# resuelve algunos módulos en tiempo de ejecución y no sobrevive al empaquetado.
# Se instala aquí en solitario para no arrastrar a la imagen las dependencias
# del cliente, que ya están compiladas dentro de dist/public.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json ./
# Se reduce el manifiesto a mysql2 tomando su version del real, para que no
# puedan desincronizarse, y se instala en un arbol plano y sin dev.
RUN node -e "const p=require(\"./package.json\");require(\"fs\").writeFileSync(\"package.json\",JSON.stringify({name:\"conejo-runtime\",private:true,dependencies:{mysql2:p.dependencies.mysql2}}))"  && npm install --omit=dev --no-package-lock --no-audit --no-fund


# ---------------------------------------------------------------------------
# Etapa 3 — ejecución
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

# Las migraciones viajan junto a su binario: dist/migrate.js las busca en
# ./drizzle relativo a sí mismo cuando NODE_ENV es production.
COPY --from=build --chown=node:node /app/drizzle ./dist/drizzle

# La imagen base ya trae el usuario "node", sin privilegios.
USER node
EXPOSE 3000

# Comprueba que el servidor responde, no solo que el proceso sigue vivo.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/trpc/auth.me').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
