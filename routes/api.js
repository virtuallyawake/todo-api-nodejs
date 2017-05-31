var express = require('express');
var Item = require('../models/item');
var router = express.Router();

// POST item
router.post('/:owner/items', function(req, res, next) {
    var owner = req.params.owner;
    var item = new Item({
	created_by : owner,
	due_date : req.body.due_date,
	description : req.body.description,
	priority : req.body.priority || 0,
	assigned_to : req.body.assigned_to
    });

    item.save(function(err, item) {
	if (err)
	    return res.status(500).send(err);

	res.location('/api/' + owner + '/items/' + item._id);
	res.status(201);
	res.json(item);
    });
});

module.exports = router;
