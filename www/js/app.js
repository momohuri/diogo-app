// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'controllers', 'services', 'directives', 'Filters', 'pascalprecht.translate'])

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
            }).state('app.settings', {
                url: "/settings",
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            }).
            state('app.addSchool', {
                url: '/addSchool',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/addSchool.html',
                        controller: 'AddSchoolCtrl'
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
    })

    .config(['$translateProvider', function ($translateProvider) {

        //todo load that in a external json
        $translateProvider.translations('en', {
            'MENU_TITLE': 'Menu',
            'MENU_TRENDINGMENU': 'Trending',
            'MENU_PICTURE': 'Upload Picture',
            'MENU_VOTE': 'Vote',

            'TRENDING_MENU_PAGE_NAME': 'Trending',
            'country': "Country",
            'state': 'State',
            'county': 'County',
            'TRENDING_MENU_LABEL_SCHOOL': 'School',
            'TRENDING_MENU_NO_PICTURE': 'There is no picture in this contest. You should upload one!',

            'SIGNIN_PAGE_NAME': 'Sign Up',
            'SIGNIN_BUTTON_SIGNIN': 'Sign Up',
            'SIGNIN_BUTTON_TO_LOGIN': 'Login',
            'LOGIN_PAGE_NAME': 'Login',
            'LOGIN_PLACEHOLDER_USERNAME': 'Username',
            'LOGIN_PLACEHOLDER_PASSWORD': 'Password',
            'LOGIN_BUTTON_LOGIN': 'Login',
            'LOGIN_BUTTON_TO_SIGNUP': 'Sign Up',
            'LOGIN_PLACEHOLDER_VERIFY_PASSWORD': 'Verify your password',

            'PICTURE_PAGE_NAME': 'Details',

            'TRENDING_PAGE_TITLE': 'Top in ',
            'TRENDING_RANK': 'Rank',
            'TRENDING_SCORE': 'Score',

            'UPLOAD_MESSAGE_SUCCESSFUL': 'Awesome! Upload Successful.',
            'UPLOAD_MESSAGE_FAIL': 'Shoot, that didn\'t work. Please try again later.',

            'VOTE_MESSAGE_NO_MORE_PICTURE': 'No more nearby posts. Thanks for voting!',

            'SETTINGS_PAGE_TITLE': 'Settings, brah!',
            'SETTINGS_NO_SCHOOL': 'No school selected',
            'SETTINGS_ADD_SCHOOL': 'Add',
            'SETTINGS_CHANGE_SCHOOL': 'Change',
            'SETTINGS_SIGN_OUT': 'Sign Out',
            'SETTINGS_POPUP_SIGNOUT_CONFIRM': 'Are you sure you want to sign out?',
            'SETTINGS_MY_ACCOUNT': 'My Account',
            'SETTING_USERNAME_LABEL': 'User Name :',
            'SETTING_SCHOOL_LABEL': 'School :',


            'ADD_SCHOOL_PAGE_TITLE': 'Pick your school'


        });

        $translateProvider.preferredLanguage('en');
    }]);
