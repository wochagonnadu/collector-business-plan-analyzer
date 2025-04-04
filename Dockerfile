# ---- Стадия сборки ---- // Build Stage
# Используем официальный образ Node.js LTS (Alpine для меньшего размера) // Use an official Node.js LTS image (Alpine for smaller size)
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию для сборки приложения // Set the working directory for the app build
WORKDIR /app/collector-bp-app

# Копируем package.json и package-lock.json в рабочую директорию // Copy package.json and package-lock.json to the working directory
COPY collector-bp-app/package*.json ./

# Устанавливаем зависимости // Install dependencies
# Используем --frozen-lockfile для обеспечения воспроизводимости сборки // Use --frozen-lockfile for reproducible builds
RUN npm install --frozen-lockfile

# Копируем остальной код приложения в рабочую директорию // Copy the rest of the application code into the working directory
COPY collector-bp-app/ .

# Собираем приложение для production // Build the application for production
# Это выполнит 'tsc -b && vite build' согласно package.json // This will run 'tsc -b && vite build' as per package.json
RUN npm run build

# ---- Финальная стадия ---- // Final Stage
# Используем официальный образ Nginx (Alpine для меньшего размера) // Use an official Nginx image (Alpine for smaller size)
FROM nginx:stable-alpine

# Копируем собранные статические файлы из стадии сборки в директорию Nginx // Copy the built static files from the build stage to the Nginx directory
# Путь к собранным файлам теперь /app/collector-bp-app/dist // The path to the built files is now /app/collector-bp-app/dist
COPY --from=builder /app/collector-bp-app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию Nginx из корня контекста сборки // Copy the custom Nginx configuration from the build context root
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80, на котором Nginx будет слушать // Expose port 80, which Nginx will listen on
EXPOSE 80

# Запускаем Nginx в foreground режиме при старте контейнера // Start Nginx in the foreground when the container starts
CMD ["nginx", "-g", "daemon off;"]
