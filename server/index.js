const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')

const app = express()

ffmpeg().setFfmpegPath('E:/DevEnv/Projects/MajorProjects/Basic-Tools/ffmpeg-2026-05-13-git-a327bc0561-essentials_build/bin/ffmpeg.exe')

app.use(cors())
app.use(express.json())

const uploadDir = './uploads/toConvert';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

app.get('/', (req, res) => {
    res.json({ message: "Hello from express" })
})

//* Uploading Routes
app.post('/upload/Image', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File received:", req.file);

    res.json({
        message: "File received for conversion",
        filename: req.file.filename,
        originalName: req.file.originalname
    });
});

app.post('/upload/Video', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File received:", req.file);

    res.json({
        message: "File received for conversion",
        filename: req.file.filename,
        originalName: req.file.originalname
    });
});

app.get('/upload/Audio', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("File received:", req.file);

    res.json({
        message: "File received for conversion",
        filename: req.file.filename,
        originalName: req.file.originalname,
    });
});


//* Conversion Routes
app.post('/convert/Video', (req, res) => {
    console.log('Conversion Request')

    const { fileID, originalFormat, toConvertTo } = req.body

    console.log(req.body)

    ffmpeg()
        .input(`uploads/toConvert/${fileID}`)
        .inputFormat(originalFormat)
        .output(`uploads/converted/${fileID}.${toConvertTo}`)
        .on('start', commandLine => {
            console.log('FFmpeg started:', commandLine)
        })
        .on('end', () => {
            console.log('Conversion done')

            res.json({
                message: "File Converted!"
            })
        })
        .on('error', err => {
            console.log('File conversion error. FFmpeg error')

            res.status(500).json({
                error: err.message
            })
        })
        .run()
})

const PORT = 5001

app.listen(PORT, () => {
    console.log(`Server is running on 127.0.0.1:${PORT}`)
})