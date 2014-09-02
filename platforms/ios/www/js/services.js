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
            uploadPicture: {method: "POST", "url": url + 'uploadPicture'}
        })
    }
    ])
    .factory('User', ['$resource', function ($resource) {
        return $resource('User', {}, {
            signIn: {method: "POST", "url": url + "signIn"},
            logIn: {method: "POST", "url": url + "logIn"},
            isLogged: {method: "POST", "url": url + "isLogged"}
        })
    }]);


