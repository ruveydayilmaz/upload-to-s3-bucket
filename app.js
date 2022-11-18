require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { memoryStorage } = require("multer");
const storage = memoryStorage();
const upload = multer({ storage });
const JSZip = require("jszip");
const AWS = require("aws-sdk");

AWS.config.loadFromPath('./aws-config.json');
AWS.config.httpOptions.timeout = 300000; 
var s3 = new AWS.S3();

const {
  uploadAudio,
  uploadZip,
} = require("./aws");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const cors = require("cors");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: [
      "Content-Type",
      "Authorization",
      "ETag"
    ],
  })
);

app.post("/upload", upload.single("file"), async (req, res) => {
  const filename = "holdmeinyourarms.mp3";
  const file = req.file.buffer;

  const link = await uploadAudio(filename, file);
  res.send(link);
});

app.post("/upload-video", upload.single("file"), async (req, res) => {  // inspired by https://github.com/sevastos's multipart upload example
  
  var fileName = Date.now() + Math.random().toString(36).substring(7) + ".mp4";
  var fileKey = fileName;
  var buffer = req.file.buffer;
  
  var startTime = new Date();
  var partNum = 0;
  var partSize = 1024 * 1024 * 5;
  var numPartsLeft = Math.ceil(buffer.length / partSize);
  var maxUploadTries = 3;
  var multiPartParams = {
      Bucket: process.env.bucket,
      Key: fileKey,
      ContentType: 'video/mp4',
      ACL: 'public-read'
  };
  var multipartMap = {
      Parts: []
  };
  
  function completeMultipartUpload(s3, doneParams) {
    s3.completeMultipartUpload(doneParams, function(err, data) {
      if (err) {
        console.log("error while completing upload");
        console.log(err);
      } else {
        console.log('final data:', data);
      }

      res.send("done! your link is: " + data.Location);
    });
  }
  
  function uploadPart(s3, multipart, partParams, tryNum) {
    var tryNum = tryNum || 1;
    s3.uploadPart(partParams, function(multiErr, mData) {
      if (multiErr){
        console.log('upload part error:', multiErr);
        if (tryNum < maxUploadTries) {
          console.log('Retrying upload of part: #', partParams.PartNumber)
          uploadPart(s3, multipart, partParams, tryNum + 1);
        } else {
          console.log('Failed uploading part: #', partParams.PartNumber)
        }
        return;
      }
      console.log("--------------");
      console.log(mData.ETag)
      multipartMap.Parts[this.request.params.PartNumber - 1] = {
        ETag: mData.ETag,
        PartNumber: Number(this.request.params.PartNumber)
      };
      console.log("Completed part", this.request.params.PartNumber);
      console.log('mData', mData);
      if (--numPartsLeft > 0) return;
  
      var doneParams = {
        Bucket: process.env.bucket,
        Key: fileKey,
        MultipartUpload: multipartMap,
        UploadId: multipart.UploadId
      };
  
      console.log("Completing upload...");
      completeMultipartUpload(s3, doneParams);
      });
  }
  
  console.log("Creating multipart upload for:", fileKey);
  s3.createMultipartUpload(multiPartParams, function(mpErr, multipart){
    if (mpErr) { console.log('Error!', mpErr); return; }
    console.log("Got upload ID", multipart.UploadId);
  
    for (var rangeStart = 0; rangeStart < buffer.length; rangeStart += partSize) {
      partNum++;
      var end = Math.min(rangeStart + partSize, buffer.length),
          partParams = {
            Body: Uint8Array.prototype.slice.call(buffer, rangeStart, end),
            Bucket: process.env.bucket,
            Key: fileKey,
            PartNumber: String(partNum),
            UploadId: multipart.UploadId
          };
  
      console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart);
      uploadPart(s3, multipart, partParams);
    }
  });
});


app.post("/upload-zip", upload.single("file"), async (req, res) => {
  const zip = new JSZip();

  const filename = "video.zip";

  zip.file("video", req.file.buffer);

  const content = await zip.generateAsync({ type: "nodebuffer" });

  const link = await uploadZip(filename, content);
  res.send(link);
});

app.post("/unzip", upload.single("file"), async (req, res) => {
  // in progress
  var zip = new JSZip();
  zip.loadAsync(req.body.url.buffer).then(function (zip) {
    zip.file("hello.txt").async("string");
  });
});

app.listen(8000, () => {
  console.log("serving on 8000");
});
