# syntax=docker/dockerfile:1
#
# Imagem standalone do traccar-web: build do Vite + nginx servindo os estáticos.
# O nginx faz proxy de /api e /api/socket para o traccar-server, então o
# navegador enxerga tudo no mesmo domínio (sem CORS, cookie de sessão funciona).
#
# Variáveis de ambiente (runtime):
#   TRACCAR_API_URL    URL interna do traccar-server (ex.: http://traccar_traccar-server:8082)
#   APP_TITLE          substitui ${title} no index.html/manifest
#   APP_DESCRIPTION    substitui ${description}
#   APP_COLOR_PRIMARY  substitui ${colorPrimary}

# ---- Stage 1: build ----
FROM node:22 AS build
WORKDIR /src
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: runtime ----
FROM nginx:1.27-alpine
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1 \
    TRACCAR_API_URL="http://traccar-server:8082" \
    APP_TITLE="Localize-C" \
    APP_DESCRIPTION="Localize-C - Rastreamento de frota" \
    APP_COLOR_PRIMARY="#272727"

COPY --from=build /src/build /usr/share/nginx/html
# Guarda as versões com placeholders para o script de branding regenerar a cada start
RUN cp /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.tpl \
    && cp /usr/share/nginx/html/manifest.webmanifest /usr/share/nginx/html/manifest.webmanifest.tpl

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/40-traccar-branding.sh /docker-entrypoint.d/40-traccar-branding.sh
RUN chmod +x /docker-entrypoint.d/40-traccar-branding.sh

EXPOSE 80
