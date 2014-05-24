var restify = require('restify'),
    dl = require('./database/dataLayer');

var server = restify.createServer({
    //certificate: ...,
    //key: ...,
    name: 'Coupons'
});

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});

//Routes

server.post('/hello', function create(req, res, next) {
    res.setHeader('content-type', 'application/foo');
    res.send(201, Math.random().toString(36).substr(3, 8));
    return next();
});

server.get('/test', function create(req, res, next) {
    var result = dl.user.add(req);
    res.send(201, result);
    return next();
});

server.post('/user/add', function create(req, res, next) {
    //res.setHeader('content-type', 'application/text');
    debugger;
    dl.user.add(req);
    res.send(201, Math.random().toString(36).substr(3, 8));
    return next();
});