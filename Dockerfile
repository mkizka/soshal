FROM node:18-slim
WORKDIR /code
RUN npm i -g npm pnpm
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY patches ./patches
RUN pnpm i
COPY . . 
RUN mv .env.example .env &&\
  SKIP_ENV_VALIDATION=true pnpm build &&\
  rm .env
EXPOSE 3000
CMD pnpm prisma migrate deploy && pnpm start
