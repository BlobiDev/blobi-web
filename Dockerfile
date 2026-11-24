# Build
FROM node:22.23.5-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS builder

WORKDIR /app

# pnpm version comes from "packageManager" in package.json
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Waitlist form settings (see README). Empty values build the form disabled.
ARG PUBLIC_WAITLIST_ENDPOINT=""
ARG PUBLIC_WAITLIST_LIST_EN=""
ARG PUBLIC_WAITLIST_LIST_ES=""
ENV PUBLIC_WAITLIST_ENDPOINT=$PUBLIC_WAITLIST_ENDPOINT \
    PUBLIC_WAITLIST_LIST_EN=$PUBLIC_WAITLIST_LIST_EN \
    PUBLIC_WAITLIST_LIST_ES=$PUBLIC_WAITLIST_LIST_ES

# Invitation API origin (see README). Empty builds the invitation pages without any request.
ARG PUBLIC_INVITES_API=""
ENV PUBLIC_INVITES_API=$PUBLIC_INVITES_API

RUN pnpm test \
    && pnpm check \
    && pnpm build

# Production
FROM nginxinc/nginx-unprivileged:1.30.6-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

# The pinned base lags behind Alpine's security fixes: apply them at build time (needs network; the resulting
# image is therefore identified by its digest, not reproducible from this file alone). Switch to a newer
# pinned base as soon as one scans clean, and drop this step.
USER root
# The unused nginx modules (geoip, image-filter, njs, xslt) are removed: a static site needs none of them and
# they pin nginx to the base's version, which blocks the fixed 1.30.7 package from the Alpine repository.
RUN apk del --no-cache nginx-module-geoip nginx-module-image-filter nginx-module-njs nginx-module-xslt \
    && apk upgrade --no-cache --available \
    && apk add --no-cache --upgrade nginx \
    && rm -f /etc/nginx/nginx.conf.apk-new
USER nginx

COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

