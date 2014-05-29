'use strict';
angular.module('serverConnection', [])
    .config(['$httpProvider', function($httpProvider) {
    	$httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
    }])
    .factory('serverConnection', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
        var connection = {

        	dataToUrl: function(data) {
        		var url='?';
        		for (var i = 0; i < data.length; i++) {
        			var obj = data[i];
	        		for(var key in obj)
	        			url = url + key + "=" + obj[key] + "&";
        		}
        		return url.substring(0, url.length-1);
        	},

            connectToSocket: function(user) {

                var deferred = $q.defer();
                connection.socket = io.connect('http://127.0.0.1:8080',{
                    query: $.param({token: 'ec210b70-e187-11e3-8b68-0800200c9a66'})
                });
                var socket = connection.socket;

                socket.on( 'connect', function(user) {
                    console.log('connected to socket');
                    socket.emit('subscribe', user);
                    deferred.resolve();
                });

                socket.on( 'disconnect', function(data) {
                    console.log('disconnect from socket');
                    $rootScope.$broadcast('socketBroadcast',{data:data, event: 'disconnect'});
                });

                socket.on( 'connect_failed', function(data) {
                    console.log('connection to socket failed');
                    deferred.reject();
                });

                socket.on( 'error', function(data) {
                    console.log('socket error');
                    $rootScope.$broadcast('socketBroadcast',{data:data, event: 'error'});
                });

                socket.on('response', function (data) {
                    $rootScope.$broadcast('socketBroadcast',{data:data, event: 'response'});
                });

                return deferred.promise;
            },

            login: function() {
                connection.socket.emit('login', { id: 'yoni' });
            },

            sendMsg: function() {
                connection.socket.emit('push', { id: 'yoni', msg:'Hello' });
            },

            contactUs: function() {
                connection.socket.emit('contactUs', {email: email, msg: msg, fullName: fullName})
            },

            sendHttp: function (action, data, url, successFunc, errorFunc) {
                var deferred = $q.defer();
                var successFunction = function (response) {
                    if (successFunc)
                        successFunc(response, deferred);
                    else {
                        deferred.resolve(response);
                    }
                };

                var errorFunction = function (error) {
                    if (errorFunc)
                        errorFunc(error, deferred);
                    else {
                        $rootScope.$broadcast('error',{msg: error});
                        deferred.reject(error);
                    }
                };

                $http({method: 'POST', url: url + action, data: JSON.stringify(data), headers:{dataType:"json"}})
                    .success(successFunction)
                    .error(errorFunction);

                return deferred.promise;
            },
        	
        	register: function(userData) {
                var data = {data: userData, countryCode: 'IL'};
                return this.sendHttp('CreatePrivateUser', data, connection.registerUrl);
        	}

        };

        return connection;
    } ]);