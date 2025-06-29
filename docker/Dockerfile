FROM docker.io/node:20-alpine as deps

RUN apk add --no-cache libc6-compat git

# Setup pnpm environment
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@latest
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

WORKDIR /app

# Install deps
COPY package.json ./
RUN pnpm install


## builder
FROM docker.io/node:20-alpine as build

RUN apk add --no-cache libc6-compat git

# Setup pnpm environment
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY --from=deps /pnpm /pnpm
RUN npm i -g corepack@latest
RUN corepack enable
RUN corepack prepare pnpm@latest --activate


WORKDIR /app

COPY package.json ./
RUN mkdir node_modules
COPY --from=deps /app/node_modules/. node_modules/.

COPY . .

# set envs for Production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN rm -rf .env
RUN mv .env.build .env

# build
RUN pnpm build
RUN pnpm prune --prod


## dist
FROM docker.io/alpine:latest as dist
RUN apk add --update nodejs

WORKDIR /app

COPY package.json ./
COPY --from=build /app/node_modules ./node_modules/
COPY --from=build /app/.next ./.next/
COPY --from=build /app/.next/standalone/. .
COPY --from=build /app/public ./public/
COPY .env.dummy .env

# Expose port
EXPOSE 3000
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "wget", "-q0", "http://localhost:3000/health" ]

# run deployment macro
CMD ["node", "server.js"]
