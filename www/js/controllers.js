'use strict';
angular.module('controllers', [])

    .controller('AppCtrl', ["User", '$ionicPlatform', function (User, $ionicPlatform) {
        User.getUserInfo(function (points) {
        });


        $ionicPlatform.ready(function () {
            if (typeof analytics !== 'undefined') {
                analytics.startTrackerWithId('UA-58343549-1');
                analytics.trackView('app');
                console.log("starting analytics");
            }
            else {
                console.log("Google Analytics plugin could not be loaded.")
            }
        });
    }])

    .controller('AppLoading', ['$state', "Location", "$ionicLoading", function ($state, Location, $ionicLoading) {
        $ionicLoading.show();
        var value = window.localStorage.getItem("login");
        if (!value) $state.go('signin');
        Location(function () {
            $ionicLoading.hide();
            if (value)$state.go('app.trendingMenu');
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
            $state.get('app.uploadPicture').onEnter = takePicture;
            takePicture();

            $scope.obj = {};
            $scope.uploading = false;
            var pictureSource;
//            keep code for gallery, maybe one day
//            $scope.PickPicture = function () {
//                pictureSource = navigator.camera.PictureSourceType.PHOTOLIBRARY;
//                processPicture()
//            };
            function takePicture() {
                pictureSource = navigator.camera.PictureSourceType.CAMERA;
                processPicture()
            }

            function processPicture() {
                $scope.canUpload = true;
                var options = {
                    quality: 50,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: pictureSource,
                    encodingType: Camera.EncodingType.JPEG,
                    allowEdit: false,
                    targetWidth: 600,
                    targetHeight: 600,
                    correctOrientation: true
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
                Location(function (location) {
                    $scope.uploading = true;
                    var picture = {};
                    picture.name = $scope.obj.name;
                    picture.base64 = 'data:image/jpeg;base64,' + $scope.mypicture;
                    picture.location = location;
                    Picture.uploadPicture({picture: picture, uuid: device.uuid}, function (reply) {
                        var message = reply.success ? 'UPLOAD_MESSAGE_SUCCESSFUL' : 'UPLOAD_MESSAGE_FAIL';
                        $translate(message).then(function (messageTrad) {
                            $ionicPopup.alert({
                                title: messageTrad
                            })
                                .then(function (res) {
                                    $scope.obj.name = '';
                                    $scope.uploading = false;
                                    $state.go('app.trendingMenu');
                                });
                        });
                    })
                });
            }
        }])

    .controller('VoteCtrl', ['$scope', '$translate', '$state', '$ionicPopup', '$rootScope', 'Location', 'Picture', 'User',
        function ($scope, $translate, $state, $ionicPopup, $rootScope, Location, Picture, User) {
            $scope.height = document.getElementsByTagName('ion-content')[0].clientHeight / 1.5 + 'px';
            $scope.pictures = [];


            $state.get('app.vote').onEnter = function () {
                getPictureToVote();
            };
            getPictureToVote();

            $scope.vote = function (id, value) {
                ++$rootScope.user.points;
                Location(function (location) {
                    Picture.vote({
                        vote: {
                            "pictureId": id,
                            location: location,
                            voteType: value,
                            pictureLocation: $scope.pictures[0].location,
                            pictureInstitution: $scope.pictures[0].institution
                        },
                        "uuid": window.device.uuid
                    }, function () {
                        getPictureToVote();
                    });
                    $scope.pictures.shift();
                });
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

    .controller('TrendingMenuCtrl', ['$scope', '$state', '$ionicPopup', '$translate', 'Location', 'Picture',
        function ($scope, $state, $ionicPopup, $translate, Location, Picture) {
            if (typeof analytics !== "undefined") {
                analytics.trackView("Awesome Controller");
            }
            $scope.loading = true;

            $state.get('app.trendingMenu').onEnter = function () {
                getTopPicture();
            };
            getTopPicture();
            function getTopPicture() {
                Location(function (location) {
                    $scope.location = location;
                    Picture.getTopOnePicture({location: location}, function (data) {
                        $scope.bestPictures = data;
                        $scope.loading = false;
                    });
                });
            }

            $scope.noPicture = function ($event, isPicture) {
                if (isPicture)  return;
                $event.preventDefault();
                $translate('TRENDING_MENU_NO_PICTURE').then(function (messageTrad) {
                    $ionicPopup.alert({
                        title: messageTrad
                    });
                });
            }

        }])

    .controller('TrendingCtrl', ['$scope', '$stateParams', '$ionicHistory', '$state', 'Picture', 'Location',
        function ($scope, $stateParams, $ionicHistory, $state, Picture, Location) {
            $scope.location = $stateParams;
            $scope.goBack = function () {
                $state.go('app.trendingMenu');
            };
            $scope.locationType = $stateParams.locationType;

            $state.get('app.trending').onEnter = function () {
                getTrendingPicture();
            };
            getTrendingPicture();
            function getTrendingPicture() {
                Location(function (location) {
                    Picture.getTrendingPicture({type: $stateParams.locationType, location: location}, function (docs) {
                        $scope.pictures = docs.pictures;
                    })
                });
            }

        }])

    .controller('PictureCtrl', ['$scope', '$stateParams', '$ionicHistory', '$rootScope', 'Picture', 'Location',
        function ($scope, $stateParams, $ionicHistory, $rootScope, Picture, Location) {
            $scope.height = document.getElementsByTagName('ion-content')[0].clientHeight / 1.5 + 'px';
            $scope.goBack = $ionicHistory.goBack;
            var pictureNo = parseInt($stateParams.pictureNo);
            $scope.picture = Picture.getPicture(pictureNo);
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
            };
            $scope.vote = function (id, value) {
                if ($scope.picture.vote === value) return;//if vote again the same;
                if ($scope.picture.vote !== false && $scope.picture.vote !== true) {
                    ++$rootScope.user.points;
                    $scope.picture.score += value ? 2 : -2;
                } else {
                    $scope.picture.score += value ? 4 : -4;
                }
                $scope.picture.vote = value;
                Location(function (location) {
                    Picture.vote({
                        vote: {
                            "pictureId": id,
                            location: location,
                            voteType: value,
                            pictureLocation: $scope.picture.location,
                            pictureInstitution: $scope.picture.institution
                        },
                        "uuid": window.device.uuid
                    }, function () {
                    });
                });
            };

        }])

    .controller('SettingsCtrl', ['$scope', '$ionicHistory', '$ionicPopup', '$translate', '$state', 'User',
        function ($scope, $ionicHistory, $ionicPopup, $translate, $state, User) {
            $scope.goBack = $ionicHistory.goBack;
            $scope.SignOut = function () {
                $translate('SETTINGS_POPUP_SIGNOUT_CONFIRM').then(function (messageTrad) {
                    $ionicPopup.confirm({
                        title: messageTrad
                    }).then(function (res) {
                        if (res) {
                            User.signOut();
                            window.localStorage.setItem("login", false);
                            $state.go('login');
                        }
                    });
                });
            }
        }])
    .controller('AddSchoolCtrl', ['$scope', '$http', '$state', '$ionicHistory', 'User', function ($scope, $http, $state, $ionicHistory, User) {
        $scope.goBack = $ionicHistory.goBack;
        $scope.data = {"schools": [], "search": ''};
        var universities;
        $http.get('ressources/universities.json').
            success(function (data, status, headers, config) {
                universities = data;
            }).
            error(function (data, status, headers, config) {
                console.log('couldn\'t get universities.json...');
            });
        $scope.search = function () {
            if ($scope.data.search.length < 3) return;
            $scope.data.schools = universities.filter(function (university) {
                if (university.toLowerCase().indexOf($scope.data.search.toLowerCase()) !== -1) return true;
            })
        };
        $scope.schoolSelected = function (institution) {
            User.schoolSelected({institution: institution}, function (reply) {
                $state.go('app.settings');
            })
        }

    }]);
