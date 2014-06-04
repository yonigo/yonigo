'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TestimonySchema = new Schema({
    text: String,
    client: {
        imageUrl: String,
        name: String,
        title: String
    }
});

TestimonySchema.set('toJSON', {
    virtuals: true
});

TestimonySchema.options.toJSON.hide = '_id';

var validatePresenceOf = function(value) {
    return value && value.length;
};


TestimonySchema.methods = {
};

module.exports = mongoose.model("Testimony",TestimonySchema);
