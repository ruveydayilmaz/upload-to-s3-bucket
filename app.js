require('dotenv').config()
const express = require('express');
const multer = require('multer');
const { memoryStorage } = require('multer')
const storage = memoryStorage()
const upload = multer({ storage })
const JSZip = require("jszip");
const fs = require("fs");

const {uploadAudio, uploadZip} = require('./aws')

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.post('/upload', upload.single('file'), async (req, res) => {
    const filename = 'holdmeinyourarms.mp3';
    const file = req.file.buffer

    const link = await uploadAudio(filename, bucketname, file)
    res.send(link)
})

app.post('/upload-zip', upload.single('file'), async (req, res) => {
    const zip = new JSZip();

    const filename = 'holdmeinyourarms.zip';

    zip.file("holdmeinyourarms.mp3", req.file.buffer);

    const content = await zip.generateAsync({ type: "nodebuffer" });

    const link = await uploadZip(filename, bucketname, content)
    res.send(link)
})

app.post('/unzip', upload.single('file'), async (req, res) => {  // in progress
    var zip = new JSZip();
    zip.loadAsync(req.body.url.buffer)
    .then(function(zip) {
        zip.file("hello.txt").async("string");
    });
})

app.listen(8000, () => {
    console.log('serving on 8000')
})
