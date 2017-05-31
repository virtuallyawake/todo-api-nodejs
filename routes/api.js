var express = require('express');
var Item = require('../models/item');
var router = express.Router();

// GET all todo items for a user
router.get('/:owner/items', function(req, res, next) {
    var owner = req.params.owner;
    Item.find({}, function(err, items) {
	if (err)
	    res.status(500).send(err);

	res.json(items);
    });
});

module.exports = router;
