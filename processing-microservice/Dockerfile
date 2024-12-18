FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

COPY libs ./libs
COPY processing-microservice ./processing-microservice

RUN npm install
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:dev:processing"] 