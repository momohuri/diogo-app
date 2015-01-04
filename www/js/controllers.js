angular.module('controllers', [])

    .controller('AppCtrl', ["Location", function (Location) {

    }])

    .controller('AppLoading', ['$state', "Location", "$ionicLoading", function ($state, Location, $ionicLoading) {
        $ionicLoading.show();
        var value = window.localStorage.getItem("login");
        if (!value) $state.go('signin');
        // Location(function () {
        $ionicLoading.hide();
        if (value)$state.go('app.trendingMenu');
        //});


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
                    $state.go('app.trendingMenu');
                }
                else $scope.errorsLogIn = reply.err;    //todo i18n for this one (see with api)
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


    .controller('uploadPictureCtrl', ['$scope', '$http', "$state", '$ionicPopup', '$translate', 'Picture',
        function ($scope, $http, $state, $ionicPopup, $translate, Picture) {

            $scope.obj = {};
            $scope.uploading = false;
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
            $state.get('app.uploadPicture').onEnter = function () {
                $scope.takePicture();
            };
            $scope.takePicture();

            function processPicture() {
                $scope.canUpload = true;
                var options = {
                    quality: 50,
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
                $scope.uploading = true;
                var picture = {};
                picture.name = $scope.obj.name;
                picture.base64 = 'data:image/jpeg;base64,' + $scope.mypicture;
                picture.location = $scope.myLocation;
                Picture.uploadPicture({picture: picture, uuid: device.uuid}, function (reply) {
                    var message = reply.success ? 'UPLOAD_MESSAGE_SUCCESSFUL' : 'UPLOAD_MESSAGE_FAIL';
                    $translate(message).then(function (messageTrad) {
                        var alertPopup = $ionicPopup.alert({
                            title: messageTrad
                        })
                            .then(function (res) {
                                $scope.uploading = false;
                                $state.go('app.trendingMenu');
                            });
                    });
                })
            }

        }])

    .controller('VoteCtrl', ['$scope', '$translate', '$state', '$ionicPopup', 'Location', 'Picture', 'User', function ($scope, $translate, $state, $ionicPopup, Location, Picture, User) {
        $scope.height = document.getElementsByTagName('ion-content')[0].clientHeight / 1.5 + 'px';
        $scope.pictures = [];
        getPictureToVote();

        $scope.user = {};

        User.getPoints(function (points) {
            $scope.user.points = points;
        });

        $scope.vote = function (id, value) {
            ++$scope.user.points;
            Location(function (location) {
                Picture.vote({
                    vote: {"pictureId": id, location: location, voteType: value},
                    "uuid": window.device.uuid
                }, function () {
                    getPictureToVote();
                });
            });
            $scope.pictures.shift();
        };


        function popUpNoVote() {
            $translate("VOTE_MESSAGE_NO_MORE_PICTURE").then(function (messageTrad) {
                $ionicPopup.alert({
                    title: messageTrad
                }).then(function (res) {
                    $scope.uploading = false;
                    $state.go('app.trendingMenu');
                });
            });
        }


        function getPictureToVote() {

            if ($scope.pictures.length < 5) {
                Location(function (location) {
                    Picture.getPicturesVote({"location": location}, function (reply) {
                        $scope.pictures = $scope.pictures.concat(reply);
                        if ($scope.pictures.length === 0) popUpNoVote();
                    })
                })
            } else {
                if ($scope.pictures.length === 0) popUpNoVote();
            }
        }
    }])

    .
    controller('TrendingMenuCtrl', ['$scope', 'Location', 'Picture', function ($scope, Location, Picture) {
        $scope.loading = true;
        $scope.bestPictures = [];
        Location(function (location) {
            $scope.location = location;
            $scope.bestPictures = Picture.getTopOnePicture({location: location}, function () {
                $scope.loading = false;
            });
        });
    }])

    .controller('TrendingCtrl', ['$scope', '$stateParams', '$ionicHistory', '$state', 'Picture', 'Location',
        function ($scope, $stateParams, $ionicHistory, $state, Picture, Location) {
            $scope.location = $stateParams;
            $scope.goBack = function () {
                $state.go('app.trendingMenu');
            };
            $scope.locationType = $stateParams.locationType;
            Location(function (location) {
                Picture.getTrendingPicture({type: $stateParams.locationType, location: location}, function (docs) {
                    $scope.pictures = docs.pictures;
                })
            });
        }])

    .controller('PictureCtrl', ['$scope', '$stateParams', '$ionicHistory', 'Picture', 'User', function ($scope, $stateParams, $ionicHistory, Picture, User) {
        $scope.height = document.getElementsByTagName('ion-content')[0].clientHeight / 1.5 + 'px';
        $scope.goBack = $ionicHistory.goBack;
        var pictureNo = parseInt($stateParams.pictureNo);
        $scope.picture = Picture.getPicture(pictureNo);
        $scope.user = {};
        User.getPoints(function (points) {
            $scope.user.points = points;
        });

        var canDo = true;
        $scope.right = function () {
            if (canDo) {
                if (Picture.pictureExist(pictureNo - 1)) {
                    $scope.picture = Picture.getPicture(--pictureNo);
                    canDo = false;
                    setTimeout(function () {
                        canDo = true
                    }, 500)
                }
            }
        };
        $scope.left = function () {
            if (canDo) {
                if (Picture.pictureExist(pictureNo + 1)) {
                    $scope.picture = Picture.getPicture(++pictureNo);
                    canDo = false;
                    setTimeout(function () {
                        canDo = true
                    }, 500)
                }
            }
        }
    }]);
