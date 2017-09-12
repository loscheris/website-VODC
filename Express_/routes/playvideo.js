var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var mongodb = require('mongodb');

router.get('/', function(req, res) {
    var filename = req.query.filename.toString();
    console.log(filename);
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/video_objects';

    MongoClient.connect(url, function(err,db){
        if(err){
            console.log('Unable to connect to the server', err);
        }else{
            console.log('Connected to the database');
            var collection = db.collection('videos');

            collection.find({'v_name':filename}).toArray(function(err, result){
                console.log(result[0].caption);
                if(err){
                    res.send(err);
                }else if(result.length){
                    res.render('playvideo', {
                        title: 'play video',
                        "search_results": result,
                        filename: filename,
                        "nav": "playvideo"
                    });
                }else{
                    res.send("No document found");
                }
                db.close();
            });
        }
    });
});


router.get('/play', function(req, res){
    var filename = req.query.filename + '.mp4';
    var videoFile = path.join('../video_mp4', filename);

    fs.stat(videoFile, (err, stats) => {
        if (err) {
            console.log(err);
            return res.status(404).end('<h1>File Not found</h1>');
        }
        var totalSize = stats.size;
        var range = req.headers.range;
        var parts = range.replace(/bytes=/, '').split('-');
        var partialStart = parts[0];
        var partialEnd = parts[1];
        var start = parseInt(partialStart, 10);
        var end = partialEnd ? parseInt(partialEnd, 10) : totalSize-1;
        var chunkSize = (end - start) + 1;

        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunkSize);

        res.set({
            'Content-Range': 'bytes ' + start + '-' + end + '/' + totalSize,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4'
        });

        res.status(206);

        var stream = fs.createReadStream(videoFile, {start: start, end: end});
        stream.on('open', () => stream.pipe(res));
        stream.on('error', (streamErr) => res.end(streamErr));
    });
});

module.exports = router;

