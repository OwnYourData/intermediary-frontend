FROM node:20-alpine

RUN apk add --no-cache libc6-compat git

# Setup pnpm environment
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

WORKDIR /app

# Install deps
COPY package.json ./
RUN pnpm install

COPY . .

# set envs for Production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN cp .env.dummy .env

# generate Prisma client
RUN pnpm exec prisma generate

# build
RUN pnpm build

RUN cp -rf /app/.next/standalone/. /app

# Expose port
EXPOSE 3000
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "wget", "-q0", "http://localhost:3000/health" ]

# run deployment macro
CMD ["pnpm", "deployment"]
