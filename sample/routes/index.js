var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/demo/:id', function(req, res, next) {
  //res.send(req.params)
  //res.send(req.params)
});

module.exports = router;
