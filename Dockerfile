# --- BASE ---
# Criamos uma base leve para não repetir comandos
FROM node:22-alpine AS base
WORKDIR /app
# Habilita o Corepack para usar a versão do Yarn definida no package.json
RUN corepack enable

# --- ESTÁGIO 1: DEPENDÊNCIAS (Todas) ---
FROM base AS deps
# Copia apenas os arquivos de definição
COPY package.json yarn.lock ./
# Copia a pasta .yarn (cache e binários do yarn)
COPY .yarn ./.yarn

# O PULO DO GATO: Criamos o arquivo de config DENTRO do container
# Isso força o Yarn a criar uma pasta node_modules real, e não usar PnP
RUN echo "nodeLinker: node-modules" > .yarnrc.yml

# Instala TODAS as dependências (incluindo dev) para o build
RUN yarn install --immutable

# --- ESTÁGIO 2: BUILD ---
FROM base AS builder
# Copia a config do yarn criada/necessária
COPY --from=deps /app/.yarnrc.yml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY . .

# Roda o build do NestJS
RUN yarn build

# --- ESTÁGIO 3: DEPENDÊNCIAS DE PRODUÇÃO ---
FROM base AS prod-deps
COPY package.json yarn.lock ./
COPY .yarn ./.yarn

# Cria a config novamente neste estágio
RUN echo "nodeLinker: node-modules" > .yarnrc.yml

# Instala APENAS dependências de produção
# O 'yarn workspaces focus' é mais seguro no Berry, mas o install --production funciona com node-modules
RUN yarn install --immutable --production


  FROM base AS runner

  ENV NODE_ENV=production
  
  # Cria usuário de segurança
  RUN addgroup --system --gid 1001 nodejs
  RUN adduser --system --uid 1001 nestjs
  
  # Copia as dependências LIMPAS de produção
  COPY --from=prod-deps /app/node_modules ./node_modules
  COPY --from=prod-deps /app/package.json ./
  
  # Copia o código compilado (dist)
  COPY --from=builder /app/dist ./dist
  
  # --- A CORREÇÃO DO ERRO DE LOGS ---
  # 1. Cria a pasta de logs explicitamente
  # 2. Passa a posse (chown) de TODA a pasta /app para o usuário nestjs
  RUN mkdir -p logs
  RUN chown -R nestjs:nodejs /app
  
  # Define permissões e usuário
  USER nestjs
  
  EXPOSE 3000
  
  CMD ["node", "dist/main"]