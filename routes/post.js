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

// GET - get all posts ------------------------------------------------------------
router.get('/', Utils.authenticateToken, (req, res) => {
    try{
        dynamoDB
          .scan({
            TableName: "posts",
          })
          .promise()
          .then(data => res.json(data.Items))
          .catch(console.error)
          
    }catch (err){
      console.log("error retreiving all posts.\n" ,err);
    }
})

// GET - get single post -------------------------------------------------------
router.get('/:id', Utils.authenticateToken, (req, res) => {
  // if(req.user.id != req.params.id){
  //   return res.status(401).json({
  //     message: "Not authorised"
  //   })
  // }

  dynamoDB
  .get({
    TableName: "posts",
    Key: {
      postId: req.params.id,
    },
    AttributesToGet: [
      'visibility',
      'user',
      'time',
      'message',
      'image',
      'comments',
      'gif'
   ]
  })
  .promise()
  .then(data => res.json({
    visibility: data.Item.visibility,
    user: data.Item.user,
    time: data.Item.time,
    message: data.Item.message,
    image: data.Item.image,
    comments: data.Item.comments,
    gif: data.Item.gif
  }))
  // .catch( res.status(500).json({
  //         message: 'Problem getting song',
  //       }))

})



// PUT - update post ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
  // validate request
  if(!req.body) return res.status(400).send("Task content can't be empty")
  
  dynamoDB
  .update({
    TableName: "posts",
    Key: {
      postId: req.params.id,
    },
    UpdateExpression: 'set visibility = :visibility, time = :time, message = :message, image = :image, comments = :comments, gif = :gif', 

    ExpressionAttributeValues: {
      ":visibility": req.body.visibility,
      ":time": req.body.time,
      ":message": req.body.message,
      ":image": req.body.image,
      ":comments": req.body.comments,
      ":gif": req.body.gif
    },
  })
  .promise()
  .then(data => res.json(data.Attributes))
  .catch( res.status(500).json({
          message: 'Problem updating post',
          error: err
        }))

})

// POST - create new post --------------------------------------
router.post('/', (req, res) => {
  // validate request
  if(Object.keys(req.body).length === 0){   
    return res.status(400).send({message: "Post content can not be empty"})
  }

  let id = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2)
  let date = Utils.getDate()
  let comments = []
   
          dynamoDB
      .put({
        Item: {
          postId: id,
          user: req.body.user,
          visibility: req.body.visibility,
          time: date,
          message: req.body.message,
          image: req.body.image,
          comments: comments,
          gif: req.body.gif
        },
      })
      .promise()
      .then(data => res.status(201).json(data.Attributes))
      .catch(console.error)       

})

module.exports = router