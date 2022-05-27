const express = require('express')
const router = express.Router()
const Utils = require('../utils')
const path = require('path')
const Db = require('../db')
const mysql = require('mysql');

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});


this.con = Db.getRds()


// GET - get all requests ------------------------------------------------------------
router.get('/', Utils.authenticateToken, (req, res) => {

  let con = mysql.createConnection({
    host: process.env.DBHOST,
    user: "admin",
    password: process.env.DBPWD
  });

  con.connect(function(err) {
    con.query(`SELECT * FROM main.friendRequests`, function(err, result, fields) {
        if (err) res.send(err);
        if (result) res.status(200).send(result);
    });
})
   
})

// GET - get single friend request -------------------------------------------------------
router.get('/:id', Utils.authenticateToken, (req, res) => {
  // if(req.user.id != req.params.id){
  //   return res.status(401).json({
  //     message: "Not authorised"
  //   })
  // }

  let con = mysql.createConnection({
    host: process.env.DBHOST,
    user: "admin",
    password: process.env.DBPWD
  });

  con.connect(function(err) { if (err) throw err; 
    con.query("SELECT * FROM main.friendRequests WHERE id = ?", [req.params.id],
      function (err, result) { 
        if (err) res.send(err);
        if(result) res.send(result); 
      });
    });

})



// PUT - update friend request ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
  // validate request
  if(!req.body) return res.status(400).send("Task content can't be empty")
  console.log(req.body)

  let con = mysql.createConnection({
    host: process.env.DBHOST,
    user: "admin",
    password: process.env.DBPWD
  });
  
  con.connect(function(err) {
    con.query('UPDATE main.friendRequests SET ? WHERE ?',  [req.body, req.params], function(err, rows) {
        if (err)
            console.log("%s ", err);

        res.status(200).send("Friend Request updated successfully");
    });
})

})


// DELETE - delete friend request --------------------------------------------------------
router.delete('/:id', Utils.authenticateToken, (req, res) => {

  let con = mysql.createConnection({
    host: process.env.DBHOST,
    user: "admin",
    password: process.env.DBPWD
  });

  con.connect(function(err) { if (err) throw err; 
    con.query("DELETE FROM main.friendRequests WHERE id = ?", [req.params.id],
      function (err, result) { 
        if (err) res.send(err);
        if(result) res.send(result); 
      });
    });


})


// POST - create new friend request --------------------------------------
router.post('/', (req, res) => {
  // validate request
  console.log(req.body)
  if(Object.keys(req.body).length === 0){   
    return res.status(400).send({message: "Request content can not be empty"})
  }

  if (req.body.fromUser && req.body.toUser) {

    let con = mysql.createConnection({
      host: process.env.DBHOST,
      user: "admin",
      password: process.env.DBPWD
    });
    // console.log('Request received');
    con.connect(function(err) {
      con.query(`INSERT INTO main.friendRequests (fromUser, toUser, fromAvatar, toAvatar, fromFirstName, fromLastName) VALUES ('${req.body.fromUser}', '${req.body.toUser}', '${req.body.fromAvatar}', '${req.body.toAvatar}', '${req.body.fromFirstName}', '${req.body.fromLastName}')`, function(err, result, fields) {
            if (err) res.send(err);
            if (result) res.status(201).send(result);
            if (fields) console.log(fields);
        });
    });
    
} else {
    console.log('Create friend request: Missing a parameter');
}
      

})

module.exports = router