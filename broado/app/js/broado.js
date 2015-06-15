var app = angular.module('broado', ['ngRoute', 'ngAnimate']);


app.filter('clean', function() {
	return function(input){
	   console.log('input');
	}
});

app.config(function($routeProvider){
	$routeProvider.when('/', {
		templateUrl: 'list.html',
		controller: 'ListController'
	})
	.when('/single', {
		templateUrl: 'single.html',
		controller: 'MenuController'
	})
	.when('/broadcasts', {
		templateUrl: 'broadcasts.html',
		controller: 'BroadController'
	})
	.when('/register', {
		templateUrl: 'register.html',
		controller: 'RegisterController'
	})
	.when('/playlist', {
		templateUrl: 'list.html',
		controller: 'PlaylistController'
	})
	.when('/logout', {
		templateUrl: 'register.html',
		controller: 'LogoutController'
	})
	.otherwise({ redirectTo: '/' });
})

app.factory('LocalService', ['$rootScope', function($rootScope){
	return {
		get: function(key){
			return localStorage.getItem(key);
		},
		set: function(key, value){
			localStorage.setItem(key, value);
		},
		remove: function(key){
			localStorage.removeItem(key);
		},	

	};
}]);


app.factory('AudioService', function($rootScope, LocalService, $location){
	return {
		loadsingle: function(song){
			console.log(song);
			$rootScope.song = song;
			$rootScope.player.load();
			// $rootScope.currentSong = song.split('\\').pop();
			$rootScope.currentSong = $rootScope.song.substr($rootScope.song.lastIndexOf('/')+1);
			console.log($rootScope.currentSong);
			var meta = readMeta(song);
			try{
				if(meta.artist)
				{
					$rootScope.currentArtist = meta.artist;
				}
				else
					$rootScope.currentArtist = 'Unknown';
			}
			catch(e){
				$rootScope.currentArtist = 'Unknown';
				console.log(e);
			}
			try{
				if(meta.album)
				{
					$rootScope.currentAlbum = meta.album;
				}
				else
					$rootScope.currentAlbum = 'Unknown';
			}
			catch(e){
				$rootScope.currentAlbum = 'Unknown';
				console.log(e);
			}
			$rootScope.isactive = true;
			this.play();
			try{
				// $rootScope.$apply();
			}
			catch(e){
				console.log(e);
			}
		},
		updateDirectory: function(path){
			console.log('checking in between');
			path = path.substring(0, path.lastIndexOf('/'))
			console.log(path);
			LocalService.set('directory', path);
			console.log(LocalService.get('directory'));
			readDirectory(LocalService.get('directory'), $rootScope);
		},
		load: function(song){
			console.log('loaded with song');
			this.loadsingle(song[1]);
		},
		play: function(){
			$rootScope.player.play();
			$rootScope.pause = false;
			$rootScope.isactive = true;			
			if($rootScope.currentArtist != 'Unknown'){
				$rootScope.loadArtist($rootScope.currentArtist);
			}
			try{
				// $rootScope.$apply();
			}
			catch(e){
				console.log(e);
			}
			$location.path('/single');
		},
		pause: function(){
			$('.viewer .cover img').css('opacity', '0');
			$rootScope.player.pause();
			$rootScope.pause = true;
		},
		volume: function(volume){
			$rootScope.player.volume = volume;
		},
		forward: function(){
			$rootScope.player.currentTime += 10;
		},
		backward: function(){
			$rootScope.player.currentTime -= 10;
		},
		setTime: function(x){
			if(!$rootScope.player.ended && $rootScope.isactive)
				$rootScope.player.currentTime = x*$rootScope.player.duration;
		},
		updateTime: function(){

			setInterval(function update(){
				var barsize = $(window).width();
				var size = $rootScope.player.currentTime/$rootScope.player.duration*barsize;
				$('#seek').width(size);
				if($rootScope.player.ended)
					{
						clearInterval(update);
						$('#seek').width(0);
						$rootScope.pause = true;
						// $rootScope.$apply();
					}

			}, 500);
		},
		isloaded: function(){
			if($rootScope.song)
				return true;
			else
				return false;
		},
		test: function(){
			
		}
	};
});



