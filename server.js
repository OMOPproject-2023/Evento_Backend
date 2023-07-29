const express = require("express");
const { createServer } = require("http");
const app = express();
const routes = require("./routes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const jwt = require('jsonwebtoken');
const { verification } = require("./middleware/verification");

dotenv.config();
// Access the port Number
port = process.env.PORT || 5000;
console.log(port);

// Database url
const dataBaseString = process.env.MONGODB_URI ;
console.log(dataBaseString);


// JWT
app.use(bodyParser.urlencoded({ extended: false }));

//log to check the status of app
app.use(bodyParser.json())

app.get('/',(req,res,next)=>{
    res.json('Hello, Welcome to EVENTO !!!');
});
//log to check is the request verified [Correct API_KEY, Token, User]
app.use(verification);

app.listen(port, function () {
    console.log("App Started at port " + port)
});

//log to check mongodb connection and and start the actual routing in the app
mongoose.connect(dataBaseString).then(function () {
    console.log("Connected To MongoDB");
    routes(app);
});

