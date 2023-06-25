FROM node:18
ENV NODE_ENV=development
WORKDIR /app
COPY package.json .
COPY . .
RUN npm install --development
EXPOSE 3000

CMD ["node", "/app/server.js"]
