var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');


router.post('/search_label_name', function(req, res) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/video_objects';

    MongoClient.connect(url, function(err,db){
       if(err){
           console.log('Unable to connect to the server', err);
       }else{
           console.log('Connected to the database');
           var collection = db.collection('videos');

           var input_query = req.body.label_name;

           var db_name = input_query;
           input_query = input_query.split(",");
           var db_label = [];
           for(var i=0; i<input_query.length; i++){
               db_label[i] = input_query[i].trim();
               if(db_label[i] == ''){
                   db_label.splice(i,1);
                   i -= 1;
               }else{
                   db_label[i] = db_label[i].toLocaleLowerCase();
               }
           }

           collection.find({$or: [{'all_labels': {$exists: true, $all: db_label}}, {'v_name': { "$regex": db_name }}]}).toArray(function(err, result){
              if(err){
                  res.send(err);
              }else if(result.length){
                  res.render('search_results', {
                      title: 'search_results',
                      "search_results": result,
                      "nav": "search"
                  });
              }else{
                  res.render('not_in_db',{
                      title: 'not_in_db',
                      "nav": "not_in_db"
                  });
              }
              db.close();
           });
       }
    });
});



module.exports = router;
