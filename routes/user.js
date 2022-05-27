const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const path = require('path')
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const { uploadFile, getFileStream } = require('./../s3')

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});

// Create DynamoDB document client
const dynamoDB = new AWS.DynamoDB.DocumentClient()

// GET - get all users ------------------------------------------------------------
router.get('/', Utils.authenticateToken, (req, res) => {
    try{
        dynamoDB
          .scan({
            TableName: "login",
          })
          .promise()
          .then(data => res.json(data.Items))
          .catch(console.error)
          
    }catch (err){
      console.log("error retreiving all users.\n" ,err);
    }
})

// GET - get single user -------------------------------------------------------
router.get('/:email', Utils.authenticateToken, (req, res) => {
  // if(req.user.id != req.params.id){
  //   return res.status(401).json({
  //     message: "Not authorised"
  //   })
  // }

  dynamoDB
  .get({
    TableName: "login",
    Key: {
      email: req.params.email, 
    },
    AttributesToGet: [
      'email',
      'firstName',
      'lastName',
      'phone',
      'location',
      'password',
      'friendList',
      'bio',
      'avatar'
   ]
  })
  .promise()
  .then(data => res.json({
    email: data.Item.email,
    firstName: data.Item.firstName,
    lastName: data.Item.lastName,
    phone: data.Item.phone,
    location: data.Item.location,
    password: data.Item.password,
    friendList: data.Item.friendList,
    avatar: data.Item.avatar,
    bio: data.Item.bio
  }))
  

})




// PUT - add subscription --------------------------------------
router.put('/subscribe/:email/:title/:artist/:year/', Utils.authenticateToken, (req, res) => {  
  // validate check
  if(!req.params.title){
    console.log(req.body)
    console.log(req.body.title)
    return res.status(400).json({
      message: "No song specified" + req.params.title
    })
  }
//get song info
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
  .then(data => (
    dynamoDB.update({
    TableName: 'login',
    Key: { email: req.params.email },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'set #subscriptionList = list_append(if_not_exists(#subscriptionList, :empty_list), :song)',
    ExpressionAttributeNames: {
      '#subscriptionList': 'subscriptionList'
    },
    ExpressionAttributeValues: {
      ':song': [{
        title: data.Item.title,
        artist: data.Item.artist,
        year: data.Item.year,
        img_url: data.Item.img_url,
        web_url: data.Item.web_url,
        image: data.Item.image
        
      }],
      ':empty_list': []
    }
  }).promise()
  .then(data => {
    console.log(data.Attributes.subscriptionList)
    res.json(data.Attributes.subscriptionList) 
  })))

  console.log(req.body)
  console.log(req.params.title)
  // add songTitle to subscriptions field (array - push)
  
  

  // appendSong(req.body.email, {
  //   title: req.body.title,
  //   artist: req.body.artist,
  //   img_url: req.body.img_url,
  //   web_url: req.body.web_url,
  //   year: req.body.year
  // }).then(console.log)
})


// PUT - remove subscription --------------------------------------
router.put('/unsubscribe/', Utils.authenticateToken, (req, res) => {  
  // validate check
  // if(!req.body.newList){
  //   return res.status(400).json({
  //     message: "No newlist"
  //   })
  // }
  // add songTitle to subscriptions field (array - push)
  dynamoDB.update({
    TableName: 'login',
    Key: { email: req.body.email },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'REMOVE #subscriptionList',
    ExpressionAttributeNames: {
      '#subscriptionList': 'subscriptionList',
    },
  }).promise()
  .then(data => {
    console.log(data.Attributes.subscriptionList)
    dynamoDB.update({
      TableName: 'login',
      Key: { email: req.body.email },
      ReturnValues: 'ALL_NEW',
      UpdateExpression: 'SET #subscriptionList = :subscriptionList',
      ExpressionAttributeNames: {
        '#subscriptionList': 'subscriptionList'
      },
      ExpressionAttributeValues: {
        ':subscriptionList': req.body.newList
        
      },
      
    }).promise()
    .then(data => {
      console.log(data.Attributes.subscriptionList)
      res.json(data.Attributes.subscriptionList)
    })
  })
  
  

  // appendSong(req.body.email, {
  //   title: req.body.title,
  //   artist: req.body.artist,
  //   img_url: req.body.img_url,
  //   web_url: req.body.web_url,
  //   year: req.body.year
  // }).then(console.log)
})

//PUT addFriends ------------------------------------------------------
router.put('/addFriend/:user1/:user2', Utils.authenticateToken, (req, res) => {
    // validate request
  // if(!req.body) return res.status(400).send("Task content can't be empty")

  //update first user
  //Get current users details and add to second users friend list
  dynamoDB
  .get({
    TableName: "login",
    Key: {
      email: req.params.user1,
    },
    AttributesToGet: [
      'email',
      'avatar',
      'bio',
      'firstName',
      'lastName',
      'location',
      'phone'
   ]
  })
  .promise()
  .then(data => (
    dynamoDB.update({
    TableName: 'login',
    Key: { email: req.params.user2 },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'set #friendList = list_append(if_not_exists(#friendList, :empty_list), :user)',
    ExpressionAttributeNames: {
      '#friendList': 'friendList'
    },
    ExpressionAttributeValues: {
      ':user': [{
        email: data.Item.email,
        avatar: data.Item.avatar,
        bio: data.Item.bio,
        firstName: data.Item.firstName,
        lastName: data.Item.lastName,
        location: data.Item.location,
        phone: data.Item.phone,
        
      }],
      ':empty_list': []
    }
  }).promise()
  .then(data => {
    console.log(data.Attributes.friendList) 
  })))

  //now get second users details and add to current users friendlist then return friendslist
  dynamoDB
  .get({
    TableName: "login",
    Key: {
      email: req.params.user2,
    },
    AttributesToGet: [
      'email',
      'avatar',
      'bio',
      'firstName',
      'lastName',
      'location',
      'phone'
   ]
  })
  .promise()
  .then(data => (
    dynamoDB.update({
    TableName: 'login',
    Key: { email: req.params.user1 },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'set #friendList = list_append(if_not_exists(#friendList, :empty_list), :user)',
    ExpressionAttributeNames: {
      '#friendList': 'friendList'
    },
    ExpressionAttributeValues: {
      ':user': [{
        email: data.Item.email,
        avatar: data.Item.avatar,
        bio: data.Item.bio,
        firstName: data.Item.firstName,
        lastName: data.Item.lastName,
        location: data.Item.location,
        phone: data.Item.phone,
      }],
      ':empty_list': []
    }
  }).promise()
  .then(data => {
    console.log(data.Attributes.friendList) 
    res.json(data.Attributes.friendList) 
  })))

})


