// Issue : In Shuffle
// Repeat not implemented

var allSongs = [];
var recentlyPlayed = [];
var nowPlaying = [];
var songList = [];
var musicServer = "http://127.0.0.1:8999";

(function() {
  'use strict';

  var musicApplication = angular.module('musicApplication', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations',
    'ngAudio'
  ])
    .config(config)
    .run(run)
  ;

  musicApplication.controller('defaultController', function($scope, $http, ngAudio) {

    $scope.repeatState = false;

    $scope.shuffleState = false;

    ngAudio.setUnlock(false);

    $http.get('assets/json/allSongs.json').success(function(data) {
      for (var i = 0; i < data.length; i++) {
        var temp = data[i]
        temp['image'] = musicServer+temp['image']
        allSongs.pushIfNotExist(temp)
      };
    });


    var playSong = function(song) {
      if($scope.audio) {
        $scope.audio.stop()
      }
      recentlyPlayed.pushIfNotExist(song)
      $scope.audio = ngAudio.load(musicServer+song.filename);
      song['length'] = $scope.audio.remaining
      console.log($scope.audio)
      $scope.audio.play()
      $scope.currPlaying = song
      $scope.volume = $scope.audio.volume
      $scope.audio.complete(function() {
        console.log($scope.audio.currentTime)
        $scope.nextSong()
      })
    };
    
    $scope.play = function play(song) {
      nowPlaying = songList
      $scope.comingUp = nowPlaying
      playSong(song)
    }

    $scope.playComing = function playComing(song) {
      var index = $scope.comingUp.indexOf(song)
      $scope.comingUp = $scope.comingUp.slice(index+1)
      playSong(song)    
    }

    $scope.nextSong = function nextSong() {
      var song;
      var found = 0;
      var list = $scope.comingUp;

      if($scope.shuffleState) {
        list.shuffle()
      }

      for (var i = 0; i < list.length; i++) {
        song = list[i]
        if(recentlyPlayed.indexOf(song)==-1) {
          found = 1;
          break;
        }
      };

      if(found==0) {
        song = $scope.comingUp[0]
      }

      $scope.playComing(song)
    }

    $scope.previousSong = function previousSong() {
      if($scope.audio.currentTime<10) {
        $scope.play(recentlyPlayed[recentlyPlayed.length-2])
      }
      else {
        $scope.audio.restart()
      }
    }

    $scope.toggleState = function toggleState() {
      if($scope.audio){
        if($scope.audio.paused==true) {
          $scope.audio.play()
        }
        else {
          $scope.audio.pause()
        }
      }
      else{
        $scope.play(allSongs[0])
      }
    }

  })

  musicApplication.controller('albumsController', function($scope) {
    
    var albumlist = []
    for (var i = 0; i < allSongs.length; i++) {
      var album = allSongs[i].album
      var found = -1
      for (var j = 0; j < albumlist.length; j++) {
        if(albumlist[j].album == album) {
          found = 0
          break;
        }
      };
      if(found == -1) {
        albumlist.push(allSongs[i])
      }
    };
    $scope.albums = albumlist
  })

  musicApplication.controller('artistsController', function($scope) {

    var artistlist = []
    for (var i = 0; i < allSongs.length; i++) {
      var artist = allSongs[i].artist
      var found = -1
      for (var j = 0; j < artistlist.length; j++) {
        if(artistlist[j].artist == artist) {
          found = 0
          break;
        }
      };
      if(found == -1) {
        artistlist.push(allSongs[i])
      }
    };
    $scope.artists = artistlist

  })

  musicApplication.controller('songsController', function($scope) {
    $scope.songs = allSongs
    songList = allSongs
  })

  musicApplication.controller('songdetailsController', function($scope, $stateParams) {
    if($stateParams.artistname){
      songList = allSongs.filter(function(e) {return e.artist == $stateParams.artistname})
      $scope.songs = songList
    }
    else if($stateParams.albumname){
      songList = allSongs.filter(function(e) {return e.album == $stateParams.albumname})
      $scope.songs = songList
    }
    else if($stateParams.playlistName){
      
      var playlistName = $stateParams.playlistName;
      if(playlistName=='playing') {
        $scope.songs = nowPlaying  
        songList = nowPlaying
      }
      else if(playlistName=='recent') {
        $scope.songs = recentlyPlayed
        songList = recentlyPlayed
      }
      
    }
    
  });

  musicApplication.directive('errSrc', function() {
    return {
      link: function(scope, element, attrs) {

        scope.$watch(function() {
            return attrs['ngSrc'];
          }, function (value) {
            if (!value) {
              element.attr('src', attrs.errSrc);  
            }
        });

        element.bind('error', function() {
          element.attr('src', attrs.errSrc);
        });
      }
    }
  });

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }

})();


Array.prototype.pushIfNotExist = function(val) {
    if (typeof(val) == 'undefined' || val == '') { return }
    
    if (this.indexOf(val) == -1) {
        this.push(val);
        return true;

    }
};

Array.prototype.shuffle = function() {
    var counter = this.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = this[counter];
        this[counter] = this[index];
        this[index] = temp;
    }
}