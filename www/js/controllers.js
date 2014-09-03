angular.module('controllers', [])

    .controller('AppCtrl', [ "$rootScope", "Location", function ($rootScope, Location) {
        if (!$rootScope.myLocation) {
            Location(function () {
            });
        }
    }])

    .controller('AppLoading', ['$state', '$rootScope', "Location", function ($state, $rootScope, Location) {

        var value = window.localStorage.getItem("login");
        if (!$rootScope.myLocation) {
            Location(function () {
                if (value) $state.go('app.vote');
                else $state.go('app.login');
            });
        }

    }])

    .controller('LoginCtrl', ['$scope', "$state", 'User', function ($scope, $state, User) {

        // Form data for the login modal
        $scope.logIn = {};
        $scope.signIn = {};

        // Perform the login action when the user submits the login form
        $scope.doLogin = function () {
            $scope.logIn.uuid = device.uuid;
            User.logIn($scope.logIn, function (reply) {
                if (reply.success) {
                    window.localStorage.setItem("login", true);
                    $state.go('app.vote');
                }
                else $scope.errorsLogIn = reply.err;
            })


        };
        $scope.doSignIn = function () {
            if (!$scope.signIn.username) return $scope.errorsSignIn = "Enter a username";
            if ($scope.signIn.username.length < 4) return $scope.errorsSignIn = "User Name need more than 4 characters";
            if ($scope.signIn.password.length < 6) return $scope.errorsSignIn = "Password need more than 6 characters";
            if ($scope.signIn.password !== $scope.signIn.passwordVerify)return $scope.errorsSignIn = "Password don't match";

            $scope.signIn.uuid = device.uuid;
            User.signIn($scope.signIn, function (reply) {
                if (reply.success) {
                    window.localStorage.setItem("login", true);
                    $state.go('app.vote');
                }
                else $scope.errorsSignIn = reply.err;
            });


        }
    }])


    .controller('uploadPictureCtrl', ['$scope', '$http', 'Picture',
        function ($scope, $http, Picture) {
            $scope.obj = {};
            var pictureSource;
            $scope.PickPicture = function () {
                pictureSource = navigator.camera.PictureSourceType.PHOTOLIBRARY;
                processPicture()
            };

            $scope.takePicture = function () {
                pictureSource = navigator.camera.PictureSourceType.CAMERA;
                processPicture()
            };
            function processPicture() {
                $scope.canUpload = true;
                var options = {
                    quality: 1,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: pictureSource,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 640
                };
                navigator.camera.getPicture(
                    function (image64) {
                        $scope.mypicture = image64;
                    },
                    function (err) {
                        setTimeout(function () {
                            alert(err)
                        }, 0);
                    },
                    options);
            }

            $scope.upload = function () {
                var picture = {};
                picture.name = $scope.obj.name;
                picture.base64 = 'data:image/jpeg;base64,' + $scope.mypicture;
                picture.location = $scope.myLocation;
                Picture.uploadPicture({picture: picture, uuid: device.uuid}, function (reply) {
                    debugger
                })
            }

        }])

    .controller('VoteCtrl', ['$scope', '$rootScope', 'Picture', function ($scope, $rootScope, Picture) {
        $scope.pictures = [];
        getPictureToVote();

        $scope.upVote = function (id) {
            Picture.upVote(id);
            $scope.pictures.shift();
            getPictureToVote();
        };
        $scope.downVote = function (id) {
            Picture.downVote(id);
            $scope.pictures.shift();
            getPictureToVote();
        };


        function getPictureToVote() {
            if (!$rootScope.myLocation) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        getPictureToVote();
                    });
                }, 100);
            } else {
                Picture.getPicturesVote({"uuid": device.uuid, "location": $rootScope.myLocation}, function (reply) {
                    $scope.pictures = $scope.pictures.concat(reply);
                    if ($scope.pictures.length < 5) getPictureToVote();
                })
            }
        }


    }]);
