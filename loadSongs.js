// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

const a2 = require('./a2.json')

// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const songs = a2.songs

console.log(songs.length)

        for(const song in songs){
           
          // console.log(songs[song].title)

              var params = {
                TableName: 'music',
                Item: {
                    // 'RANGEKEY': songs[song].title,
                    // 'HASHKEY': songs[song].artist,
                    'title': songs[song].title,
                    'artist': songs[song].artist,
                    'year': songs[song].year,
                    'web_url': songs[song].web_url,
                    'img_url': songs[song].img_url,
                    'image': "https://a2bucket.s3.amazonaws.com/" + songs[song].img_url
                }
            };

              
              docClient.put(params, function(err, data) {
                if (err) {
                  console.log("Error", err);
                } else {
                  console.log("Success", data);
                }
              });
        }
    