app.run(['$rootScope', 'LocalService', '$http', 'AudioService', '$location', function ($rootScope, LocalService, $http, AudioService, $location) {
	$rootScope.player = $('#player')[0];
	$rootScope.pause = true;
	$rootScope.isactive = false;
	$rootScope.volume = 0.6;
	$rootScope.load=false;
	$rootScope.broadsload=false;
	$rootScope.server = "http://broado.cyburl.in";
	$rootScope.loadArtist = function(currentArtist){
	    $('.viewer').css('background', 'none');
	    $rootScope.loadingArtist = true;
	    $('.viewer .cover img').css('opacity', '0');
		$http.get('https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q='+currentArtist+'&rsz=1&imgsz=xlarge')
		.success(function(data){
			$rootScope.urlArtist = data.responseData.results[0].url;
		    var tmpImg = new Image() ;
		    tmpImg.src = $rootScope.urlArtist;
		    tmpImg.onload = function(){
				$('.viewer .cover img').attr('src', tmpImg.src).css('opacity', '1');
				$rootScope.loadingArtist = false;
				$rootScope.$apply();
		    }
			console.log($rootScope.urlArtist);
		})
		.error(function(data){
			$rootScope.loadingArtist = false;
			console.log(data);
		});
	};
	var username = LocalService.get('username');
	if(username){
		$rootScope.user = true;
		$rootScope.username = username;
	}
	else 
		$rootScope.user = false;
	document.body.addEventListener('dragover', function(e){
	  e.preventDefault();
	  e.stopPropagation();
	}, false);

	document.body.addEventListener('drop', function(e){
	  e.preventDefault();
	  e.stopPropagation();
	}, false);
	document.body.ondrop = function(e){
		console.log(e);
		var song = e.dataTransfer.files[0].path;
		AudioService.loadsingle(song);
	}

	$rootScope.$watch('flash', function(){
		setTimeout(function(){
			$rootScope.flash = false;
			// $rootScope.$apply();
		}, 2500);
	});

}]);

app.controller('LogoutController', ['$scope', '$rootScope', '$http', '$location', 'LocalService', function ($scope, $rootScope, $http, $location, LocalService) {
	$rootScope.load = true;
	$http.post($rootScope.server + '/user/logout', {token: 'validreqbroado'})
	.success(function(data){
		$rootScope.user = false;
		LocalService.remove('username');
		LocalService.remove('user_id');
		$rootScope.username = null;
		$rootScope.user_id = null;
		console.log(data);
		$rootScope.load = false;
		$location.path('/register');
	})
	.error(function(data){
		$rootScope.load = false;
	})
}])

app.controller('ListController', ['$scope', '$rootScope', 'AudioService', 'LocalService', '$location', function ($scope, $rootScope, AudioService, LocalService, $location) {
		var directory = LocalService.get('directory');
		console.log(directory);
		$rootScope.list = [];
		readDirectory(directory, $rootScope);
		$location.path('/playlist');
		$scope.load = function(song){
			AudioService.load(song);
		}
		
	var file = nw.App.argv;
	if(file != ""){
		AudioService.loadsingle(file[0]); 
		nw.App.argw = "";
	}
	nw.App.on('open', function(path) {
  		var urlparts = path.split('"');
  		AudioService.loadsingle(urlparts[3]);
	});
}]);

app.controller('PlaylistController', function ($scope, $rootScope, AudioService) {
	$scope.load = function(song){
		AudioService.load(song);
	}
});

app.controller('BroadController', ['$scope', '$rootScope', '$http', '$location', 'LocalService', function ($scope, $rootScope, $http, $location, LocalService) {
	if(!$rootScope.username)
		$location.path('/register');
	var page = 0;
	$scope.broadcasts = [];
	$scope.getBroads = function(){
		page++;
		$scope.broadsload = true;
		console.log('running now');
		$http.get($rootScope.server + '/broads?page=' + page)
		.success(function(data){
			for(var i=0; i<data.data.length; i++)
				$scope.broadcasts.push(data.data[i]);
			console.log($('.nano table').height());
			$scope.broadsload = false;
		
		})
		.error(function(data){
			console.log('data');
			$scope.broadsload = false;
		})
	}

	$scope.refresh = function(){
		page = 1;
		$scope.broadcasts = [];
		$scope.broadsload = true;
		console.log('running now');
		$http.get($rootScope.server + '/broads?page=' + page)
		.success(function(data){
			for(var i=0; i<data.data.length; i++)
				$scope.broadcasts.push(data.data[i]);
			console.log($('.nano table').height());
			$scope.broadsload = false;
		
		})
		.error(function(data){
			console.log('data');
			$scope.broadsload = false;
		})
	}

	
	$scope.up = function(index, id){
		$scope.broadsload = true;
		
		$http.post($rootScope.server + '/broadcast/up', {
			token : 'validreqbroado',
			id    :  id,
			user_id: LocalService.get('user_id')
		})
		.success(function(data){
			console.log(data);
			$scope.broadsload = false;
			$scope.broadcasts[index].count = data[0];
			console.log($scope.broadcasts[index]);
		})
		.error(function(data){
			$scope.broadsload = false;
			console.log(data);
			$rootScope.flash = true;
			$rootScope.messages = data;
		});
	}
	$scope.down = function(index, id){
		$scope.broadsload = true;
		$http.post($rootScope.server + '/broadcast/down', {
			token : 'validreqbroado',
			id    :  id,
			user_id: LocalService.get('user_id')
		})
		.success(function(data){
			$scope.broadsload = false;
			console.log(data);
			$scope.broadcasts[index].count = data[0];
		})
		.error(function(data){
			$scope.broadsload = false;
			console.log(data);
			$rootScope.flash = true;
			$rootScope.messages = data;
		});
	}


	var offset = 90;
	$('.nano').scroll(function()
	{
		var height = $('.nano').scrollTop() + $('.nano').height();
		var reference = $('.nano table').height() + offset; 
		if(height == reference){
			$scope.getBroads();
		}
	});



}])

