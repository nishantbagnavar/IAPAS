FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# VITE_API_URL is baked into the static build at compile time.
# docker-compose passes this as a build arg so the browser
# knows where the backend lives (always localhost:8000 on the host).
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]
