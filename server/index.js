const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors)
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ message: "Hello from express" })
})


// Start server
const PORT = 5000

app.listen(PORT, () => {
    console.log(`Server is running on 172.0.0.1:${PORT}`)
})