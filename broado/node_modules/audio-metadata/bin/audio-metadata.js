#!/usr/bin/env node

var fs = require('fs'),
	audioMetadata = require('../'),
	util = require('util'),
	args = process.argv.slice(2),
	type = 'id3v2',
	chunkSize = 512,
	quitAfter = chunkSize,
	colorize = true,
	files = [],
	i;

function usage() {
	console.log('Extract metadata from audio files');
	console.log();
	console.log('USAGE');
	console.log('audio-metadata --type <type> [options] file1 [file2...]');
	console.log();
	console.log('OPTIONS');
	console.log('--help,-h');
	console.log('  This help');
	console.log('--type,-t <type>');
	console.log('  One of "id3v1", "id3v2" or "ogg"');
	console.log('--chunk-size,-c <size>');
	console.log('  Read the file in chunks of <size>; default is 512');
	console.log('--quit-after,-q <length>');
	console.log('  Stop searching for metadata if nothing is found after ');
	console.log('  <length> bytes; default is 512');
	console.log('--no-colors,-z');
	console.log('  Don\'t colorize the output');
	console.log();
	console.log('EXAMPLE');
	console.log('Search for metadata in the first 300 bytes in 100 byte increments');
	console.log(' audio-metadata -t id3v2 -c 100 -q 300 keepitoffmy.wav');
}

for (i = 0; i < args.length; i++) {
	switch (args[i]) {
		case '-t':
		case '--type':
			type = args[++i];
			break;
		case '-h':
		case '--help':
			usage();
			process.exit(0);
			break;
		case '-c':
		case '--chunk-size':
			chunkSize = parseInt(args[++i]);
			break;
		case '-q':
		case '--quit-after':
			quitAfter = parseInt(args[++i]);
			break;
		case '-z':
		case '--no-colors':
			colorize = false;
			break;
		default:
			files.push(args[i]);
			break;
	}
}

if (!type) {
	console.error('--type is required');
	process.exit(1);
}
if (!(type in { ogg: 1, id3v1: 1, id3v2: 1 })) {
	console.error('Unrecognized type: ' + type);
	process.exit(1);
}

if (!files.length) {
	console.error('At least one file must be specified');
	process.exit(1);
}
if (isNaN(chunkSize) || chunkSize < 64) {
	console.error('Invalid chunk size');
	process.exit(1);
}
if (isNaN(quitAfter)) {
	console.error('Invalid --quit-after value');
	process.exit(1);
}
if (chunkSize > quitAfter) {
	console.error('chunk size cannot be greater than quit after value');
	process.exit(1);
}

try {
	for (i = 0; i < files.length; i++) {
		//everything's done synchronously so things are printed in the expected order
		var fd = fs.openSync(files[i], 'r'),
			buffer = new Buffer(quitAfter),
			metadata = null,
			offset = 0;

		while (!metadata) {
			var toRead = offset + chunkSize > quitAfter ? quitAfter - offset : chunkSize;
			if (!toRead) {
				break;
			}

			var bytesRead = fs.readSync(fd, buffer, offset, toRead, offset);
			if (bytesRead === 0) {
				//EOF
				break;
			}

			offset += bytesRead;
			metadata = audioMetadata[type](buffer);
		}

		fs.closeSync(fd);

		if (files.length > 1) {
			console.log(files[i] + ':');
		}
		if (metadata) {
			if (colorize) {
				console.log(util.inspect(metadata, false, null, true));
			} else {
				console.log(JSON.stringify(metadata, null, '  '));
			}
		} else {
			console.log('no metadata found');
		}

		console.log();
	}

	process.exit(0);
} catch (e) {
	console.error('An error occurred trying to read from a file');
	console.error('  ' + e.message);
	process.exit(1);
}