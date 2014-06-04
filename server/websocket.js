var restify = require('restify');
var socketio = require('socket.io');
var dl = require('./database/dataLayer');
var server = restify.createServer();
var io = socketio.listen(server);
var q = require('q');
var fs = require('fs');

server.use(restify.bodyParser());
server.use( restify.CORS( {origins: ['*']}) );
server.use( restify.fullResponse() );

server.pre(function(req, res, next) {
    res.setHeader('content-type', 'application/text');
    return next();
});

// USERS

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

// USERS END

//PROJECTS

server.post('/project/add', function create(req, res, next) {
    dl.project.add(req.body).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/project/update', function create(req, res, next) {
    dl.project.update(req.body).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
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

server.post('/project/get', function create(req, res, next) {
    dl.project.get(req.body,'testimonies').then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/project/image/add', function create(req, res, next) {
    var fileStr = req.body.data;
    var fileName = req.body.name;
    var projectId = req.body.id;
    var index = req.body.index;
    var type = req.body.type;
    var url = projectId + '/' + index + '_' + fileName;
    var img = {url: url, index: index, imgType: type};
    var imageBuffer = decodeBase64Image(fileStr);
    fs.mkdir(projectId,function(e){
        fs.writeFile(url, imageBuffer.data, function(err) {
            if(err) {
                res.send(500, err);
                return next();
            }
            else {
                console.log("The file was saved!");
                dl.project.update({id: projectId, body: {$push: {images: img}}}).then( function( response) {
                    res.send(200, response);
                    return next();
                }, function(error) {
                    res.send(500, error);
                    return next();
                });
            }
        });
    });

});

server.post('/project/image/remove', function create(req, res, next) {
    fs.unlink(req.body.imgUrl, function (err) {
        if (err) {
            res.send(500, err);
            return next();
        }
        else {
            dl.project.update({id: req.body.projectId, body: {$pull: {images: {url: req.body.imgUrl}}}}).then( function( response) {
                res.send(200, response);
                return next();
            }, function(error) {
                res.send(500, error);
                return next();
            });
        }

        console.log('successfully deleted image');
    });
});

//TODO NOT WORKING
server.post('/project/testimony/add', function create(req, res, next) {
    dl.project.delete(req.body.id).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

//TODO NOT WORKING
server.post('/project/testimony/remove', function create(req, res, next) {
    dl.project.delete(req.body.id).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

//TODO NOT WORKING
server.post('/project/testimony/update', function create(req, res, next) {
    dl.project.delete(req.body.id).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

//PROJECTS END

//TESTIMONIES

server.post('/testimony/get', function create(req, res, next) {
    dl.testimony.get(req.body).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/testimony/add', function create(req, res, next) {

    var fileStr = req.body.client.src;
    var fileName = req.body.client.fileName;
    var folder = 'testimonies';
    var url = folder + '/' + req.body.client.name + '_' + fileName;
    var imageBuffer = decodeBase64Image(fileStr);
    var projectId = req.body.projectId;
    fs.mkdir(folder,function(e){
        fs.writeFile(url, imageBuffer.data, function(err) {
            if(err) {
                res.send(500, err);
                return next();
            }
            else {
                console.log("The file was saved!");
                var newTestimony = {client: {name: req.body.client.name, title: req.body.client.title, imageUrl: url },text: req.body.text};
                dl.testimony.add(newTestimony).then( function(response) {
                    dl.project.update({id: projectId, body: {$push: {testimonies: JSON.parse(response).id}}}).then( function( resp) {
                        res.send(200, response);
                        return next();
                    }, function(error) {
                        res.send(500, error);
                        return next();
                    });
                    return next();
                }, function(error) {
                    res.send(500, error);
                    return next();
                });
            }
        });
    });
});

server.post('/testimony/update', function create(req, res, next) {
    dl.testimony.update(req.body).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/testimony/delete', function create(req, res, next) {
    fs.unlink(req.body.client.imageUrl, function (err) {
        dl.project.update({id: req.body.projectId, body: {$pull: {testimonies: {id: req.body.id}}}}).then( function( response) {
                dl.testimony.delete(req.body.id).then( function( resp) {
                    res.send(200, response);
                    return next();
                }, function(error) {
                    res.send(500, error);
                    return next();
                });
            }, function(error) {
                res.send(500, error);
                return next();
            });
        console.log('successfully deleted image');
    });
});

//TESTIMONIES END

//COMPANIES

server.post('/company/add', function create(req, res, next) {

    var fileStr = req.body.logo.src;
    var fileName = req.body.logo.name;
    var folder = 'companies';
    var url = folder + '/' + req.body.name + '_' + fileName;
    var imageBuffer = decodeBase64Image(fileStr);
    console.log("The file was saved!");
    fs.mkdir(folder,function(e){
        fs.writeFile(url, imageBuffer.data, function(err) {
            if(err) {
                res.send(500, err);
                return next();
            }
            else {
                console.log("The file was saved!");
                var newCompany = {name: req.body.name, description: req.body.description, logo: url};
                dl.company.add(newCompany).then( function( response) {
                    res.send(200, response);
                    return next();
                }, function(error) {
                    res.send(500, error);
                    return next();
                });
            }
        });
    });

});

//TODO NOT WORKING
server.post('/company/update', function create(req, res, next) {
    dl.company.update(req.body).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/company/get', function create(req, res, next) {
    dl.company.get({}).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

server.post('/company/delete', function create(req, res, next) {
    dl.company.delete(req.body.id).then( function( response) {
        res.send(200, response);
        return next();
    }, function(error) {
        res.send(500, error);
        return next();
    });
});

//COMPANIES END

//CHAT

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

server.post('/conversation/uploadFile', function create(req, res, next) {
    var fileStr = req.body.data;
    var fileName = req.body.name;
    fs.writeFile(fileName,fileStr, function(err) {
        if(err) {
            res.send(500, error);
            return next();
        } else {
            console.log("The file was saved!");
            res.send(200, fileName);
            return next();
        }
    });
});

server.post('/conversation/sendFile', function create(req, res, next) {
    var fileStr = req.body.data;
    var fileName = req.body.name;
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
    fs.writeFile(fileName,fileStr, function(err) {
        if(err) {
            res.send(500, error);
            return next();
        } else {
            console.log("The file was saved!");
            res.send(200, fileName);
            return next();
        }
    });
});

//CHAT END

//WEBSOCKET

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

//WEBSOCKET END

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

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

server.on('MethodNotAllowed', unknownMethodHandler);

server.listen(process.env.PORT || 8080, function () {
    console.log('socket.io server listening at %s', server.url);
});
