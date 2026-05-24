FROM node:22

WORKDIR /app

RUN apt-get update  && apt-get install -y \
    ffmpeg \
    imagemagick \
    libreoffice \
    && apt-get clean

RUN mkdir uploads \
    mkdir uploads/converted

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD ["node", "index.js"]