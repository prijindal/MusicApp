var fs = require('fs');
var mm = require('musicmetadata');
var jsonfile = require('jsonfile')
var file = '../client/assets/json/allSongs.json'
var path = require('path')
var walk    = require('walk');
var files   = [];

// Walker options
var walker  = walk.walk('/home/prijindal/Music/', { followLinks: false });
var i =0;
walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    var filename = (root + '/' + stat.name);
    if(path.extname(filename)=='.mp3') {
    	var parser = mm(fs.createReadStream(filename), function (err, metadata) {
		  	if (err) {
		  		metadata.filename = filename
		  		metadata.title = filename
		  		files.push(metadata)
				// if(i%250==0){
		  // 			console.log(i)
				// }
		  		
		  // 		i+=1;
		  	}else {
		  		metadata.artist=metadata.artist[0]
		  		metadata.filename = filename
				
				if(metadata.picture.length>0){
					if(metadata.album) {
						metadata = saveAlbum(metadata)
					}
					else {
						metadata = saveArtist(metadata)
					}
				}
				else {
					metadata['image'] = '/home/prijindal/foundation/projects/musicapp/client/assets/img/placeholder.png';
					metadata.picture = {}
				}
				files.push(metadata);
				// if(i%250==0){
		  // 			console.log(i)
				// }
		  		
		  // 		i+=1;
		  	}
		next();
		});
    }
    else{
    	next();
    }
});

walker.on('end', function() {
    jsonfile.writeFile(file, files, function (err) {
	  console.error(err)
	})
});

function saveAlbum(metadata) {
	var imagepath = '/home/prijindal/Music/Images/Album/'+metadata.album+'.'+metadata.picture[0].format;

	try { // If File Already present
	    // Query the entry
	    stats = fs.lstatSync(imagepath);
	    metadata['image'] = imagepath;
		metadata.picture = {}
	}
	catch (e) {
		//if file not present
	    fs.writeFile(imagepath, metadata.picture[0].data, 'binary', function(err){
            if (err) {
        		//console.log(err)
	    		metadata = saveArtist(metadata)
        	}
        	else{ 
        		//console.log(imagepath)
        		metadata['image'] = imagepath;
	    		metadata.picture = {}
        	}
        })		 
	}
	return metadata
}
function saveArtist(metadata) {
	var imagepath = '/home/prijindal/Music/Images/Artist/'+metadata.artist+'.'+metadata.picture[0].format;

	try { // If File Already present
	    // Query the entry
	    stats = fs.lstatSync(imagepath);
	    metadata['image'] = imagepath;
		metadata.picture = {}
	}
	catch (e) {
		//if file not present
	    fs.writeFile(imagepath, metadata.picture[0].data, 'binary', function(err){
            if (err) {
        		//console.log(err)
	    		metadata.picture = {}
        	}
        	else{ 
        		//console.log(imagepath)
        		metadata['image'] = imagepath;
	    		metadata.picture = {}
        	}
        })		 
	}
	return metadata
}