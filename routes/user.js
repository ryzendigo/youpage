const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const path = require('path')

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

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
      'user_name',
      'password',
      'subscriptionList'
   ]
  })
  .promise()
  .then(data => res.json({
    email: data.Item.email,
    userName: data.Item.user_name,
    password: data.Item.password,
    subscriptionList: data.Item.subscriptionList
  }))
  

})


// function appendSong (email, song) {
//   return dynamoDB.update({
//     TableName: 'login',
//     Key: { email: email },
//     ReturnValues: 'ALL_NEW',
//     UpdateExpression: 'set #subscriptionList = list_append(if_not_exists(#subscriptionList, :empty_list), :song)',
//     ExpressionAttributeNames: {
//       '#subscriptionList': 'subscriptionList'
//     },
//     ExpressionAttributeValues: {
//       ':song': [song],
//       ':empty_list': []
//     }
//   }).promise()
// }



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


// PUT - update user ---------------------------------------------
router.put('/:email', Utils.authenticateToken, (req, res) => {
  // validate request
  if(!req.body) return res.status(400).send("Task content can't be empty")
  
  dynamoDB
  .update({
    TableName: "login",
    Key: {
      email: req.params.email,
    },
    UpdateExpression: 'set #user_name = :user_name', 
    ExpressionAttributeNames: {
      
      '#user_name': 'user_name',
    },
    ExpressionAttributeValues: {
      
      ":user_name": req.body.userName
    },
  })
  .promise()
  .then(data => res.json(data.Attributes))
  

  // async function updateUser(){ 

  //   if(!Utils.docExists('users', req.params.id)){
  //     res.status(500).json({
  //       message: 'Problem updating user',
  //       error: err
  //     })
  //   } else {

  //     const user = await db.collection('users').doc(req.params.id).get()
  //     if(user.data().password != req.body.oldPassword){
  //       return res.status(400).send("The old password is incorrect!")
  //     }

  //     // let avatarFilename = null

  //           // if avatar image exists, upload!
  //       if(req.files && req.files.avatar){

  //         Images.sendUploadToGCS(req.files.avatar)

  //         db.collection('users').doc(req.params.id).set({
  //           id: req.body.id,
  //           userName: req.body.userName,
  //           avatar: Images.getPublicUrl(req.files.avatar),   
  //           password: req.body.password   
  //       }, {merge: true})
  //         // // upload avater image then update user
  //         // let uploadPath = path.join(__dirname, '..', 'public', 'images')
  //         // Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
  //         //   avatarFilename = uniqueFilename
  //         //   // update user with all fields including avatar
  //         //   db.collection('users').doc(req.body.id).set({
  //         //     id: req.body.id,
  //         //     userName: req.body.userName,
  //         //     avatar: avatarFilename,
                      
  //         //   }, {merge: true})
  //         // })
  //       }else{
  //         // update user without avatar
  //         db.collection('users').doc(req.body.id).set({
  //             id: req.body.id,
  //             userName: req.body.userName,
  //             password: req.body.password      
  //         }, {merge: true})
  //       }

  //       const updatedUser = await db.collection('users').doc(req.params.id).get()
  //       res.json(updatedUser.data())

  //   }
  // }
  
  // updateUser()
 

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
        user_name: req.body.userName,
        password: Utils.hashPassword(req.body.password),
        subscriptionList: []
      },
      TableName: "login",
    })
    .promise()
    .then(data => res.status(201).json(data.Attributes))
    .catch(console.error)
  }

//   const params = {
//     TableName: 'login',
//     Key:
//     {
//         email: req.body.email
//     },
//     AttributesToGet: [
//        'email',
//        'user_name',
//        'password'
//     ]
// }

//     if(!Utils.userExists(req.body.email)){
//       return res.status(400).json({
//         message: "Email is in use, use a different Email"
//       })
//     } else {
//           dynamoDB
//       .put({
//         Item: {
//           email: req.body.email,
//           user_name: req.body.userName,
//           password: Utils.hashPassword(req.body.password),
//           subscriptionList: ['test song', 'test song2']
//         },
//         TableName: "login",
//       })
//       .promise()
//       .then(data => res.status(201).json(data.Attributes))
//       .catch(console.error)
//         }


})

module.exports = router