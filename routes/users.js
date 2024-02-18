var express = require('express');
var router = express.Router();

let data = []
/* GET users listing. */
router.get('/contacts', function(req, res, next) {
  res.render('contacts', { title: 'Contacts', contacts: data.length ? data : 'No data found'});
});

module.exports = router;
