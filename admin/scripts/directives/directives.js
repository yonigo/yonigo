angular.module('directives', ['localization'])

.directive('blur', function () {
    return function (scope, elem, attrs) {
        elem.bind('blur', function () {
            scope.$apply(attrs.blur);
        });
    };
})
.directive('inputFix', function() {
    return function(scope, elem, attrs) {
        elem.bind('blur', function () {
            window.scrollTo(0, 0);
        });
    };
})
.directive('map', function () {
    'use strict';
    return {
        restrict: 'A',
        template: '<div class="popup-overlayed">'
            + 	'<div class="sprite close-btn close-map-btn" ng-click="onMapClosed()"></div>'
            + 	'<div class="map-canvas"></div>'
            + '</div>',
        scope: {
            lat: '=',
            lng: '=',
            showMap: '=',
            onMapClosed: '&'
        },
        link: function postLink(scope, element, attrs) {


            $(element[0].children[0].children[1]).width($(window).width()- 40);
            $(element[0].children[0].children[1]).height($(window).height() - 80);


            scope.$watch('showMap', function(newVal, oldVal) {
                if (newVal) {
                    if (scope.map === undefined) {
                        scope.mapOptions = {
                            center: new google.maps.LatLng(scope.lat, scope.lng),
                            zoom: 13,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        console.log("create new map object");
                        scope.map = new google.maps.Map(element[0].children[0].children[1],scope.mapOptions);
                        scope.marker = new google.maps.Marker({
                            position: new google.maps.LatLng(scope.lat, scope.lng),
                            map: scope.map,
                            title:""
                        });
                    }
                }

            });



        }
    };
}).directive('scrollFill', function () {
    'use strict';
    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
            element.css({'overflow-y':'auto','overflow-x':'none', height: $(window).height() - attrs.scrollFill});
            if	(attrs.tobottom)
                element.animate({ scrollTop:  $(window).height() - attrs.scrollFill }, 2000);

            scope.$on('widthChanged', function() {
                element.height($(window).height() - attrs.scrollFill);
            });
        }
    };
}).directive('chatWindow', ['$timeout', function ($timeout) {
    'use strict';
    return {
        restrict: 'A',
        templateUrl: 'views/templates/chatWindow.html',
        scope: {
            conversation: '=',
            onMsgSend: '&'
        },
        link: function postLink(scope, element, attrs) {

            scope.newMsgsCount = 0;
            scope.myNewMsg = '';
            scope.totalMsgs = 0;

            scope.toggleChatWindow = function() {
                scope.chatWindowOpen = !scope.chatWindowOpen;
                if(scope.chatWindowOpen) {
                    scope.newMsgsCount = 0;
                    $timeout( function() {
                        $(element.find('.chat-text-window')).animate({ scrollTop: element.find('.chat-text-window')[0].scrollHeight}, 300);
                    }, 10);
                }
            };

            scope.sendNewMsg = function() {
                var newMsg = {
                    text: scope.myNewMsg,
                    status: 0, //undelivered
                    user: scope.$parent.appData.user.id
                };
                scope.conversation.messages.push(newMsg);
                $timeout( function() {
                    $(element.find('.chat-text-window')).animate({ scrollTop: element.find('.chat-text-window')[0].scrollHeight},0);
                }, 10);
                scope.onMsgSend({msg: newMsg, conv: scope.conversation}).then( function(index) {
                    newMsg.index = index;
                    newMsg.status = 1; //send
                }, function( error) {
                    newMsg.status = 2;  //failed
                });
                scope.myNewMsg = '';
            };

            scope.getUserName = function(id) {
                for(var i = 0; i < scope.conversation.users.length; i++) {
                    if (scope.conversation.users[i].id == id)
                        return scope.conversation.users[i].username;
                }
            };

            scope.$watch('conversation', function(newVal, oldVal) {
                if (newVal) {
                    var total = newVal.messages.length;
                    if (!scope.chatWindowOpen) {
                        if (total > scope.totalMsgs)
                            scope.newMsgsCount = scope.newMsgsCount + (total - scope.totalMsgs);
                    }
                    scope.totalMsgs = total;
                    scope.header = '';
                    newVal.users.forEach( function(user) {
                        if (user.id != scope.$parent.appData.user.id)
                            scope.header = scope.header + ' ' + user.username;
                    })

                }
            }, true);
        }
    };
}]);
