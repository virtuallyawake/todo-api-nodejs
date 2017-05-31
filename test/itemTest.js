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

    // Test GETting all items for a user
    describe('Get all items for a user', function() {
	it('should return an array of all the items for a particular user', function(done) {
	    var owner = "daniela";
	    chai.request(server)
		.get('/api/' + owner + '/items')
		.end(function(err, res) {
		    console.dir(res.body);
		    res.should.have.status(200);
		    res.body.should.be.an('array');
		    res.body.should.have.lengthOf(0);
		    done();
		});
	});
    });
});
