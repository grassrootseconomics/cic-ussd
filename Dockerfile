# base image
FROM node:18-alpine3.15 as base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g npm@latest
RUN npm ci --omit=optional

# build stage
FROM base as build
COPY . .
RUN npm run build

# final stage
FROM base as final
COPY --from=build /usr/src/app/dist ./dist
EXPOSE $PORT
CMD ["npm", "start"]