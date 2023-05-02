# base image
FROM node:18-alpine3.15 as base

# install tern for migrations
RUN apk add --no-cache curl && \
    curl -L https://github.com/jackc/tern/releases/download/v2.0.1/tern_2.0.1_linux_amd64.tar.gz > tern.tar.gz && \
    tar xzvf tern.tar.gz && \
    chmod +x tern && \
    mv tern /bin

WORKDIR /app

COPY package*.json ./
RUN npm install -g npm@latest
RUN npm ci --omit=dev --omit=optional

# build stage
FROM base as build
COPY . .
RUN npm run build

# final stage
FROM base as final
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations
EXPOSE 9000
CMD ["npm", "start"]