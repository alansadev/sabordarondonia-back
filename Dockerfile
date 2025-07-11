# --- Estágio 1: Build ---
# Usamos uma imagem base do Node.js para o estágio de construção.
# ATUALIZADO para a versão 20 (LTS mais recente).
FROM node:20 AS build

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /usr/src/app

# Copia o package.json e o package-lock.json para o contêiner.
COPY package*.json ./

# Instala as dependências da aplicação.
RUN npm install

# Copia todo o código-fonte da sua aplicação para o contêiner.
COPY . .

# Executa o comando de build do NestJS, que compila o TypeScript para JavaScript.
RUN npm run build

# --- Estágio 2: Produção ---
# Usamos uma imagem mais leve e padrão para o ambiente de produção para evitar problemas de compatibilidade.
# ATUALIZADO para a versão 20 (LTS mais recente).
FROM node:20-slim

# Define o diretório de trabalho.
WORKDIR /usr/src/app

# Copia apenas o package.json e o package-lock.json.
COPY package*.json ./

# Instala APENAS as dependências de produção, ignorando as de desenvolvimento.
RUN npm install --only=production

# Copia os artefatos de build (a pasta 'dist') e a pasta node_modules do estágio anterior.
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

# Expõe a porta que a sua aplicação NestJS usa.
EXPOSE 3000

# O comando para iniciar a aplicação quando o contêiner for executado.
CMD ["node", "dist/main"]