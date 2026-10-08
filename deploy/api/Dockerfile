FROM oven/bun:1.3.13-debian

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg poppler-utils libreoffice-writer libreoffice-calc libreoffice-impress \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/cli/package.json apps/cli/package.json
COPY apps/desktop/package.json apps/desktop/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/sdk/package.json packages/sdk/package.json
RUN bun install --frozen-lockfile --production --ignore-scripts
COPY packages/core/src packages/core/src
COPY apps/api/src apps/api/src
RUN mkdir /data && chown bun:bun /data
USER bun
ENV HOST=0.0.0.0 PORT=8787 CONVRT_DATA_DIR=/data
EXPOSE 8787
CMD ["bun", "apps/api/src/server.ts"]
