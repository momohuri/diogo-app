angular.module('controllers', [])

    .controller('AppCtrl', [ "$state", function ($state) {

    }])

    .controller('AppLoading', ['$state', '$http', '$rootScope', function ($state, $http, $rootScope) {
        var value = window.localStorage.getItem("login");


        navigator.geolocation.getCurrentPosition(function (position) {
                $http({method: 'GET', url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&zoom=18&addressdetails=1'}).
                    success(function (data, status, headers, config) {
                        $rootScope.myLocation = data.address;
                        if (value) $state.go('app.vote');
                        else $state.go('login');
                    })
                    .error(function (data) {
                        alert(data);
                    })
            },
            function (err) {
                $rootScope.myLocation = err;
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


    .controller('LocationCtrl', function ($scope) {

    })

    .controller('CameraCtrl', ['$scope', '$http', 'Picture',
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
                $scope.canUpload=true;
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
                $scope.pictures.push(new picture());
                if ($scope.pictures.length < 5) getPictureToVote();
            }
        }

        function picture() {
            var url = ["http://www2.unine.ch/files/content/users/merciers2/files/6-%20Lola_Bonobos_IMG_0466%20(Zanna%20Clay).JPG",
                "http://lupusuva1phototherapy.com/wp-content/uploads/2013/11/bonobo.jpg",
                "http://t0.gstatic.com/images?q=tbn:ANd9GcSR0unofGOXbbVxRMF2jg6X4VlIF2MVg5_sQyfketuWL5QO2NmeZQ"
            ];
            return {
                "id": 123,
                "user": {name: "Mo"},
                picture: {url: url[Math.floor(Math.random() * 3)],
                    name: "Bonobo", date: new Date()}
            };
        }


    }]);
