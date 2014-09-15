/**
 * Created by mlengl1 on 8/16/14.
 */

var url = "http://diogo-api.nodejitsu.com/";
//var url = 'http://localhost:8000/';
if (!window.device)window.device = {};
if (!window.device.uuid)window.device.uuid = 123;

angular.module('services', ['ngResource'])
    // default service. need to be rewritten

    .factory('Picture', ['$resource', function ($resource) {
        return $resource('Picture', {}, {
            vote: {method: "POST", "url": url + "vote"},
            uploadPicture: {method: "POST", "url": url + 'uploadPicture'},
            getPicturesVote: {method: "POST", "url": url + "getPicturesVote", isArray: true}
        })
    }
    ])
    .factory('User', ['$resource', function ($resource) {
        return $resource('User', {}, {
            signIn: {method: "POST", "url": url + "signIn"},
            logIn: {method: "POST", "url": url + "logIn"},
            isLogged: {method: "POST", "url": url + "isLogged"}
        })
    }])
    .factory('Location', ['$http', '$rootScope', function ($http, $rootScope) {
        $rootScope.findingLocation = false;
        return  function (next) {
            if (!$rootScope.findingLocation && !$rootScope.myLocation) {
                $rootScope.findingLocation = true;
//                $ionicPlatform.ready(function () {
                navigator.geolocation.getCurrentPosition(function (position) {
                        $http({method: 'GET', url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&zoom=18&addressdetails=1'}).
                            success(function (data, status, headers, config) {
                                $rootScope.findingLocation = false;
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
//                });
            } else if ($rootScope.myLocation) {
                next($rootScope.myLocation);
            } else {
                function wait() {
                    setTimeout(function () {
                        if ( $rootScope.myLocation) next($rootScope.myLocation);
                        else wait();
                    }, 1000)
                }
                wait();
            }
        }
    }]);


