const fetch = require('node-fetch');

// Load the AWS SDK for Node.js


var AWS = require('aws-sdk');
const request = require('request-promise')

const a2 = require('./a2.json')

// Set the region 
AWS.config.update({region: 'us-east-1'});


var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: 'a3bucket-s3766659' }
});


const songs = a2.songs

console.log(songs.length)



class downloadImages{
  async downloadFiles(){
    for(const song in songs){


      var imageURL = songs[song].img_url
      var res = await fetch(imageURL)
      const blob = await res.buffer()

      const uploadedImage = await s3.upload({
        Bucket: 'a3bucket-s3766659',
        Key: imageURL,
        Body: blob,
        ACL:'public-read'
      }).promise()
        
    }
  }

  
}

const df = new downloadImages();

df.downloadFiles()

        
    



