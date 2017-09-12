var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');


router.get('/', function(req, res){
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/video_objects';
    MongoClient.connect(url, function(err, db){
        if(err){
            console.log('Unable to connect to the server', err);
        }else{
            console.log('Connection Established');
            var collection = db.collection('videos');
            collection.find({}).toArray(function (err, result) {
                if(err){
                    res.send(err);
                }else if(result.length){
                    res.render('videolist', {
                        title: 'videolist',
                        "search_results": result,
                        "nav": "videolist"
                    });
                }else{
                    res.render('not_in_db',{
                        title: 'not_in_db',
                        "nav": "not_in_db"
                    });
                };
                db.close();
            });
        }
    })
});


module.exports = router;
