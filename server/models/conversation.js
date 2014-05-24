'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ConversationSchema = new Schema({
    name: {
        type: String
    },
    creationDate: Date,
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [
        {
            creationDate: Date,
            text: String,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            index: Number
        }
    ]
});

ConversationSchema.set('toJSON', {
    virtuals: true
});

var validatePresenceOf = function(value) {
    return value && value.length;
};

ConversationSchema.pre('save', function(next) {
    console.log('PreSaving');
    if (!this.isNew) return next();

    next();
    /*if (!validatePresenceOf(this.name) && !this.provider)
        next(new Error('Project Name Missing'));
    else
        next();*/
});

ConversationSchema.methods = {

    addUser : function(user) {
        this.users.push(user.id);
        return this.save();
    },

    addMsg: function(msg, user, cb) {
        console.log("Adding MSG");
        var m = {};
        m.text = msg.text;
        m.creationDate = new Date();
        m.index = this.messages.length + 1;
        m.user = user.id;
        this.messages.push(m);
        this.save( function(err, conv) {
            cb(err, conv, m.index);
        });
    }
};

module.exports = mongoose.model("Conversation",ConversationSchema);
