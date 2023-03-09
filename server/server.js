const express = require('express')
const multer = require('multer')
const cors = require('cors')
const { generator } = require('./generate')

require('dotenv').config()

const app = express();
app.use(cors())

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.post('/api/generate', upload.single('file'), generator);

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
