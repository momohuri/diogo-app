/**
 * Created by mlengl1 on 8/16/14.
 */

var url = "http://diogo-api.aws.af.cm/";
//var url = 'http://localhost:8000/';
if (!window.device)window.device = {};
if (!window.device.uuid)window.device.uuid = 123;

angular.module('services', ['ngResource'])
    // default service. need to be rewritten

    .factory('Picture', ['$resource', function ($resource) {
        var trendingPictures = {};
        var Picture = $resource('Picture', {uuid: window.device.uuid}, {
            vote: {method: "POST", "url": url + "vote"},
            uploadPicture: {method: "POST", "url": url + 'uploadPicture'},
            getPicturesVote: {method: "POST", "url": url + "getPicturesVote", isArray: true},
            getTopOnePicture: {method: "POST", "url": url + "getTopOnePicture"},
            getTrendingPicture: {
                method: "POST", "url": url + "getTrendingPicture", transformResponse: function (data) {
                    trendingPictures = angular.fromJson(data);
                    if (trendingPictures.pictures) {
                        trendingPictures.pictures.sort(function (a, b) {
                            return a.rank - b.rank
                        });
                    }
                    return trendingPictures;
                }
            }
        });
        Picture.getPicture = function (no) {
            if (!trendingPictures) Picture.getTrendingPicture();
            return trendingPictures.pictures[no];
        };
        Picture.pictureExist = function (no) {
            return (trendingPictures.pictures[no] !== undefined)
        };
        return Picture;
    }])
    .factory('User', ['$resource', '$http', '$rootScope', function ($resource, $http, $rootScope) {
        var User = $resource('User', {uuid: window.device.uuid}, {
            signIn: {method: "POST", "url": url + "signIn"},
            logIn: {method: "POST", "url": url + "logIn"},
            isLogged: {method: "POST", "url": url + "isLogged"}
        });
        if (!$rootScope.user)$rootScope.user = {};
        User.getPoints = function (next) {
            if ($rootScope.user.points) return next($rootScope.user.points);
            else {
                $http.get(url + 'getUserPoints?uuid=' + window.device.uuid).success(function (userPoints) {
                    $rootScope.user.points = userPoints;
                    next($rootScope.user.points);
                })
            }
        };
        return User;
    }])
    .factory('Location', ['$http', '$rootScope','$ionicPlatform', function ($http, $rootScope,$ionicPlatform) {
        //todo refactor with no rootscope
        //todo every 5 mins renew location
        $rootScope.findingLocation = false;
        return function (next) {
            if (!$rootScope.findingLocation && !$rootScope.myLocation) {
                $rootScope.findingLocation = true;
                $ionicPlatform.ready(function () {
                    navigator.geolocation.getCurrentPosition(function (position) {
                            $http({
                                method: 'GET',
                                url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&zoom=18&addressdetails=1'
                            }).
                                success(function (data, status, headers, config) {
                                    $rootScope.findingLocation = false;
                                    //delete unused keys
                                    var used = ['county', 'state', 'country'];
                                    for (var key in data.address) {
                                        if (used.indexOf(key) == -1) delete data.address[key];
                                    }

                                    $rootScope.myLocation = data.address;
                                    next($rootScope.myLocation);
                                })
                                .error(function (data) {
                                    $rootScope.findingLocation = false;
                                    console.log('couldn\'t get location', data);
                                    next($rootScope.myLocation)
                                })
                        },
                        function (data) {
                            $rootScope.findingLocation = false;
                            console.log('couldn\'t get location', data);
                            next()
                        });
                });
            } else if ($rootScope.myLocation) {
                next($rootScope.myLocation);
            } else {
                function wait() {
                    setTimeout(function () {
                        if ($rootScope.myLocation) next($rootScope.myLocation);
                        else wait();
                    }, 1000)
                }

                wait();
            }
        }
    }]);

