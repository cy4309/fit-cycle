# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# ✅ 從根目錄 context 下的 frontend 拷貝
COPY ./frontend/package*.json ./
RUN npm install

COPY ./frontend .

# ✅ 環境變數注入
ARG VITE_APP_ENV
ENV VITE_APP_ENV=$VITE_APP_ENV

RUN npm run build

# Serve stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]