'use strict';
window.serverName = 'http://localhost'; // http://www.yonigo.mobi
window.port = ':8080';
angular.module('serverConnection', [])
    .config(['$httpProvider', function($httpProvider) {
    	$httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
    }])
    .factory('serverConnection', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
        var connection = {

            url: serverName + port + '/',

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
                connection.socket = io.connect(serverName + port,{
                    query: $.param({token: 'ec210b70-e187-11e3-8b68-0800200c9a66'})
                });
                var socket = connection.socket;

                socket.on( 'connect', function(data) {
                    console.log('connected to socket');
                    socket.emit('subscribe', user);
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

                socket.on('subscribed', function () {
                    console.log('subscribed to socket');
                    deferred.resolve();
                });

                socket.on('onlineUsers', function (users) {
                    $rootScope.$broadcast('onlineUsers',users);
                });

                socket.on('newMsg', function (msg) {
                    $rootScope.$broadcast('socketBroadcast',{data: msg, event: 'newMsg'});
                });

                return deferred.promise;
            },

            //USERS

            addUser: function(userData) {
                return this.sendHttp('add', userData, connection.url + 'user/');
            },

            login: function(userData) {
                return this.sendHttp('login', userData, connection.url + 'user/');
            },

            //PROJECTS

            addProject: function(projectData) {
                return this.sendHttp('add', projectData, connection.url + 'project/');
            },

            getProjects: function(userData) {
                return this.sendHttp('get', userData, connection.url + 'project/');
            },

            deleteProject: function(project) {
                return this.sendHttp('delete', {id: project.id}, connection.url + 'project/');
            },

            updateProject: function(obj) {
                return this.sendHttp('update', obj, connection.url + 'project/');
            },

            uploadProjectImg: function(project, img) {
                var obj = {data: img.src, name: img.name, id: project.id, index: img.index, type: img.type};
                return this.sendHttp('image/add', obj, connection.url + 'project/');
            },

            removeProjectImage: function(img, project) {
                return this.sendHttp('image/remove', {imgUrl: img.url, projectId: project.id }, connection.url + 'project/');
            },

            //TESTIMONIES

            addTestimony: function(testimony) {
                return this.sendHttp('add', testimony, connection.url + 'testimony/');
            },

            deleteTestimony: function(testimony) {
                return this.sendHttp('delete', testimony, connection.url + 'testimony/');
            },

            updateTestimony: function(obj) {
                return this.sendHttp('update', obj, connection.url + 'testimony/');
            },

            //COMPANIES

            addCompany: function(companyData) {
                return this.sendHttp('add', companyData, connection.url + 'company/');
            },

            getCompanies: function() {
                return this.sendHttp('get', {},connection.url + 'company/');
            },

            deleteCompany: function(company) {
                return this.sendHttp('delete', {id: company.id}, connection.url + 'company/');
            },

            updateCompany: function(obj) {
                return this.sendHttp('update', obj, connection.url + 'company/');
            },

            //CHATS

            getOnlineUsers: function() {
                connection.socket.emit('getOnlineUsers');
            },

            getConversations: function(userId) {
                return this.sendHttp('get', {userId: userId}, connection.url + 'conversation/');
            },

            startNewConversation: function(users) {
                return this.sendHttp('add', users, connection.url + 'conversation/');
            },

            sendMsg: function(conversation, user, msg) {
                return this.sendHttp('send', {conversationId: conversation.id, user: {id: user.id}, msg: msg}, connection.url + 'conversation/');
            },

            sendFile: function(conversation, user, file) {
                return this.sendHttp('uploadFile', file, connection.url + 'conversation/');
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
            }

        };

        return connection;
    } ]);