# ths Dockerfile is used by the service am using to host the backend
# it easy to understand we just import a linux shell with node
# and just copy are code
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 7860

CMD ["npm","run","start"]
