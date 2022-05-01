require('dotenv').config()
const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const jwt = require('jsonwebtoken')

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create DynamoDB document client
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const ddb = new AWS.DynamoDB({ region: 'us-east-1' });
let foundUser = null;




// GET /signIn ---------------------------------------
router.post('/signin', (req, res) => {
  // 1. check if email and passwore are empty
  if( !req.body.email || !req.body.password ){     
    return res.status(400).json({message: "Please provide email and password"})
  }
  // 2. continue to check credentials
  // find the user in the database


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
        for(var user in data.Items){
          if(data.Items[user].email === email){
            // console.log(data.Items[user].email)
            foundUser = data.Items[user]
            console.log("Found User: "+ foundUser.email)
            verifyUser(foundUser)
            exists = true
          } 
        }
        if (exists == false){
          return res.status(400).json({message: 'No account found - Email Invalid'})
        }
          
        
      })
      .catch(console.error)
      
}catch (err){
  console.log("error retreiving all users.\n" ,err);
}

}


        
//now verify user if one exists
        async function verifyUser(user){
          // console.log("user alone: " + user)
          // console.log("stringified: " + JSON.stringify(user))
          // console.log("user.password: " + user.password)
          // console.log("req.body.password: " + req.body.password)
          if( Utils.verifyHash(req.body.password, user.password) ){
            // credentials match - create JWT token
            let payload = {
              email: user.email          
            }
            let accessToken = Utils.generateAccessToken(payload)        
            // strip the password from our user object        
            user.password = undefined

            // send back response
            return res.json({
              accessToken: accessToken,
              email: user.email,
              userName: user.user_name,
              subscriptionList: user.subscriptionList
            })
        }else{
            // Password didn't match!
            return res.status(400).json({
              message: "Password is invalid"
            })        
        }
        }

})


// GET /validate --------------------------------------
router.get('/validate', (req, res) => {   
  // get token
  let token = req.headers['authorization'].split(' ')[1];
  // validate token using jwt
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
    if(err){
      console.log(err)
      return res.status(401).json({
        message: "Unauthorised"
      })
    }

    if(req.body.email == undefined){
      return res.status(401).json({
        message: "Unauthorised"
      })
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
            for(var user in data.Items){
              if(data.Items[user].email === email){
                // console.log(data.Items[user].email)
                foundUser = data.Items[user]
                console.log("Found User: "+ foundUser.email)
                validateUser(foundUser)
                exists = true
              } 
            }
            if (exists == false){
              return res.status(400).json({message: 'No account found'})
            }
              
            
          })
          .catch(console.error)
          
    }catch (err){
      console.log("error retreiving all users.\n" ,err);
    }
    
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
  //       return res.status(400).json({message: 'No account found'})
  //     } else{
  //       dynamoDB
  //         .get(params)
  //         .promise()
  //         .then(data => validateUser(data.Item))
  //         .catch( console.error)
  //     }

      async function validateUser(user){
        // user exists, now check password
        if( Utils.verifyHash(req.body.password, user.password) ){
          // credentials match - create JWT token
          let payload = {
            email: user.email          
          }
          let accessToken = Utils.generateAccessToken(payload)        
          // strip the password from our user object        
          user.password = undefined
          // send back response
          return res.json({
            accessToken: accessToken,
            user: user.Item
          })
        }else{
              // remove password field
              user.password = undefined
          res.json({
            user: user
          })     
        }
      }
   
  })

})

// class Auth{

//   //get user method
//   async function getUser(email){

//     const params = {
//       TableName: 'login',
//       Key:
//       {
//           email: email
//       },
//       AttributesToGet: [
//          'email',
//          'user_name',
//          'password',
//          'subscriptionList'
//       ]
//   }
//     var exists = true
//     console.log("exists " + exists)
//     let result = await docClient.get(params).promise().catch(console.error)  

//     return result.Item
    
//   }
// }

  
module.exports = router