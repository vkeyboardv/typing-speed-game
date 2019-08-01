const express = require("express");
const router = express.Router();
const path = require('path');
const users = require('../users');
const jwt = require('jsonwebtoken');

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

router.post('/', function (req, res) {
    const userFromReq = req.body;
    const userInJson = users.find(user => user.login === userFromReq.login);
    if (userInJson && userInJson.password === userFromReq.password) {
        const token = jwt.sign(userFromReq, 'jwtSecret');
        res.status(200).json({ auth: true, token });
    } else {
        res.status(401).json({ auth: false });
    }
});

module.exports = router;
