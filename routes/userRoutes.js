//All user routes comes here
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");


dotenv.config();
const {
    registerUser,
    updateUser,
    checkUser,
    login, 
    changePassword,
    all
} = require("../controllers/userController");

const router = require("express").Router();

router.post('/register', registerUser)
router.put('/user', updateUser)
router.get('/user', checkUser)
router.post('/login', login)
router.put('/password',changePassword)
router.get('/all', all);

module.exports = (app) => {
    app.use('/evento', router);
}
