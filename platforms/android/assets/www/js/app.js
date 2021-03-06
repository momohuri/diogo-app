// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'controllers', 'services', 'directives', 'Filters'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })
            .state('loading', {
                url: "/loading",
                templateUrl: "templates/loading.html",
                controller: 'AppLoading'

            })
            .state('login', {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: 'LoginCtrl'

            })
            .state('signin', {
                url: "/signin",
                templateUrl: "templates/signin.html",
                controller: 'LoginCtrl'


            })

            .state('app.uploadPicture', {
                url: "/uploadPicture",
                views: {
                    'menuContent': {
                        templateUrl: "templates/uploadPicture.html",
                        controller: 'uploadPictureCtrl'
                    }
                }

            })

            .state('app.vote', {
                url: "/vote",
                views: {
                    'menuContent': {
                        templateUrl: "templates/vote.html",
                        controller: 'VoteCtrl'
                    }
                }
            })
            .state('app.trendingMenu', {
                url: "/trendingMenu",
                views: {
                    'menuContent': {
                        templateUrl: "templates/trendingMenu.html",
                        controller: 'TrendingMenuCtrl'

                    }
                }
            }).state('app.trending', {
                url: "/trending/:locationType/:location",
                views: {
                    'menuContent': {
                        templateUrl: "templates/trending.html",
                        controller: 'TrendingCtrl'
                    }
                }
            }).state('app.picture', {
                url: "/picture/:locationType/:pictureNo",
                views: {
                    'menuContent': {
                        templateUrl: "templates/picture.html",
                        controller: 'PictureCtrl'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/loading');
    })

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push(function ($rootScope) {
            return {
                request: function (config) {
                    $rootScope.$broadcast('loading:show');
                    return config
                },
                response: function (response) {
                    $rootScope.$broadcast('loading:hide');
                    return response
                }
            }
        })
    });
