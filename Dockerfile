# base image
FROM node:18-alpine3.15 AS base

WORKDIR /app

COPY package*.json ./
RUN npm install -g npm@latest
RUN npm ci --omit=dev --omit=optional

# build stage
FROM base AS build
COPY . .
RUN npm run build

# final stage
FROM base AS final
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations
EXPOSE 9000
CMD ["npm", "start"]