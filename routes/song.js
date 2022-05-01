const express = require('express')
const router = express.Router()
const Utils = require('../utils')
const path = require('path')

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create DynamoDB document client
const dynamoDB = new AWS.DynamoDB.DocumentClient()

// GET - get all songs ------------------------------------------------------------
router.get('/', Utils.authenticateToken, (req, res) => {
    try{
        dynamoDB
          .scan({
            TableName: "music",
          })
          .promise()
          .then(data => res.json(data.Items))
          .catch(console.error)
          
    }catch (err){
      console.log("error retreiving all songs.\n" ,err);
    }
})

// GET - get single song -------------------------------------------------------
router.get('/:title', Utils.authenticateToken, (req, res) => {
  // if(req.user.id != req.params.id){
  //   return res.status(401).json({
  //     message: "Not authorised"
  //   })
  // }

  dynamoDB
  .get({
    TableName: "music",
    Key: {
      title: req.params.title,
    },
    AttributesToGet: [
      'artist',
      'title',
      'img_url',
      'web_url',
      'year',
      'image'
   ]
  })
  .promise()
  .then(data => res.json({
    artist: data.Item.artist,
    title: data.Item.title,
    img_url: data.Item.img_url,
    web_url: data.Item.web_url,
    year: data.Item.year,
    image: data.Item.image
  }))
  // .catch( res.status(500).json({
  //         message: 'Problem getting song',
  //       }))

})



// PUT - update song ---------------------------------------------
router.put('/:title', Utils.authenticateToken, (req, res) => {
  // validate request
  if(!req.body) return res.status(400).send("Task content can't be empty")
  
  dynamoDB
  .update({
    TableName: "music",
    Key: {
      title: req.params.title,
    },
    UpdateExpression: 'set title = :title, artist = :artist, img_url = :img_url, web_url = :web_url, year = :year, image = :image', 

    ExpressionAttributeValues: {
      ":title": req.body.title,
      ":artist": req.body.artist,
      ":img_url": req.body.img_url,
      ":web_url": req.body.web_url,
      ":year": req.body.year,
      ":image": req.body.image
    },
  })
  .promise()
  .then(data => res.json(data.Attributes))
  .catch( res.status(500).json({
          message: 'Problem updating song',
          error: err
        }))

})

// POST - create new song --------------------------------------
router.post('/', (req, res) => {
  // validate request
  if(Object.keys(req.body).length === 0){   
    return res.status(400).send({message: "Song content can not be empty"})
  }



    if(!Utils.userExists(req.body.title)){
      return res.status(400).json({
        message: "Title is in use, use a different Title"
      })
    } else {
          dynamoDB
      .put({
        Item: {
          title: req.body.title,
          artist: req.body.artist,
          img_url: req.body.img_url,
          web_url: req.body.web_url,
          year: req.body.year,
          image: req.body.image
        },
      })
      .promise()
      .then(data => res.status(201).json(data.Attributes))
      .catch(console.error)
        }


})

module.exports = router