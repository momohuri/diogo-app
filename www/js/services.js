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
            upVote: {method: "GET", "url": url + "upVote"},
            downVote: {method: "GET", "url": url + "downVote"},
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
    .factory('Location', ['$http', function ($http) {
        var working = false;
        return  function (next) {
            if (!working) {
                navigator.geolocation.getCurrentPosition(function (position) {
                        $http({method: 'GET', url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&zoom=18&addressdetails=1'}).
                            success(function (data, status, headers, config) {
                                next(data.address);
                            })
                            .error(function (data) {
                                alert(data);
                            })
                    },
                    function (err) {
                        alert(err);
                    });
            }
            next();
        }
    }]);


