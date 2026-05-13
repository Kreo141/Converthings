const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')

const app = express()

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

app.post('/convert/Image', upload.single('file'), (req, res) => {
    // 1. Check if file exists
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // 2. Access the file via req.file
    console.log("File received:", req.file);

    res.json({
        message: "File received for conversion",
        filename: req.file.filename,
        originalName: req.file.originalname
    });
});

const PORT = 5001

app.listen(PORT, () => {
    console.log(`Server is running on 127.0.0.1:${PORT}`)
})