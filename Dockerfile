FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
RUN npm install -g serve

EXPOSE 5173

# Para producción y Render, usa puerto dinámico
CMD ["sh", "-c", "serve -s dist -l ${PORT:-5173}"]
