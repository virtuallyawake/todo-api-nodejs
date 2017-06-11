// Set the env variable to 'test' during testing
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../models/item');

// Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../bin/www');
let should = chai.should();

chai.use(chaiHttp);

describe('Item', function() {
    // Before each test we empty the database
    beforeEach(function(done) {
        Item.remove({}, function(err) { 
           done();         
        });     
    });

    // Test POSTing an item
    describe('Add an item', function() {
	it('should return a copy of the item, status code 201 and the location in the header.', function(done) {
	    var dueDate = new Date(Date.now());
	    var item = {
		"due_date" : dueDate,
		"description" : "a test item",
		"assigned_to" : "lucas"
	    };
	    var owner = "daniela";
	    chai.request(server)
		.post('/api/' + owner + '/items')
		.send(item)
		.end(function(err, res) {
		    var location = '/api/' + owner + '/items/' + res.body._id;
		    res.headers['location'].should.equal(location);
		    res.should.have.status(201);
		    res.body.should.be.a('object');
		    res.body['created_by'].should.equal('daniela');
		    res.body['due_date'].should.equal(dueDate.toISOString());
		    res.body['description'].should.equal('a test item');
		    res.body['assigned_to'].should.equal('lucas');
		    res.body['priority'].should.equal(0);
		    res.body['completed'].should.be.false;
		    done();
		});
	});
    });

    // Test GETting all items for a user
    describe('Get all items for a user', function() {
	it('should return an empty array when there are no items for a particular user', function(done) {
	    var owner = "daniela";
	    chai.request(server)
		.get('/api/' + owner + '/items')
		.end(function(err, res) {
		    res.should.have.status(200);
		    res.body.should.be.an('array');
		    res.body.should.have.lengthOf(0);
		    done();
		});
	});

	it('should return an array with 1 the item that we added for a particular user', function(done) {
	    var dueDate = new Date(Date.now());
	    var item = {
		"due_date" : dueDate,
		"description" : "a test item",
		"assigned_to" : "lucas"
	    };
	    var owner = "daniela";
	    chai.request(server)
		.post('/api/' + owner + '/items')  // First, we post an item
		.send(item)
		.end(function(err, res) {
		    chai.request(server)
			.get('/api/' + owner + '/items')  // Then, we get an array with 1 item
			.end(function(err, res) {
			    res.should.have.status(200);
			    res.body.should.be.an('array');
			    res.body.should.have.lengthOf(1);
			    res.body[0]['description'].should.equal('a test item'); // Just checking that it is the same item we posted
			    done();
			});
		});
	});
    });

    // Test removing a item
    describe('Removing an item given an id', function() {
	it('should remove and item and return the removed item.', function(done) {
	    var dueDate = new Date(Date.now());
	    var item = {
		"due_date" : dueDate,
		"description" : "a test item",
		"assigned_to" : "lucas"
	    };
	    var owner = "daniela";
	    chai.request(server)
		.post('/api/' + owner + '/items')  // First, we post an item
		.send(item)
		.end(function(err, res) {
		    var newItem = res.body;  // The item that was created
		    chai.request(server)
			.delete('/api/' + owner + '/items/' + newItem._id)  // Then, we delete the item we just created
			.end(function(err, res) {
			    res.should.have.status(200);
			    res.body.should.be.an('object');
			    res.body['_id'].should.equal(newItem._id);  // Check that the deleted item had the same id.
			    done();
			});
		});
	});

	it('should return an empty object if the item id we send does not exist.', function(done) {
	    var owner = "daniela";

	    // We send a valid id that is not found in the database.
	    chai.request(server)
		.delete('/api/' + owner + '/items/' + "592d80ca3cdb4d38b26cea28")
		.end(function(err, res) {
		    res.should.have.status(200);
		    res.body.should.be.an('object');
		    res.body.should.be.empty;
		    done();
		});
	});

	it('should return status code 500 and an error if the item id we send is some random string.', function(done) {
	    var owner = "daniela";

	    // We send a valid id that is not found in the database.
	    chai.request(server)
		.delete('/api/' + owner + '/items/' + "random-string-dhsadahduewtufeuhrf")
		.end(function(err, res) {
		    res.should.have.status(500);
		    res.body.should.be.an('object');
		    res.body['name'].should.equal('CastError');
		    done();
		});
	});
    });

    // Testing modifying an item
    describe('Modifying an existing item', function() {
	it('should update an item given its id and some new data', function(done) {
	    var dueDate = new Date(Date.now());
	    var owner = "daniela";
	    var item = new Item({
		"created_by" : owner,
		"due_date" : dueDate,
		"description" : "a test item",
		"assigned_to" : "lucas"
	    });
	    item.save(function(err, item) {
		var newData = {
		    "description" : "Updated item",
		    "assigned_to" : "daniela"
		};
		chai.request(server)
		    .patch('/api/' + owner + '/items/' + item._id)
		    .send(newData)
		    .end(function(err, res) {
			res.should.have.status(200);
			res.body.should.be.an('object');
			res.body['created_by'].should.equal('daniela');
			res.body['due_date'].should.equal(dueDate.toISOString());
			res.body['description'].should.equal('Updated item');
			res.body['assigned_to'].should.equal('daniela');
			res.body['_id'].should.equal(item._id.toString());  // Check that the modified item has the same id.
			done();
		    });
	    });
	});

	it('should respond with 404 if the item does not exist', function(done) {
	    var newData = {
		"description" : "Updated item",
		"assigned_to" : "daniela"
	    };
	    chai.request(server)
		.patch('/api/daniela/items/592d80ca3cdb4d38b26cea28')
		.send(newData)
		.end(function(err, res) {
		    res.should.have.status(404);
		    res.body.should.be.empty;
		    done();
		});
	});
    });

    // Test setting the priority for an item
    describe('Setting the priority for an existing item', function() {
	it('should set the priority of an item given its id and the priority value', function(done) {
	    var dueDate = new Date(Date.now());
	    var owner = "daniela";
	    var item = new Item({
		"created_by" : owner,
		"due_date" : dueDate,
		"description" : "a test item",
		"assigned_to" : "lucas",
		"priority" : 0
	    });
	    item.save(function(err, item) {
		var newPriority = 3;
		chai.request(server)
		    .patch('/api/' + owner + '/items/' + item._id + '/priority/' + newPriority)
		    .send()
		    .end(function(err, res) {
			res.should.have.status(204); // No content
			res.body.should.be.empty;

			// Verify that the priority was updated
			Item.findById(item._id, function(err, item) {
			    item.priority.should.equal(newPriority);
			    done();
			})
		    });
	    });
	});
    });

});
