# base image
FROM node:18-alpine as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=optional
COPY . .
RUN npm run build
EXPOSE 9000
CMD ["npm", "start"]

