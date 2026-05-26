FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip pipx && rm -rf /var/lib/apt/lists/*
RUN pipx install yt-dlp
ENV PATH="/root/.local/bin:${PATH}"
WORKDIR /app
COPY package*.json ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages packages
RUN npm install
COPY apps/worker apps/worker
COPY tsconfig.base.json tsconfig.base.json
RUN npm run build -w @aurora/worker
CMD ["npm", "run", "start", "-w", "@aurora/worker"]