// PUT - update user ---------------------------------------------
router.put('/:email', Utils.authenticateToken, (req, res) => {
  // validate request
  if(!req.body) return res.status(400).send("Task content can't be empty")
  
  if(req.body.avatar){
    dynamoDB
      .update({
        TableName: "login",
        Key: {
          email: req.params.email,
        },
        UpdateExpression: 'set #firstName = :firstName, #lastName = :lastName, #phone = :phone, #location = :location, #bio = :bio, #avatar = :avatar', 
        ExpressionAttributeNames: {
          
          '#firstName': 'firstName',
          '#lastName': 'lastName',
          '#phone': 'phone',
          '#location': 'location',
          '#bio': 'bio',
          '#avatar': 'avatar'
        },
        ExpressionAttributeValues: {
          
          ":firstName": req.body.firstName,
          ":lastName": req.body.lastName,
          ":phone": req.body.phone,
          ":location": req.body.location,
          ":bio": req.body.bio,
          ":avatar": req.body.avatar,
        },
      })
      .promise()
      .then(
        data => console.log(data.Attributes)
        )

      //Get updated user and return user
      dynamoDB
        .get({
          TableName: "login",
          Key: {
            email: req.params.email, 
          },
          AttributesToGet: [
            'email',
            'firstName',
            'lastName',
            'phone',
            'location',
            'password',
            'friendList',
            'bio',
            'avatar'
         ]
        })
        .promise()
        .then(data => res.json({
          email: data.Item.email,
          firstName: data.Item.firstName,
          lastName: data.Item.lastName,
          phone: data.Item.phone,
          location: data.Item.location,
          password: data.Item.password,
          friendList: data.Item.friendList,
          avatar: data.Item.avatar,
          bio: data.Item.bio
        }))
  } else {
    dynamoDB
    .update({
      TableName: "login",
      Key: {
        email: req.params.email,
      },
      UpdateExpression: 'set #firstName = :firstName, #lastName = :lastName, #phone = :phone, #location = :location, #bio = :bio', 
      ExpressionAttributeNames: {
        
        '#firstName': 'firstName',
        '#lastName': 'lastName',
        '#phone': 'phone',
        '#location': 'location',
        '#bio': 'bio'
        
      },
      ExpressionAttributeValues: {
        
        ":firstName": req.body.firstName,
        ":lastName": req.body.lastName,
        ":phone": req.body.phone,
        ":location": req.body.location,
        ":bio": req.body.bio,
        
      },
    })
    .promise()
    .then(
      data => console.log(data.Attributes)
    )
    
    //Get updated user and return user
    dynamoDB
    .get({
      TableName: "login",
      Key: {
        email: req.params.email, 
      },
      AttributesToGet: [
        'email',
        'firstName',
        'lastName',
        'phone',
        'location',
        'password',
        'friendList',
        'bio',
        'avatar'
     ]
    })
    .promise()
    .then(data => res.json({
      email: data.Item.email,
      firstName: data.Item.firstName,
      lastName: data.Item.lastName,
      phone: data.Item.phone,
      location: data.Item.location,
      password: data.Item.password,
      friendList: data.Item.friendList,
      avatar: data.Item.avatar,
      bio: data.Item.bio
    }))
  }

      
  

})

// POST - create new user --------------------------------------
router.post('/', (req, res) => {
  // validate request
  if(Object.keys(req.body).length === 0){   
    return res.status(400).send({message: "User content can not be empty"})
  }

checkUser(req.body.email)

  function checkUser(email) {
    let exists = false
    try{
      dynamoDB
        .scan({
          TableName: "login",
        })
        .promise()
        .then(data => {
          // console.log(data.Items)
          let email2 = ""
          for(var user in data.Items){
            email2 = data.Items[user].email
            if(email2.match(email)){
              // console.log(data.Items[user].email)
              foundUser = data.Items[user]
              console.log("User Found: "+ foundUser.email)
              exists = true
              return res.status(400).json({message: 'Email is in use, use a different Email'})
                    
                      
                    } 
                  }
                  if (exists == false){
                    createUser()  
                  }
            
          
        })
        .catch(console.error)
        
  }catch (err){
    console.log("error retreiving all users.\n" ,err);
  }
  
  }

  async function createUser(){

    
    

    await dynamoDB
    .put({
      Item: {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: '0000000000',
        location: 'Unknown',
        bio: 'User has not entered a bio..',
        password: Utils.hashPassword(req.body.password),
        avatar: req.body.avatar,
        friendList: []
      },
      TableName: "login",
    })
    .promise()
    .then(data => res.status(201).json(data.Attributes))
    .catch(console.error)
    
  }


})



module.exports = router