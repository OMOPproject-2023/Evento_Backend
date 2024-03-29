const User = require("../models/user");
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
dotenv.config();

//The user will be checked and if present the isUser will be true else a new user will be created
// @pravin Implimented Bcrypt password hashing model.
const registerUser = async (req, res) => {
    var { email, userName, password, securityQuestion, securityAnswer } = req.body;
    console.log(email);
    try {
        const user = await User.findOne({
            email: email
        });
        if (user) {
            return res.status(200).json({
                message: "User already exists",
                user: {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    totalEvents: user.totalEvents,
                    securityQuestion: user.securityQuestion,
                    securityAnswer: user.securityAnswer,
                    profilePhoto: user.profilePhoto,
                    userDescription: user.userDescription
                },
                isUser: true
            });
        } else {
            if (email &&
                userName &&
                password) {
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) {
                        res.status(500).json({ message: err.message });
                    } else {
                        User.create({
                            email: email,
                            userName: userName,
                            password: hash,
                            totalEvents: "0",
                            securityQuestion: securityQuestion,
                            securityAnswer: securityAnswer,
                            profilePhoto: "https://avatarfiles.alphacoders.com/206/thumb-206822.jpg",
                            userDescription: "ADD BIO",
                        })
                            .then((user) => {
                                jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '8640000s' }, (err, token) => {
                                    if (err) {
                                        return res.status(500).json({
                                            message: "Issue in token generation",
                                            err: err.message
                                        });
                                    }
                                    else {
                                        res.statusCode = 200;
                                        res.json({ message: "User Created Successfully", user: user, token: token });
                                    }
                                });
                            })
                    }
                })
            } else {
                return res.status(400).json({
                    message:
                        "Looks like you don't have an account! Please register to continue",
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};

//No need as login and register both wll return the  required data
// const getUser = async (req, res++++++++++++++++++++++++++++++) => {
//     const { email } = req.query;
//     try {
//         const user = await Users.findOne({
//             email: email
//         });
//         if (user) {
//             console.log(user);
//             res.status(200).json({
//                 message: "User Fetched",
//                 user: user,
//                 isUser: true
//             })
//         } else {
//             res.status(400).json({
//                 message: "User not found",
//                 isUser:false
//             });
//         }
//     } catch (err) {
//         res.status(500).json({
//             message: "Something went wrong",
//         });
//     }
// };

//The user information will be updated by providing email
const updateUser = async (req, res) => {
    const { email} = req.query;
    const requser = req.body
    User.findOne({ email: email })
        .then((user) => {
            if (user) {
                User.findOneAndUpdate({
                    _id: user._id
                }, requser).then((user) => {
                    res.statusCode = 200;
                    res.json({ message: "User Updated", user: user })
                }).catch((error) => { console.log(error) });
            } else {
                res.status(400).json({
                    message: "User not found",
                });
            }
        }).catch((err) => {
            res.status(500).json({ message: err.message });
        })
};

//The user will be checked 
const checkUser = async (req, res) => {
    const { authorization } = req.headers;
    const email = authorization.split(" ")[1];
    console.log(email);
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            res.status(200).json({
                message: "User Exist",
                user: user,
                isUser: true
            })
        } else {
            res.status(400).json({
                message: "User Not Found",
                isUser: false
            })
        }
    } catch (e) {
        res.status(500).json({
            message: "Something Went Wrong",
        })
    }

}

// userlogin
const login = async (req, res, next) => {
    const { email, password } = req.query;
    User.findOne({ email: email })
        .then((user) => {
            if (user) {
                console.log({ pass: password, userpass: user.password });
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result == true) {
                        // JWT Tokens
                        jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '8640000s' }, (err, token) => {
                            if (err) {
                                res.status(200).json({
                                    message: "Error in Creating token",
                                    error: err
                                })
                            } else {
                                res.statusCode = 200;
                                res.json({ message: "User logedIn Successfully", user: user, token: token });
                            }
                        });
                    } else {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ message: "Wrong Password", error: err });
                    }
                })

            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.json({ message: "User not found" });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: "User Not Found" });
        })
}


const changePassword = async (req, res) => {
    const { email } = req.query;
    const { securityQuestion, securityAnswer, newPassword } = req.body;
    try {
        const user = await User.findOne({ email: email })
        if (user.securityQuestion == securityQuestion && user.securityAnswer == securityAnswer) {
            bcrypt.hash(newPassword, 10, (err, hash) => {
                if (err) {
                    res.status(500).json({ message: err.message });
                } else {
                    User.findOneAndUpdate(user._id, {
                        $set: { password: hash }
                    })
                        .then((user) => {
                            res.status(200).json({
                                message: "Password Updated Succesfully",
                                password: hash
                            })
                        }).catch((e) => {
                            res.status(400).json({
                                message: "Unable to Update Password",
                            })
                        });
                }
            })
        }
        else {
            res.status(400).json({
                message: "Provide Valid Details",
            })
        }
    } catch (e) {
        res.status(400).json({
            message: "User Not Found",
        });
    }

}
// 
const all = async (req, res, next) => {

    User.find({})
        .then((users) => {
            res.status(200).json({ users: users });
        })
        .catch((err) => { res.json({ message: err.message }) });
}

module.exports = { registerUser, updateUser, checkUser, login, changePassword, all };