require('dotenv').config() // this allows us to use dot throughout the whole pacakge

const express = require('express') //INITIAL SETUP
const app = express() //INITIAL SETUP

const path = require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const corsOptions = require('./config/corsOptions')
const cors = require('cors')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const { logEvents } = require('./middleware/logger')

console.log(process.env.NODE_ENV);

connectDB()

const PORT = process.env.PORT || 3500 //what port we are running on in dev and when we deploy //INITIAL SETUP

//The app. use() function is used to mount the specified middleware function(s) at the path which is being specified. It is mostly used to set up middleware for your application.

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json()) // this will allow app to parse and receive json data

app.use(cookieParser()) // this is third party middleware you're adding.

app.use('/', express.static(path.join(__dirname, 'public'))) //this is built-in middleware telling server where to find static files like CSS, images, blah blah. 

app.use('/', require('./routes/root')) //

//The app.all() function is used to route all types of HTTP requests. Like if we have POST, GET, PUT, DELETE, etc, requests made to any specific route. 

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json( { message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`)
    }) //INITIAL SETUP
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})