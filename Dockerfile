# Imagen base ligera de Node.js
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (solo producción)
RUN npm install 

# Copiar el resto del código
COPY . .

# Exponer puerto de la app
EXPOSE 5001

# Variable de entorno del puerto
ENV PORT=5001

# Comando de inicio ajustado
CMD ["node", "app.js"]
