

function readDirectory(directory, $rootScope){
  var isDir = directory;
  try{
    if(!isDir == ''){
      $rootScope.load=true;
      var Walker = require('walker')
        , fs = require('graceful-fs')
          , assert = require('assert'),
          audioMetaData = require('audio-metadata');
        Walker(directory)
          .on('entry', function(entry, stat) {
          })
          .on('dir', function(dir, stat) {
          })
          .on('file', function(file, stat) {
            var validExt = ['wav', 'mp3', 'ogg'];
            var name = file.split('\\').pop().split('.').splice(0);
            for(var i=0; i<validExt.length; i++){
              if(file.split('.').pop() == validExt[i]){
                /*var meta = readMeta(file);*/
                $rootScope.list.push([name[0], file]);
              }
            }
          })
          .on('end', function() {
            $rootScope.load=false;
            $rootScope.$apply();
            console.log('All files traversed.')
          });
      }    
  }
  catch(e){
    console.log(e);
  }

};

function readMeta(file){
	var fs = require('graceful-fs');
	var audioMetaData = require('audio-metadata');
	var oggData = fs.readFileSync(file);
	var metadata = audioMetaData.id3v1(oggData);
  return metadata;
};