require('dotenv').config()
const jwt = require('jsonwebtoken')
let crypto = require('crypto');
const { v4: uuidv4 } = require('uuid')
const path = require('path')

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});
var dynamoDB = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const ddb = new AWS.DynamoDB({ region: 'us-east-1' });
const allUsers = null

class Utils {

    hashPassword(password){
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');
        return [salt, hash].join('$');
    }

    verifyHash(password, original){
        const originalHash = original.split('$')[1];
        const salt = original.split('$')[0];
        const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');
        return hash === originalHash;
    }

    generateAccessToken(user){
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d'})
    }

    authenticateToken(req, res, next){
        const authHeader = req.headers['authorization']        
        const token = authHeader && authHeader.split(' ')[1]
        if(token == null){
            return res.status(401).json({
                message: "Unauthorised"
            })
        } 
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) {
                return res.status(401).json({
                    message: "Unauthorised"
                })
            }
            req.user = user
            next()
        })
    }

    async uploadFile(file, uploadPath, callback){        
        // get file extension (.jpg, .png etc)
        const fileExt = file.name.split('.').pop()
        // create unique file name  
        const uniqueFilename = uuidv4() + '.' + fileExt
        // set upload path (where to store image on server)
        const uploadPathFull = path.join(uploadPath, uniqueFilename)
        // console.log(uploadPathFull)
        // move image to uploadPath
        file.mv(uploadPathFull, function(err) {
            if(err){
                console.log(err)
                return false
            }
            if(typeof callback == 'function'){
                callback(uniqueFilename)
            }
        })
    }

    async scanTable(tableName){
        const params = {
            TableName: tableName,
        };
    
        var scanResults = [];
        var items = [];
        do{
            items =  await docClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey  = items.LastEvaluatedKey;
        }while(typeof items.LastEvaluatedKey !== "undefined");
        
        return scanResults;
    }

   async userExists(email){
       let exists = false
    

    try{
      dynamoDB
        .scan({
          TableName: "login",
        })
        .promise()
        .then(data => this.setUsers(data.Items))
        .catch(console.error)
        
  }catch (err){
    console.log("error retreiving all users.\n" ,err);
  }
  
  console.log()
  for (var user in allUsers){
    if (allUsers[user].email === email){
        console.log(allUsers[user])
      exists = true
    }
  }

    return (exists)
    }

    async setUsers(data){
        console.log(data)
        allUsers = data
    }



    //function to get date and time
    getDate(){
        let date_time = new Date();

            // get current date
            // adjust 0 before single digit date
            let date = ("0" + date_time.getDate()).slice(-2);

            // get current month
            let month = ("0" + (date_time.getMonth() + 1)).slice(-2);

            // get current year
            let year = date_time.getFullYear();

            // get current hours
            let hours = date_time.getHours();

            // get current minutes
            let minutes = date_time.getMinutes();

            // get current seconds
            let seconds = date_time.getSeconds();

            return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
    }

       async IntTwoChars(i) {
        return (`0${i}`).slice(-2);
        }
}

module.exports = new Utils()