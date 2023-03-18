require("dotenv")
const User = require("../models/user");
const jwt = require("jsonwebtoken")

const verification = async (req, res, next) => {
    const { path } = req;
    const { token, api_key, authorization } = req.headers;
    //Check For Registration request [No Need of auuthorization and token]
    if (path == "/evento/register") {
        //Check for api key
        if (api_key === process.env.API_KEY) {
            next();
        } else {
            console.log("Invalid API key");
            res.status(403).send("Invalid api key");
        }
    } //Check For Login request [No need of token as user logging in]
    else if (path == "/evento/login") {
        //Check for api key
        if (api_key === process.env.API_KEY) {
            if (authorization) {
                const email = authorization.split(" ")[1];
                //Check is the user available for the given email if yes proceed next
                const user = await User.findOne({ email: email });
                if (user) {
                    next();
                } else {
                    console.log("User not found");
                    res.status(403).send("User not found");
                }
            } else {
                console.log("Please Provide Authorization");
                res.status(403).send("Please Provide Authorization");
            }

        } else {
            console.log("Invalid API key");
            res.status(403).send("Invalid api key");
        }
    }//For request other than Register/Login 
    else {
        //Check Api Key
        if (api_key == process.env.API_KEY) {
            //Check For Token
            if (token) {
                if (authorization) {
                    const email = authorization.split(" ")[1];
                    const user = await User.findOne({ email: email});
                    if (user) {
                        jwt.verify(token, process.env.JWT_SECRET, (err, auth) => {
                            if (err) { 
                                console.log(err);
                                res.send({ result: "Invalid Token", err: err.message });
                            } else {
                                next();
                            }
                        })
                    }
                    else {
                        console.log("User not found");
                        res.status(403).json({
                            message:"USer not found",
                            isUser:"false"
                        });
                    }
                } else {
                    console.log("Please Provide Authorization");
                    res.status(403).json({
                        message:"Please Provide Authorization",
                        isUser:"false"
                    });
                }

            } else {
                console.log("Token Not Provided");
                res.status(403).send("Token Not Provided");
            }
        } else {
            console.log("Invalid API key ");
            res.status(403).send("Invalid api key ");
        }
    }
};

module.exports = { verification };
