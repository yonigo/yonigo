var restify = require('restify');
var socketio = require('socket.io');
var dl = require('./database/dataLayer');
var server = restify.createServer();
var io = socketio.listen(server);
var q = require('q');

server.use(restify.bodyParser());
server.use( restify.CORS( {origins: ['*']}) );
server.use( restify.fullResponse() );

server.pre(function(req, res, next) {
    res.setHeader('content-type', 'application/text');
    return next();
});

server.post('/user/add', function create(req, res, next) {
    dl.user.add(req.body).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/user/login', function create(req, res, next) {
    dl.user.login(req.body).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/project/add', function create(req, res, next) {
    dl.project.add(req.body).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/project/get', function create(req, res, next) {
    dl.project.get(req.body).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/conversation/add', function create(req, res, next) {
    var query = {
        "users": {
            $in: req.body.users
        }
    };

    dl.conversation.get(query,'users').then( function(response) {
        if (response.length > 0) {
            res.send(500, "Conversation Exists");
            return next();
        }
        else {
            dl.conversation.add(req.body).then( function(newConv) {
                res.send(200, response);
                return next();
            }, function(error) {
                res.send(500, error);
                return next();
            });
        }
    }, function(error) {
        res.send(500, error);
        return next();
    });


});

server.post('/conversation/get', function create(req, res, next) {
    var query = {
        "users": {
            $in:[req.body.userId]
        }
    };
    dl.conversation.get(query,'users').then( function(response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });

});

server.post('/conversation/addUser', function create(req, res, next) {
    dl.project.get(req.body).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/conversation/send', function create(req, res, next) {
    var query = dl.conversation.instance.findOne({'_id': req.body.conversationId}).populate('users');
    query.exec(function (err, conversation) {
        if (err) {
            res.send(500, error);
            return next();
        }
        else {
            conversation.addMsg(req.body.msg, req.body.user,function(err, conv, index) {
                if (err) {
                    res.send(500, error);
                    return next();
                }
                res.send(200, index);
                notifyMsg(conv);
                return next();
            });
        }
    });
});

server.post('/project/delete', function create(req, res, next) {
    dl.project.delete(req.body.id).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

var sockets = {};

io.set('authorization', function(req, callback) {

    if ( req.query.token === undefined || req.query.token.length === 0 )
    {
        return false;
    }

    if (req.query.token != 'ec210b70-e187-11e3-8b68-0800200c9a66')
        return false;

    return callback(null, true);

});

io.sockets.on('connection', function (socket) {

    function broadcastOnlineUsers() {
        var users = [];
        Object.keys(sockets).forEach( function(key, i) {
            var user = {id: key, username: sockets[key][0].user.username};
            users.push(user);
        });
        io.sockets.emit('onlineUsers', users);
    }

    socket.on('disconnect', function() {
        sockets[socket.user.id].splice(sockets[socket.user.id].indexOf(socket), 1);
        if (sockets[socket.user.id].length == 0 )
            delete sockets[socket.user.id];
        broadcastOnlineUsers();
    });

    socket.on('subscribe', function (user) {
        console.log("Subscribing " + JSON.stringify(user));
        socket.user = user;
        sockets[user.id] = sockets[user.id] || [];
        sockets[user.id].push(socket);
        socket.emit('subscribed');
        broadcastOnlineUsers();
    });

    socket.on('getOnlineUsers', function (data) {
        var users = [];
        Object.keys(sockets).forEach( function(key, i) {
            var user = {id: key, username: sockets[key][0].user.username};
            users.push(user);
        });
        socket.emit('onlineUsers', users);
    });

});

function unknownMethodHandler(req, res) {
    if (req.method.toLowerCase() === 'options') {
        var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'dataType'];

        if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
        res.header('Access-Control-Allow-Methods', res.methods.join(', '));
        res.header('Access-Control-Allow-Origin', req.headers.origin);

        return res.send(204);
    }
    else
        return res.send(new restify.MethodNotAllowedError());
}

function notifyMsg(conversation) {
    var users = conversation.get('users');
    console.log("Nofifying Users " + users);
    var msg = conversation.get('messages')[conversation.get('messages').length - 1];
    console.log("MSg: " + msg);
    users.forEach(function(user, i) {
        console.log("USER " + i);
        if (sockets[user.id]) {
            sockets[user.id].forEach( function(socket, j) {
                console.log("Socket " + j);
                socket.emit('newMsg', JSON.stringify({conversationId: conversation.id, msg: msg}));
            })
        }
        else
            console.log("No Open Sockets For User");
    });
}

server.on('MethodNotAllowed', unknownMethodHandler);

server.listen(8080, function () {
    console.log('socket.io server listening at %s', server.url);
});
