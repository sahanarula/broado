# audio-metadata

[![Build Status](https://travis-ci.org/tmont/audio-metadata.png)](https://travis-ci.org/tmont/audio-metadata)
[![NPM version](https://badge.fury.io/js/audio-metadata.png)](http://badge.fury.io/js/audio-metadata)

This is a tinyish (2.1K gzipped) library to extract metadata from audio files.
Specifically, it can extract [ID3v1](http://en.wikipedia.org/wiki/ID3#ID3v1),
[ID3v2](http://en.wikipedia.org/wiki/ID3#ID3v2) and
[Vorbis comments](http://www.xiph.org/vorbis/doc/v-comment.html)
(i.e. metadata in [OGG containers](http://en.wikipedia.org/wiki/Ogg)).

Licensed under the [WTFPL](http://www.wtfpl.net/).

## What is this good for?
The purpose of this library is to be very fast and small. It's suitable
for server-side or client-side. Really any platform that supports
`ArrayBuffer` and its ilk (`Uint8Array`, etc.).

I wrote it because the other libraries were large and very robust; I just
needed something that could extract the metadata out without requiring
30KB of JavaScript. `audio-metadata.min.js` comes in at 6.1K/2.1K
minified/gzipped.

To accomplish the small size and speed, it sacrifices several things.

1. It's very naive. For example, the OGG format stipulates that the comment
   header must come second, after the identification header. This library
   assumes that's always true and ignores the header type byte.
2. Text encoding is for losers. ID3v2 in particular has a lot of flexibility in
   terms of the encoding of text for ID3 frames. This library will handle UTF8
   properly, but everything else is just spit out as ASCII.
3. It assumes that ID3v2 tags are always the very first thing in the file (as they
   should be). The spec is mum on whether that's ''required'', but this library
   assumes it is.
4. ID3v1.1 (extended tags with "TAG+") are not supported; Wikipedia suggests they
   aren't really well-supported in media players anyway.

As such, the code is a bit abstruse, in that you'll see some magic numbers, like
`offset += 94` where it's ignoring a bunch of header data to get to the good stuff.
Don't judge me based on this code. It works and it's tested; it's just hard to
read.

Of course, since this isn't an actual parser, invalid files will also work. This
means, for example, you could only read the first couple hundred bytes of an MP3
file and still extract the metadata from it, rather than requiring actual valid
MP3 data.

## Usage
The library operates solely on `ArrayBuffer`s, or `Buffer`s for Node's convenience.
So you'll need to preload your audio data before using this library.

The library defines three methods:

```javascript
// extract comments from OGG container
AudioMetaData.ogg(buffer)

// extract ID3v2 tags
AudioMetaData.id3v2(buffer);

// extract ID3v1 tags
AudioMetaData.id3v1(buffer);
```

The result is an object with the metadata. It attempts to normalize common keys:

* ''title'': (`TIT1` and `TIT2` in id3v2)
* ''artist'' (`TSE1` in id3v2)
* ''composer'' (`TCOM` in id3v2)
* ''album'' (`TALB` in id3v2)
* ''track'' (`TRCK` in id3v2, commonly `TRACKNUMBER` in vorbis comments)
* ''year'' (`TDRC` (date recorded) is used in id3v2)
* ''encoder'' (`TSSE` in id3v2)
* ''genre'' (`TCON` in id3v2)

Everything else will be keyed by its original name. For id3v2,
anything that is not a text identifier (i.e. a frame that starts with a
"T") is ignored. This includes comments (`COMM`).

### Node
Install it using NPM: `npm install audio-metadata` or `npm install -g audio-metadata`
if you want to use it from the shell.

```javascript
var audioMetaData = require('audio-metadata'),
	fs = require('fs');

var oggData = fs.readFileSync('/path/to/my.ogg');
var metadata = audioMetaData.ogg(oggData);
/*
{
  "title": "Contra Base Snippet",
  "artist": "Konami",
  "album": "Bill and Lance's Excellent Adventure",
  "year": "1988",
  "tracknumber": "1",
  "track": "1",
  "encoder": "Lavf53.21.1"
}
*/
```

#### From the Shell
```
Extract metadata from audio files

USAGE
audio-metadata --type <type> [options] file1 [file2...]

OPTIONS
--help,-h
  This help
--type,-t <type>
  One of "id3v1", "id3v2" or "ogg"
--chunk-size,-c <size>
  Read the file in chunks of <size>; default is 512
--quit-after,-q <length>
  Stop searching for metadata if nothing is found after
  <length> bytes; default is 512
--no-colors,-z
  Don't colorize the output

EXAMPLE
Search for metadata in the first 300 bytes in 100 byte increments
 audio-metadata -t id3v2 -c 100 -q 300 keepitoffmy.wav
 ```

### Browser
This library has been tested on current versions of Firefox and Chrome. IE
might work, since it apparently supports `ArrayBuffer`. Safari/Opera are
probably okayish since they're webkit. Your mileage may vary.

Loading `audio-metadata.min.js` will define the `AudioMetadata` global variable.

```html
<script type="text/javascript" src="audio-metadata.min.js"></script>
<script type="text/javascript">
	var req = new XMLHttpRequest();
	req.open('GET', 'http://example.com/sofine.mp3', true);
	req.responseType = 'arraybuffer';

	req.onload = function() {
		var metadata = AudioMetaData.id3v2(req.response);
		/*
			{
				"TIT2": "Foobar",
				"title": "Foobar",
				"TPE1": "The Foobars",
				"artist": "The Foobars",
				"TALB": "FUBAR",
				"album": "FUBAR",
				"year": "2014",
				"TRCK": "9",
				"track": "9",
				"TSSE": "Lavf53.21.1",
				"encoder": "Lavf53.21.1"
			}
		*/
	};

	req.send(null);
</script>
```

## Development
```bash
git clone git@github.com:tmont/audio-metadata.js
cd audio-metadata
npm install
npm test
```

There's a "test" (yeah, yeah) for browsers, which you can view
by running `npm start` and then pointing your browser at
[http://localhost:24578/tests/browser/](http://localhost:24578/tests/browser/).

To build the minified browserified file, run `npm run minify`.
