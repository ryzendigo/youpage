//aws rds
const mysql = require('mysql');


//aws dynamodb
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


class Db {

    con = mysql.createConnection({
        host: process.env.DBHOST,
        user: "admin",
        password: process.env.DBPWD
    });

    getRds(){
        // this.con = mysql.createConnection({
        //     host: process.env.DBHOST,
        //     user: "admin",
        //     password: process.env.DBPWD
        // })
        return this.con
    }

    init(){

        //AWS RDS SETUP
        let con = mysql.createConnection({
            host: process.env.DBHOST,
            user: "admin",
            password: process.env.DBPWD
        });

        con.connect(function(err) {
            if (err) throw err;
        
            con.query('CREATE DATABASE IF NOT EXISTS main;');
            con.query('USE main;');
            con.query('CREATE TABLE IF NOT EXISTS friendRequests(id int NOT NULL AUTO_INCREMENT, fromUser varchar(30), toUser varchar(30), fromAvatar varchar(255), toAvatar varchar(255), fromFirstName varchar(30), fromLastName varchar(30), createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id, from));',function(error, result, fields) {
                // console.log(result);
            });
            con.query('CREATE TABLE IF NOT EXISTS posts(id int NOT NULL AUTO_INCREMENT, visibility varchar(30), user varchar(255), userAvatar varchar(255), message varchar(255), image varchar(255), comments JSON, gif varchar(255), createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, lastUpdated TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id, user));', function(error, result, fields) {
                // console.log(result);
            });
            // con.query('USE main;');
            // con.query('CREATE TABLE IF NOT EXISTS friendRequests(id int NOT NULL AUTO_INCREMENT, fromUser varchar(30), toUser varchar(30), fromAvatar varchar(255), toAvatar varchar(255), fromFirstName varchar(30), fromLastName varchar(30), createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id, from));',function(error, result, fields) {
            //     // console.log(result);
            // });
            // con.end();
        });



        
        //AWS DYNAMODB
        //params for user table
        var params = {
            AttributeDefinitions: [
            {
                AttributeName: 'email',
                AttributeType: 'S'
            }
            ],
            KeySchema: [
            {
                AttributeName: 'email',
                KeyType: 'HASH'
            }
            
            ],
            ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
            },
            TableName: 'login',
            StreamSpecification: {
            StreamEnabled: false
            }
        };
        
        ddb.createTable(params, function(err, data) {
            if (err) {
            console.log("'login' Table already exists");
            } else {
            console.log("'login' Table Created", data);
            }
        });
    }






}

module.exports = new Db()