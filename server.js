// dependencies------------------------------
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 80
const fileUpload = require('express-fileupload')
const body = require("body-parser");
const https = require("https");










// express app setup -----------------------
const app = express()
app.use(express.static('public'))
// app.use(path.join(__dirname, '../build'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('*', cors())
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }
}))




// routes ---------------------------------

// auth
const authRouter = require('./routes/auth')
app.use('/auth', authRouter)

// user
const userRouter = require('./routes/user')
app.use('/user', userRouter)

// song
const songRouter = require('./routes/song')
app.use('/song', songRouter)



// run app listen on port --------------------
app.listen(port, () => {
  console.log("App running on port ", port)
})