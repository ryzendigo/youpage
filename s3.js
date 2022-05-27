require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')
const crypto = require ('crypto')
const { promisify } = require('util')

const randomBytes = promisify(crypto.randomBytes)

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACC_KEY_S3
const secretAccessKey = process.env.AWS_SEC_KEY_S3

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4'
})

async function generateUploadURL(){
  const rawBytes = await randomBytes(16)
  const imageName = rawBytes.toString('hex')

  const params = ({
    Bucket: bucketName,
    Key: imageName,
    Expires: 60
  })

  const uploadURL = await s3.getSignedUrlPromise('putObject', params)
  return uploadURL
}
exports.generateUploadURL = generateUploadURL

// uploads a file to s3
// async function uploadFile(file) {
//   // const fileStream = fs.createReadStream(file.path)

//   // const uploadParams = {
//   //   Bucket: bucketName,
//   //   Body: fileStream,
//   //   Key: file.filename
//   // }

//   // return s3.upload(uploadParams).promise()
  

//   const imagePath = file.path
//   const blob = fs.readFileSync(file)

//   const uploadedImage = await s3.upload({
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: file.originalFilename,
//     Body: blob,
//   }).promise()

//   return uploadedImage.Location
// }
// exports.uploadFile = uploadFile


// // downloads a file from s3
// function getFileStream(fileKey) {
//   const downloadParams = {
//     Key: fileKey,
//     Bucket: bucketName
//   }

//   return s3.getObject(downloadParams).createReadStream()
// }
// exports.getFileStream = getFileStream


//S3 Lambda Function 
module.exports.uploadFn = async (event) => {
  const rawBytes = await randomBytes(16)
  const imageName = rawBytes.toString('hex')
  const fileToUpload = {

  }
  try {
    const params = {
      Bucket: bucketName,
    Key: imageName,
    Expires: 60
    }

  } catch(e){
    console.log(e)
    console.log("Upload Error", e)
  }
}