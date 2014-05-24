'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProjectSchema = new Schema({
    name: {
        type: String
    },
    shortDesc: String,
    longDesc: String,
    images:[
        {
            url: String,
            index: Number,
            type: String
        }
    ],
    testimonies: [Schema.Types.ObjectId],
    company: Schema.Types.ObjectId,
    creationDate: Date,
    tags: [String],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

});

ProjectSchema.set('toJSON', {
    virtuals: true
});

ProjectSchema.options.toJSON.hide = '_id';

var validatePresenceOf = function(value) {
    return value && value.length;
};

ProjectSchema.pre('save', function(next) {
    console.log('PreSaving');
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.name) && !this.provider)
        next(new Error('Project Name Missing'));
    else
        next();
});

ProjectSchema.methods = {
};

module.exports = mongoose.model("Project",ProjectSchema);
