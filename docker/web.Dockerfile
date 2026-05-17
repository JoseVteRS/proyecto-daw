# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile --filter web...

FROM deps AS build
COPY apps/web apps/web
COPY packages/shared packages/shared
RUN pnpm --filter @proyecto-daw/shared build && pnpm --filter web build
RUN pnpm prune --prod

FROM base AS production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
COPY --from=build /app/apps/web/.output ./apps/web/.output
EXPOSE 3000
CMD ["node", "apps/web/.output/server/index.mjs"]
