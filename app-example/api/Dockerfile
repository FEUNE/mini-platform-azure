# Base image Node.js légère et fixée sur une version précise
FROM node:24-alpine

# Créer un utilisateur non-root pour ne pas tourner en root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Dossier de travail dans le container
WORKDIR /app

# Copier les fichiers de dépendances en premier
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm install --omit=dev

# Copier le reste du code
COPY . .

# Donner les droits sur le dossier à l'utilisateur non-root
RUN chown -R appuser:appgroup /app

# Basculer sur l'utilisateur non-root
USER appuser

# Port exposé
EXPOSE 3000

# Démarrer l'app
CMD ["node", "index.js"]