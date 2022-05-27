const express = require('express')
const router = express.Router()
const Utils = require('../utils')
const path = require('path')
const Db = require('./../db')
const mysql = require('mysql');

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// this.con = mysql.createConnection({
//   host: process.env.DBHOST,
//   user: "admin",
//   password: process.env.DBPWD
// });
this.con = Db.getRds()

var mysql_pool  = mysql.createPool({
  connectionLimit : 100,
  host            : process.env.DBHOST,
  user            : 'admin',
  password        : process.env.DBPWD,
  database        : 'main'
});


// GET - get all posts ------------------------------------------------------------
router.get('/', Utils.authenticateToken, (req, res) => {

  // let con = mysql.createConnection({
  //   host: process.env.DBHOST,
  //   user: "admin",
  //   password: process.env.DBPWD
  // });

  mysql_pool.getConnection(function(err, connection) {
		if (err) {
			connection.release();
	  		console.log(' Error getting mysql_pool connection: ' + err);
	  		throw err;
	  	}

      connection.query(`SELECT * FROM main.posts ORDER BY createdAt DESC`, function(err, result, fields) {
        if (err) res.send(err);
        if (result) res.status(200).send(result);
        connection.release();
    });

//   con.connect(function(err) {
//     con.query(`SELECT * FROM main.posts`, function(err, result, fields) {
//         if (err) res.send(err);
//         if (result) res.status(200).send(result);
//     });
// })
  
})
})

// GET - get all posts from user ------------------------------------------------------------
router.get('/:userEmail', Utils.authenticateToken, (req, res) => {


  mysql_pool.getConnection(function(err, connection) {
		if (err) {
			connection.release();
	  		console.log(' Error getting mysql_pool connection: ' + err);
	  		throw err;
	  	}

      connection.query(`SELECT * FROM main.posts WHERE user = ? ORDER BY createdAt DESC`, [req.params.userEmail], function(err, result, fields) {
        if (err) res.send(err);
        if (result) res.status(200).send(result);
        connection.release();
    });

})
})

// GET - get single post -------------------------------------------------------
router.get('/:id', Utils.authenticateToken, (req, res) => {
  // if(req.user.id != req.params.id){
  //   return res.status(401).json({
  //     message: "Not authorised"
  //   })
  // }

  // let con = mysql.createConnection({
  //   host: process.env.DBHOST,
  //   user: "admin",
  //   password: process.env.DBPWD
  // });

  mysql_pool.getConnection(function(err, connection) {
		if (err) {
			connection.release();
	  		console.log(' Error getting mysql_pool connection: ' + err);
	  		throw err;
	  	}

      connection.query("SELECT * FROM main.posts WHERE id = ?", [req.params.id],
      function (err, result) { 
        if (err) res.send(err);
        if(result) res.send(result); 
      });
    });


  // con.connect(function(err) { if (err) throw err; 
  //   con.query("SELECT * FROM main.posts WHERE id = ?", [req.params.id],
  //     function (err, result) { 
  //       if (err) res.send(err);
  //       if(result) res.send(result); 
  //     });
  //   });

})



// PUT - update post ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
  // validate request
  if(!req.body) return res.status(400).send("Task content can't be empty")
  console.log(req.body)

  // let con = mysql.createConnection({
  //   host: process.env.DBHOST,
  //   user: "admin",
  //   password: process.env.DBPWD
  // });

  mysql_pool.getConnection(function(err, connection) {
		if (err) {
			connection.release();
	  		console.log(' Error getting mysql_pool connection: ' + err);
	  		throw err;
	  	}

      connection.query('UPDATE main.posts SET ? WHERE ?',  [req.body, req.params], function(err, rows) {
        if (err)
            console.log("%s ", err);

        res.status(200).send("Post updated successfully");
    });
    });
  
//   con.connect(function(err) {
//     con.query('UPDATE main.posts SET ? WHERE ?',  [req.body, req.params], function(err, rows) {
//         if (err)
//             console.log("%s ", err);

//         res.status(200).send("Post updated successfully");
//     });
// })

})


// DELETE - delete post --------------------------------------------------------
router.delete('/:id', Utils.authenticateToken, (req, res) => {

  // let con = mysql.createConnection({
  //   host: process.env.DBHOST,
  //   user: "admin",
  //   password: process.env.DBPWD
  // });

  mysql_pool.getConnection(function(err, connection) {
		if (err) {
			connection.release();
	  		console.log(' Error getting mysql_pool connection: ' + err);
	  		throw err;
	  	}

      connection.query("DELETE FROM main.posts WHERE id = ?", [req.params.id],
      function (err, result) { 
        if (err) res.send(err);
        if(result) res.send(result); 
      });
    });

  // con.connect(function(err) { if (err) throw err; 
  //   con.query("DELETE FROM main.posts WHERE id = ?", [req.params.id],
  //     function (err, result) { 
  //       if (err) res.send(err);
  //       if(result) res.send(result); 
  //     });
  //   });


})


// POST - create new post --------------------------------------
router.post('/', (req, res) => {
  // validate request
  if(Object.keys(req.body).length === 0){   
    return res.status(400).send({message: "Post content can not be empty"})
  }

  // if (req.body.visibility && req.body.message) {

    // let con = mysql.createConnection({
    //   host: process.env.DBHOST,
    //   user: "admin",
    //   password: process.env.DBPWD
    // });
    // console.log('Request received');

    mysql_pool.getConnection(function(err, connection) {
      if (err) {
        connection.release();
          console.log(' Error getting mysql_pool connection: ' + err);
          throw err;
        }
  
        if (req.body.image == undefined){
          req.body.image = ""
        }

        if(req.body.gif == undefined){
          req.body.gif = ""
        } else {
          console.log(req.body.gif);
        }

        

        connection.query(`INSERT INTO main.posts (user, visibility, message, image, gif, comments, likes) VALUES ('${req.body.user}', '${req.body.visibility}', '${req.body.message}', '${req.body.image}', '${req.body.gif}', '${'[]'}', '${'[]'}')`, function(err, result, fields) {
          if (err) console.log(err)
          if (err) res.send(err);
          
          // if (result) console.log(result)
          if (result) res.status(201).send(result);
          if (fields) console.log(fields);
      });
      });

    // con.connect(function(err) {
    //   con.query(`INSERT INTO main.posts (user, userAvatar, visibility, message, image, gif) VALUES ('${req.body.user}', '${req.body.userAvatar}', '${req.body.visibility}', '${req.body.message}', '${req.body.image}', '${req.body.gif}')`, function(err, result, fields) {
    //         if (err) res.send(err);
    //         if (result) res.status(201).send(result);
    //         if (fields) console.log(fields);
    //     });
    // });
    
// } else {
//     console.log('Create post: Missing a parameter');
// }
     

/* <sl-tooltip content="Use a GIF">
                              <!-- <sl-icon-button @click=${this.showGifDialog.bind(this)} name="images" label="Gifs"> -->
                              <sl-button @click=${() => { if(document.getElementById('gif-search-area').style.display === "none"){ document.getElementById('gif-search-area').style.display = "block" } else { document.getElementById('gif-search-area').style.display = "none" } }} name="images" label="Gifs">GIF</sl-button>
                          </sl-tooltip> */

})

module.exports = router