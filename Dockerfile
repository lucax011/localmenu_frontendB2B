# Build do site estático
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# husky só faz sentido num clone com git
RUN npm ci --ignore-scripts
COPY . .
# O Expo lê a URL da API durante o build, não quando o contêiner roda
ARG EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
ENV EXPO_PUBLIC_API_BASE_URL=$EXPO_PUBLIC_API_BASE_URL
RUN npx expo export --platform web

# Servido pelo Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
