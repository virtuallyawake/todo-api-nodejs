var mongoose = require('mongoose');

var schema = mongoose.Schema({
    created_by : String,
    due_date : Date,
    description : String,
    priority : Number,
    completed : { type : Boolean, default : false }, 
    assigned_to : String
});

module.exports = mongoose.model('Item', schema);
