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
    })
});
