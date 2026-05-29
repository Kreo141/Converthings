# Converthings (still developing)

<b>A self-hosted web file converter</b>
##### 

## Specification (not final)
| File Type | Supported Formats                                                      |
| ----------------- | ------------------------------------------------------------------ |
| Video | `mp4, mov, avi, mkv, webm, flv, wmv, m4v, mpg, mpeg, 3gp`  |
| Image | `jpg, jpeg, png, gif, webp, svg, bmp, tif, tiff, ico, heic, avif` |
| Document | `pdf, doc, docx, txt, rtf, odt, pages` |
| Audio | `mp3, wav, ogg, flac, aac, m4a, wma, opus, amr` |
| Vector | `ico, svg` |

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
- Acess the website
<a href="asdasd">http://localhost:5001/</a>
<br>
or
<br>
<a href="asdasd">http://{server-local-ip-address}:5001/</a>

## Additional Tips
- Restart automatically except when you manually stop it
```docker
services:
  server:
    build: ./server
    ports:
      - "5001:5001"
    restart: unless-stopped
```

## Built With
- [React](https://react.dev/) - Frontend framework
- [Express](https://expressjs.com/) - Backend server framework
- [FFmpeg](https://ffmpeg.org/) - <b>Audio and Video</b> converter
- [ImageMagick](https://imagemagick.org/) - <b>Image</b> converter
- [LibreOffice](https://www.libreoffice.org/) - <b>Document</b> converter
