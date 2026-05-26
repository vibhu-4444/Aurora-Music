FROM node:22-bookworm-slim AS base
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages
RUN npm install
COPY apps/api apps/api
COPY tsconfig.base.json tsconfig.base.json
RUN npm run build -w @aurora/api
EXPOSE 4000
CMD ["npm", "run", "start", "-w", "@aurora/api"]
