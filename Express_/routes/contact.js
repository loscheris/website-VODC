var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('contact', { title: 'Contact', "nav": "contact" });
});

module.exports = router;
