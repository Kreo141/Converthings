const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const ffmpeg = require('fluent-ffmpeg')
const { exec } = require('child_process')

const app = express()

const isDev = false

const libreofficeLocation = isDev ? "C:/Program Files/LibreOffice/program/" : ""
const sofficeCmd = isDev ? "soffice.com" : "soffice"
const magickCmd = isDev ? "magick" : "convert"
if(isDev){
    ffmpeg.setFfmpegPath('E:/DevEnv/Projects/MajorProjects/Basic-Tools/ffmpeg-2026-05-13-git-a327bc0561-essentials_build/bin/ffmpeg.exe')
}

app.use(cors())
app.use(express.json())

const uploadDir = './uploads/toConvert';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/toConvert')
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname)

        cb(null, uniqueName)
    }
})

const upload = multer({ storage });


//* Init Important Variables
const conversionProgress = {} 


//* Uploading Routes
app.post('/convert/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("File received:", req.file);

    res.json({
        message: "File received for conversion",
        filename: req.file.filename,
        originalName: req.file.originalname,
    });
})


//* Conversion Routes
const presets = {
    mp4: {
        videoCodec: 'libx264',
        audioCodec: 'aac',
        options: ['-movflags +faststart']
    },

    webm: {
        videoCodec: 'libvpx-vp9',
        audioCodec: 'libopus'
    },

    avi: {
        videoCodec: 'mpeg4',
        audioCodec: 'libmp3lame'
    },

    mkv: {
        videoCodec: 'libx264',
        audioCodec: 'aac'
    },

    defaultPreset: {
        videoCodec: 'libx264',
        audioCodec: 'aac',
        options: [
            '-crf 23',
            '-preset medium',
            '-pix_fmt yuv420p', 
            '-movflags +faststart'
        ]
    }
}

// TODO: Preserving video quality when converting
app.post('/convert/Video', (req, res) => {
    console.log('Video Conversion Request')

    const { fileID, originalFormat, toConvertTo } = req.body

    const preset = presets[toConvertTo] || presets.defaultPreset

    console.log(req.body)

    ffmpeg()
        .input(`uploads/toConvert/${fileID}`)
        .inputFormat(originalFormat)
        .output(`uploads/converted/${fileID}.${toConvertTo}`)
        .videoCodec(preset.videoCodec)
        .audioCodec(preset.audioCodec)
        .outputOptions(preset.options || [])
        .on('start', commandLine => {
            console.log('FFmpeg started:', commandLine)
        })
        .on('progress', progress => {
            console.log(progress)
            console.log(conversionProgress[fileID])
            conversionProgress[fileID] = progress.percent || 0
        })
        .on('end', () => {
            console.log('Conversion done')

            conversionProgress[fileID] = 100

            res.json({
                message: "File Converted!",
                convertedFileID: `${fileID}.${toConvertTo}`
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

// TODO: mp3 to amr corrupt
app.post('/convert/Audio', (req, res) => {
    console.log('Audio Conversion Request')

    const { fileID, originalFormat, toConvertTo } = req.body

    console.log(req.body)

    ffmpeg()
        .input(`uploads/toConvert/${fileID}`)
        .inputFormat(originalFormat)
        .output(`uploads/converted/${fileID}.${toConvertTo}`)
        .on('start', commandLine => {
            console.log('FFmpeg started:', commandLine)
        })
        .on('progress', progress => {
            console.log(progress)

            conversionProgress[fileID] = progress.percent || 0
        })
        .on('end', () => {
            console.log('Conversion done')
            console.log(conversionProgress[fileID])
            conversionProgress[fileID] = 100
            res.json({
                message: "File Converted!",
                convertedFileID: `${fileID}.${toConvertTo}`
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

app.post('/convert/Image', (req, res) => {
    console.log("Image Conversion Request")
    const { fileID, originalFormat, toConvertTo } = req.body
    console.log(fileID)
    exec(
        `${magickCmd} "./uploads/toConvert/${fileID}" "./uploads/converted/${fileID}.${toConvertTo}"`,
        (error) => {
            if(error){
                console.log(error)
                return res.status(500).json({
                    error: error.message
                })
            }

            conversionProgress[fileID] = 100
            res.json({
                message: "File Converted",
                convertedFileID: `${fileID}.${toConvertTo}`
            })
        }
    )
})

app.post('/convert/Document', (req, res) => {
    console.log("Document Conversion Request")
    const { fileID, toConvertTo} = req.body
    console.log(fileID)

    exec(
        `"${libreofficeLocation}${sofficeCmd}" --headless --convert-to ${toConvertTo} --outdir ./uploads/converted/ ./uploads/toConvert/${fileID} `,
        (error) => {
            if(error){
                console.log(error.message)
                return res.status(500).json({
                    message: error.message
                })
            }

            const slice = fileID.split('.')
            const newFileName = `${slice[0]}.${toConvertTo}`
            
            conversionProgress[fileID] = 100
            res.json({
                convertedFileID: newFileName
            })
        }
    )
})

//* Download Converted File
app.get('/convert/download/:filename', (req, res) => {
    const filePath = `./uploads/converted/${req.params.filename}`

    res.download(filePath, (err) => {
        if(err){
            console.log(err)
            res.status.send('File download failed')
        }   
    })
})


//* Polling
app.get('/convert/progress/:id', (req, res) => {
    const fileID = req.params.id

    res.json({
        progress: conversionProgress[fileID] ? conversionProgress[fileID] : -1
    })
})

app.use(express.static(path.join(__dirname, 'public')))

app.get((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})


const PORT = 5001

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on 0.0.0.0:${PORT}`)
})