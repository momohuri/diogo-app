angular.module('controllers', [])

    .controller('AppCtrl', [ "Location", function (Location) {

    }])

    .controller('AppLoading', ['$state', "Location", function ($state, Location) {

        var value = window.localStorage.getItem("login");
        if (!value) $state.go('signin');
        Location(function () {
            if (value)$state.go('app.vote');
        });


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


    .controller('uploadPictureCtrl', ['$scope', '$http', "$state", 'Picture',
        function ($scope, $http, $state, Picture) {
            $scope.obj = {};
            $scope.uploadind = false;
            var pictureSource;
            //todo keep code for gallery, maybe one day
//            $scope.PickPicture = function () {
//                pictureSource = navigator.camera.PictureSourceType.PHOTOLIBRARY;
//                processPicture()
//            };


            $scope.takePicture = function () {
                pictureSource = navigator.camera.PictureSourceType.CAMERA;
                processPicture()
            };
            $scope.takePicture();
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
                        $state.go('app.vote');
                        setTimeout(function () {
                            console.log(err);
                        }, 0);
                    },
                    options);
            }

            $scope.upload = function () {
                $scope.uploadind = true;
                var picture = {};
                picture.name = $scope.obj.name;
                picture.base64 = 'data:image/jpeg;base64,' + $scope.mypicture;
                picture.location = $scope.myLocation;
                Picture.uploadPicture({picture: picture, uuid: device.uuid}, function (reply) {
                    alert('You have submitted your picture');
                    $scope.uploadind = false;
                })
            }

        }])

    .controller('VoteCtrl', ['$scope', 'Location', 'Picture', function ($scope, Location, Picture) {
        $scope.pictures = [];
        getPictureToVote();

        $scope.vote = function (id, value) {
            Location(function (location) {
                Picture.vote({vote: {"pictureId": id, location: location, voteType: value}, "uuid": window.device.uuid}, function () {
                    getPictureToVote();
                });
            });
            $scope.pictures.shift();
        };

        function getPictureToVote() {
            if ($scope.pictures.length < 5) {
                Location(function (location) {
                    Picture.getPicturesVote({"uuid": device.uuid, "location": location}, function (reply) {
                        $scope.pictures = $scope.pictures.concat(reply);
                    })
                })
            }
        }
    }]);
