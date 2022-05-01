// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

const a2 = require('./a2.json')

// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

//params for music table
var params = {
  AttributeDefinitions: [
    {
      AttributeName: 'title',
      AttributeType: 'S'
    },
    // {
    //   AttributeName: 'artist',
    //   AttributeType: 'S'
    // }
  ],
  KeySchema: [
    {
      AttributeName: 'title',
      KeyType: 'HASH'
    },
    // {
    //   AttributeName: 'artist',
    //   KeyType: 'HASH'
    // },
    // {
    //   AttributeName: 'title',
    //   KeyType: 'RANGE'
    // },
    
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  TableName: 'music',
  StreamSpecification: {
    StreamEnabled: false
  }
};

ddb.createTable(params, function(err, data) {
  if (err) {
  console.log("Error", err);
  } else {
  console.log("'music' Table Created", data);
  }
});



