FROM node:22-slim

WORKDIR /app

RUN apt-get update  && apt-get install -y \
    ffmpeg \
    imagemagick \
    libreoffice \
    potrace \
    && apt-get clean

    # potrace added for imagemagick

RUN mkdir -p uploads/converted

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD ["node", "index.js"]