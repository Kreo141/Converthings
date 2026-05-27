# Basic-Tools (still developing)

##### A self-hosted website that offers useful digital Tools
##### 

## Features

| Features             | Descriptions                                                      |
| ----------------- | ------------------------------------------------------------------ |
| File Converter |  Convert files like `Image, Video, Audio,` and `Document` <br> <br> Image: `jpg, jpeg, png, gif, webp, svg, bmp, tif, tiff, ico, heic, avif` <br> Video: `mp4, mov, avi, mkv, webm, flv, wmv, m4v, mpg, mpeg, 3gp` <br> Audio: `mp3, wav, ogg, flac, aac, m4a, wma, opus, amr` <br> Document: `pdf, doc, docx, txt, rtf, odt, pages` |
| Media downloader | Feature not available |
| File Compressor | Feature not available |
| ... | Feature not available |

## Installation

<b>1. Clone this repository</b>
```bash
git clone https://github.com/Kreo141/Basic-Tools.git
```

<b>2. Go to the Basic-Tools directory</b>
```bash
cd Basic-Tools
```

<b>3. Build docker compose</b>
```bash
docker compose build
```
if you want it to start after building:
```bash
docker compose up --build
```

## How to use it
- Acess the frontend
<a href="asdasd">http://localhost:5173/</a>

## Additional Tips
- Restart automatically except when you manually stop it
```docker
services:
  server:
    build: ./server
    ports:
      - "5001:5001"
    restart: unless-stopped
  client:
    build: ./client
    ports:
     - "5173:5173"
    depends_on:
      - server
```

## Built With
- [React](https://react.dev/) - Frontend framework
- [Express](https://expressjs.com/) - Backend server framework
- [FFmpeg](https://ffmpeg.org/) - Media processing and file conversion (Audio and Videos)
