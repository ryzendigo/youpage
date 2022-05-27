// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

const sampleUsers = require('./sampleUsers.json')

// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const users = sampleUsers.users

console.log(users.length)

        for(const user in users){
          
          

              var params = {
                TableName: 'login',
                Item: {
                    
                    'firstName': users[user].firstName,
                    'lastName': users[user].lastName,
                    'phone': users[user].phone,
                    'email': users[user].email,
                    'location': users[user].location,
                    'password': users[user].password,
                    'bio': users[user].bio,
                    'avatar': users[user].avatar
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
    



