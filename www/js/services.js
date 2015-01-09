/**
 * Created by mlengl1 on 8/16/14.
 */

var url = "http://diogo-api.aws.af.cm/";
//var url = 'http://localhost:8000/';
if (!window.device)window.device = {};
if (!window.device.uuid)window.device.uuid = 123;

angular.module('services', ['ngResource'])

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
            isLogged: {method: "POST", "url": url + "isLogged"},
            signOut: {method: 'POST', 'url': url + 'signOut'}
        });
        User.getUserInfo = function (next) {
            if ($rootScope.user) return next($rootScope.user);
            else {
                $http.get(url + 'getUserInfo?uuid=' + window.device.uuid).success(function (user) {
                    $rootScope.user = user;
                    next($rootScope.user);
                })
            }
        };
        User.schoolSelected = function (institution, next) {
            $http.post(url + 'schoolSelected?uuid=' + window.device.uuid, institution).success(function (res) {
                if (res.success) {
                    $rootScope.user.institution = institution.institution;
                    next(res);
                } else next(res);
            })
        };
        return User;
    }])
    .factory('Location', ['$http', '$ionicPlatform', function ($http, $ionicPlatform) {

        var location,
            findingLocation = false;

        document.addEventListener("resume", function () {
            getLocation(function () {
            });
        }, false);

        setInterval(function () {
            getLocation(function () {
            });
        }, 300000);

        function getLocation(next) {
            $ionicPlatform.ready(function () {
                navigator.geolocation.getCurrentPosition(function (position) {
                        $http({
                            method: 'GET',
                            url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&zoom=18&addressdetails=1'
                        }).
                            success(function (data, status, headers, config) {
                                //delete unused keys
                                var used = ['county', 'state', 'country'];
                                for (var key in data.address) {
                                    if (used.indexOf(key) == -1) delete data.address[key];
                                }
                                location = data.address;
                                next(true);
                            })
                            .error(function (data) {
                                console.log('couldn\'t get location', data);
                                next(false)
                            })
                    },
                    function (data) {
                        console.log('couldn\'t get location', data);
                        next(false)
                    });
            });
        }

        return function LocationService(next) {
            if (!location && !findingLocation) {
                findingLocation = true;
                getLocation(function (res) {
                    findingLocation = false;
                    if (res) next(location);
                    else LocationService(next)
                });
            }
            else if (location) {
                next(location);
            } else {
                setTimeout(function () {  //if we are trying to find the location currently we just wait.
                    LocationService(next);
                }, 1000)
            }
        }
    }])
;

