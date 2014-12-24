var utils = require('./utils');

function checkMagicId3v1(view) {
	var id3Magic = utils.readBytes(view, view.byteLength - 128, 3);
	//"TAG"
	return id3Magic[0] === 84 && id3Magic[1] === 65 && id3Magic[2] === 71;
}

module.exports = function(buffer) {
	//read last 128 bytes
	var view = utils.createView(buffer);
	if (!checkMagicId3v1(view)) {
		return null;
	}

	function trim(value) {
		return value.replace(/[\s\u0000]+$/, '');
	}

	try {
		var offset = view.byteLength - 128 + 3,
			readAscii = utils.readAscii;
		var title = readAscii(view, offset, 30),
			artist = readAscii(view, offset + 30, 30),
			album = readAscii(view, offset + 60, 30),
			year = readAscii(view, offset + 90, 4);

		offset += 94;

		var comment = readAscii(view, offset, 28),
			track = null;
		offset += 28;
		if (view.getUint8(offset) === 0) {
			//next byte is the track
			track = view.getUint8(offset + 1);
		} else {
			comment += readAscii(view, offset, 2);
		}

		offset += 2;
		var genre = view.getUint8(offset);
		return {
			title: trim(title),
			artist: trim(artist),
			album: trim(album),
			year: trim(year),
			comment: trim(comment),
			track: track,
			genre: genre
		};
	} catch (e) {
		return null;
	}
};