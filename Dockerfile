FROM node:16.14 AS builder
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY . .
#run database migration
RUN npx prisma migrate deploy
#build for production
RUN npm run build


FROM node:16.14-alpine
WORKDIR /app
COPY --from=builder /app ./
#generate prisma client
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "run", "start:prod"]