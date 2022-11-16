const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.secret_access_key,
})

// upload a single audio file to s3
const uploadAudio = (filename, file) => {

    return new Promise((resolve, reject) => {
        const params = {
            Key: filename,
            Bucket: process.env.bucket,
            Body: file,
            ContentType: 'audio/mpeg',
            ACL: 'public-read'
        }

        s3.upload(params, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data.Location)
            }
        })
    })
}

// first zip the file, then upload it to s3
const uploadZip = (filename, file) => {

    return new Promise((resolve, reject) => {
        const params = {
            Key: filename,
            Bucket: process.env.bucket,
            Body: file,
            ContentType: 'application/zip',
            ACL: 'public-read'
        }

        s3.upload(params, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data.Location)
            }
        })
    })
}

module.exports = {
    uploadAudio,
    uploadZip
}

