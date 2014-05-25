var mongoose = require('mongoose');
var dbCondfig = require('./../config/dataBase');
var db = mongoose.connection;
var q = require('q');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("Connected To Db " + dbCondfig.name);
});
//mongoose.connect('mongodb://localhost/' + dbCondfig.name);
//mongoose.connect('mongodb://yoni.go@gmail.com:heroku_app25611764@ds053168.mongolab.com:53168/heroku_app25611764?keepAlive=1'); //, { keepAlive: 1 }?&connectTimeoutMS=300000
mongoose.connect('mongodb://yonigo:Boldie44mongohq@oceanic.mongohq.com:10032/app25611764');
var GenericModel = function(modelName) {

    this.modelName = modelName;
    this.instance = require('./../models/' + this.modelName);
    this.add = function(obj) {
        var deferred = q.defer();
        var model = new this.instance(obj);
        model.save(function (err, newObj) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            deferred.resolve(JSON.stringify(newObj));
        });
        return deferred.promise;
    };

    this.update = function(params) {
        var deferred = q.defer();
        var model = new this.instance(params.body);
        model.save(function (err, obj) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            deferred.resolve(JSON.stringify(obj));
        });
        return deferred.promise;
    };

    this.delete = function(id) {
        var deferred = q.defer();
        var model = this.instance;
        model.findByIdAndRemove(id, function (err, obj) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            obj.remove();
            deferred.resolve(JSON.stringify(obj));
        });
        return deferred.promise;
    }

    this.get = function(queryObj, populate) {
        var deferred = q.defer();
        var model = this.instance;
        var query = model.find(queryObj);
        if (populate)
            query.populate(populate);
        query.exec(function (err, obj) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            deferred.resolve(JSON.stringify(obj));
        });
        return deferred.promise;
    }
}

var User = function() {};
User.prototype = new GenericModel('user');
User.prototype.login = function(userObj) {
    var deferred = q.defer();
    var query = this.instance.findOne({username: userObj.username});
    //query.populate('projects');
    query.exec(function(err, user) {
        if (err) {
            deferred.reject(err);
        }
        else if (!user)
            deferred.reject("User Name Doesn't Exist");
        else if (user.authenticate(userObj.password)) {
            deferred.resolve(JSON.stringify(user.toJSON()));
        }
        else
            deferred.reject("Wrong Password");
    });
    return deferred.promise;
};

var Project = function() {};
Project.prototype = new GenericModel('project');

var Conversation = function() {};
Conversation.prototype = new GenericModel('conversation');

module.exports.user = new User();
module.exports.project = new Project();
module.exports.conversation = new Conversation();
module.exports.toObjectId = function(ids) {
    var arr = [];
    if (Array.isArray(ids)) {
        ids.forEach( function(id) {
            arr.push("ObjectId('" + id + "')");
        })
        return arr;
    }
    else
        return "ObjectId('" + ids + "')";

};