app.directive('scroller', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            rawElement = elem[0]; // new
            elem.bind('scroll', function () {
                if((rawElement.scrollTop + rawElement.offsetHeight+5) >= rawElement.scrollHeight){ //new
                    scope.$apply('getBroads()');
                }
            });
        }
    };
});

app.controller('PlayerController', ['$scope', '$rootScope', 'AudioService', '$location', '$http', function ($scope, $rootScope, AudioService, $location, $http) {
		var barsize = $(window).width();
		$scope.toggleplay = function(){
			if($rootScope.isactive){
				if(!$rootScope.player.ended && !$rootScope.player.paused){
					AudioService.pause();
					console.log('pausing now');
				}
				else{
					AudioService.play();
					console.log('playing now');
				}
			}
		}

		$scope.forward = function(){
			AudioService.forward();
		}
		$scope.backward = function(){
			AudioService.backward();
		}

		$scope.$watch('volume', function(){
			AudioService.volume($scope.volume);
		});

		$scope.setTime = function(e){
			AudioService.setTime(e.clientX/barsize);
		}
		$scope.single = function(){
			$location.path('single');
		}
		AudioService.updateTime();
		$scope.broadcast = function(){
			if($rootScope.isactive && $rootScope.username){
				$rootScope.load = true;
				$http.post($rootScope.server + '/broadcast/create', {
					username: $rootScope.username,
					song    : $rootScope.currentSong,
					token   : 'validreqbroado'
				})
				.success(function(data){
					$rootScope.load = false;
					$rootScope.flash = true;
					$rootScope.messages = data;
				})
				.error(function(data){
					$rootScope.load = false;
					$rootScope.flash = true;
					$rootScope.messages = data;	
				});
			}
		}

}]);	

app.controller('RegisterController', ['$scope', '$http', '$rootScope', 'LocalService', '$location', function ($scope, $http, $rootScope, LocalService, $location) {
	$scope.login = function(){
		$rootScope.load = true;
		$http.post($rootScope.server + '/user/login', 
			{
				username: $scope.login_username,
				password: $scope.login_password,
				remember: $scope.remember,
				token: 'validreqbroado'
			}
		)
		.success(function(data){
			$rootScope.load = false;
			console.log(data);
			$rootScope.user = true;
			$rootScope.username = data.username;
			if($scope.remember){
				LocalService.set('username', data.username);
			}
			LocalService.set('user_id', data.id);
			$location.path('/playlist');
		})
		.error(function(data){
			$rootScope.load = false;
			console.log(data);
			$rootScope.flash = true;
			$rootScope.messages = data;
		});
	}
	$scope.register = function(){
		$rootScope.load = true;
		$http.post($rootScope.server + '/user/register', {
			username : $scope.register_username,
			password : $scope.register_password,
			repassword: $scope.register_confirm,
			token: 	'validreqbroado'
		})
		.success(function(data){
			$rootScope.load = false;
			console.log(data);
			$rootScope.flash = true;
			$rootScope.messages = data;
			$scope.register_username = "";
			$scope.register_password = "";
			$scope.register_confirm = "";
		})
		.error(function(data){
			$rootScope.load = false;
			console.log(data);
			$rootScope.flash = true;
			$rootScope.messages = data;
		});
	}
}])


app.controller('MenuController', ['$scope', '$rootScope', 'AudioService', '$location', function ($scope, $rootScope, AudioService, $location) {
	$scope.openDirectory = function(){
		$('#directory').click();
	}
	$scope.openFile = function(){
		$('#file').click();
	}
	$scope.$watch('file', function(){
		try{
			var file = $scope.file.path;
			// var url = file.split('\:');
			// file = url[0] + ':\\' + url[1];
			console.log(file);
			AudioService.loadsingle(file);
			$location.path('/single');
		}
		catch(e){
			console.log(e);
		}
	});
	$scope.$watch('directory', function(){
		try{
			AudioService.updateDirectory($scope.directory.path);
			$location.path('/');
		}
		catch(e){
			console.log(e);
		}
	});
	$scope.register = function(){
		$location.path('/register');
	}
	$scope.playlist = function(){
		$location.path('/playlist');
	}
	$scope.broadcasts = function(){
		$location.path('/broadcasts');
	}
}]);

app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                    scope.$apply(function () {
                        scope.fileread = changeEvent.target.files[0];
                    });
            });
        }
    }
}]);
app.directive("directoryread", [function () {
    return {
        scope: {
            directoryread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                    scope.$apply(function () {
                        scope.directoryread = changeEvent.target.files[0];
                    });
            });
        }
    }
}]);