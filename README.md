
# upload to s3 bucket 🆙  (in progress)
This repository contains functions for uploading various file types to an Amazon S3 bucket.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)  
##  Run Locally 🚀  

Clone the project  

~~~bash  
git clone https://github.com/ruveydayilmaz/upload-to-s3-bucket.git
~~~

Go to the project directory  

~~~bash  
cd upload-to-s3-bucket
~~~

Install dependencies  

~~~bash  
npm install
~~~

Start the server  

~~~bash  
npm start
~~~  

## API Reference

#### Upload audio file

~~~http
  POST /upload
~~~  

| Param     | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `file`    | `file`   | **Important**. Request bodys must be a form data |

#### Upload zip file

~~~http
  POST /upload-zip
~~~

| Param     | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `file`    | `file`   | **Important**. Request bodys must be a form data |

#### Upload video file with Multipart

~~~http
  POST /upload-video
~~~

| Param     | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `file`    | `file`   | **Important**. Request bodys must be a form data |  
 
## Environment Variables  
To run this project, you will need to add the following environment variables to your .env file  

`bucket`

And add a file named `aws-config.json` to the root. Then add the following variables to your json file

`accessKeyId` `secretAccessKey` `region`
 
## Features  
- Upload large videos to s3 bucket with multipart upload
- Zip file from request
- Upload audio, image and zip files to s3 bucket 