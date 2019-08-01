var express = require("express");
var router = express.Router();
const path = require('path');
const passport = require('passport');

require('../passport.config.js');

// JWT PROTECTED ROUTE
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'data', 'data.json'));
});

module.exports = router;
