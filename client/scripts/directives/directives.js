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

.directive('chatWindow', function () {
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
                if(scope.chatWindowOpen)
                    scope.newMsgsCount = 0;
            };

            scope.sendNewMsg = function() {
                var newMsg = {
                  user: me,
                  text: scope.myNewMsg,
                    status: 'undelivered'
                };
                scope.conversation.messages.push(newMsg);
                scope.onMsgSend({msg: newMsg}).then( function(response) {

                }, function( error) {

                });
                scope.myNewMsg = '';
            };

            scope.$watch('conversation', function(newVal, oldVal) {
                if (newVal) {
                    var total = newVal.messages.length;
                    if (!scope.chatWindowOpen) {
                        if (total > scope.totalMsgs)
                            scope.newMsgsCount = scope.newMsgsCount + (total - scope.totalMsgs);
                    }
                    scope.totalMsgs = total;
                }
            }, true);
        }
    };
})

.directive('isotope', function(AppData) {
    'use strict';
    return {
        restrict:   'A',
        template:   '<div class="portfolio-grid">' +
                        '<div data-ng-repeat="item in items" class="portfolio-item col-md-4 col-sm-6 col-xs-12 {{toTagString(item.tags)}}">' +
                            '<div class="img-figure-overlayer">' +
                                '<a fancybox title="{{item.name}}" href="{{appData.path + item.images[0].url}}">' +
                                    '<i class="fa fa-search-plus"></i>' +
                                '</a>' +
                            '</div>' +
                            '<div class="img-figure">' +
                                '<img alt="{{item.shortDescription}}" ng-src="{{appData.path + item.images[0].url}}"/>' +
                            '</div>' +
                        '</div>' +
                    '</div>',
        scope: {
            items: '=',
            filter: '='
        },
        link: function postLink(scope, element, attrs) {

            scope.appData = AppData;
            scope.filter = '*';

            scope.startIsotope = function() {
                if (scope.items) {
                    setTimeout(function() {
                        element.find('.portfolio-grid').isotope({
                            filter: scope.filter,
                            animationOptions: {
                                duration: 850,
                                easing: 'linear',
                                queue: false
                            }
                        });
                    }, 200);

                }
            };

            scope.toTagString = function(array) {
                var res = '';
                array.forEach( function(tag) {
                    res = res + ' ' + tag;
                })
                return res;
            };

            scope.$watch('items', function(newVal, oldVal) {
                if (newVal) {
                    scope.startIsotope();
                }
            });

            scope.$watch('filter', function(newVal, oldVal) {
                if (newVal != oldVal) {
                    scope.startIsotope();
                }
            });
        }
    };
})

.directive('fancybox', function() {
    'use strict';
    return {
        restrict:   'A',
        link: function postLink(scope, element, attrs) {
            element.fancybox({
                helpers : {
                    overlay : {
                        speedOut : 0,
                        locked: false
                    }
                }
            });
        }
    };
})

.directive('revolutionSlider', function() {
    'use strict';
    return {
        restrict:   'A',
        link: function postLink(scope, element, attrs) {
            element.revolution({
                delay: 9000,
                startwidth: 1170,
                startheight: 500,
                hideThumbs: 10,
                fullWidth: "on",
                forceFullWidth: "on",
                lazyload: "on",
                navigationStyle: "none"
            });
        }
    };
})

.directive('ngScrollspy', function() {
    'use strict';
    return {
        restrict:   'A',
        link: function postLink(scope, element, attrs) {

            scope.scrollspy = function() {
                setTimeout( function() {
                    if (!element.data("scrollspy")) {
                        element.data("scrollspy", new $.UIkit.scrollspy(element, $.UIkit.Utils.options(element.data("uk-scrollspy"))));
                    }
                }, 10);
            };

            scope.scrollspy();

            scope.$watch(function() {return element.attr('data-uk-scrollspy'); }, function(newValue){
                if (newValue)
                    scope.scrollspy();
            });

        }
    };
})

.directive('owlCarousel', function(AppData) {
    'use strict';
    return {
        restrict:   'A',
        template:   '<div class="client-logo" data-ng-repeat="item in items">' +
                        '<img ng-src="{{appData.path + item.logo}}" alt="{{item.name + \' \' + item.description}}" />' +
                    '</div>',
        scope: {
            items: '='
        },
        link: function postLink(scope, element, attrs) {

            scope.appData = AppData;

            scope.startOwl = function() {
                if (scope.items) {
                    element.owlCarousel({
                        items : 6,
                        itemsDesktop : [1000, 5],
                        itemsDesktopSmall : [768, 4],
                        itemsTablet: [520, 2],
                        itemsMobile: [320, 2],
                        lazyLoad : true,
                        pagination: false,
                        autoPlay: 5000
                    });
                }
            };

            scope.startOwl();

            scope.$watch('items', function(newVal, oldVal) {
                if (newVal !== undefined) {
                    scope.startOwl();
                }
            });
        }
    };
});
