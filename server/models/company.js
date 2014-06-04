'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CompanySchema = new Schema({
    name: String,
    description: String,
    logo: String
});

CompanySchema.set('toJSON', {
    virtuals: true
});

CompanySchema.options.toJSON.hide = '_id';

var validatePresenceOf = function(value) {
    return value && value.length;
};

CompanySchema.methods = {
};

module.exports = mongoose.model("Company",CompanySchema);
