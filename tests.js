// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// Set the region 
AWS.config.update({region: 'us-east-1'});

const dynamoDB = new AWS.DynamoDB.DocumentClient()

dynamoDB
  .scan({
    TableName: "login",
  })
  .promise()
  .then(data => console.log(data.Items))
  .catch(console.error)
  

