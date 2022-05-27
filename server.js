// dependencies------------------------------
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 8080
const fileUpload = require('express-fileupload')
const https = require("https");
const http = require("http");
const url = require('url')
const db = require('./db')
const { generateUploadURL } = require ('./s3')









// express app setup -----------------------
const app = express()
app.use(express.static('public'))
// app.use(path.join(__dirname, '../build'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('*', cors())
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }
}))

app.get('/s3Url', async (req, res) => {
  const url = await generateUploadURL()
  res.send({url})
})

// //frontend
// // Serve Dist folder
// app.use(express.static(__dirname + '/frontend/dist'));
// app.get('/', (req, res) => res.sendFile(__dirname + '/frontend/dist/index.html'));
// app.use('*', (req, res) => res.sendFile(__dirname + '/frontend/dist/index.html'));

// routes ---------------------------------

// auth
const authRouter = require('./routes/auth')
app.use('/auth', authRouter)

// user
const userRouter = require('./routes/user')
app.use('/user', userRouter)

// post
const postRouter = require('./routes/post')
app.use('/post', postRouter)

//friendRequest
const friendRequestRouter = require('./routes/friendRequest')
app.use('/friendRequest', friendRequestRouter)



//frontend
// Serve Dist folder
app.use(express.static(__dirname + '/frontend/dist'));
app.get('/', (req, res) => res.sendFile(__dirname + '/frontend/dist/index.html'));
app.get('/*', (req, res) => res.sendFile(__dirname + '/frontend/dist/index.html'));


// run app listen on port --------------------
app.listen(port, () => {
  console.log("App running on port ", port)
  
  db.init()
})