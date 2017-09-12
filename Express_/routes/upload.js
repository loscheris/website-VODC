var express = require('express');
var router = express.Router();
var path = require('path');
var url = require('url');
var fs = require('fs')

router.get('/', function(req, res) {
    res.render('upload', { title: 'upload', "nav": "upload" });
});

router.post('/uploadfile', function(req, res) {
    if (!req.files){
        return res.status(400).send('No files were uploaded.');
    }
    var uploadFile = req.files.uploadFile;
    var fileExt = path.extname(uploadFile.name);
    if( fileExt !== '.mp4' && fileExt !== '.avi'){
        return res.send('Please upload a .mp4 or .avi file');
    }

    if (fileExt == '.avi'){
        uploadFile.mv(path.join('../temp_avi', uploadFile.name), function(err) {
            if (err){
                return res.status(500).send(err);
            }else{
                res.redirect(url.format({
                    pathname:"/upload/successful",
                    query: {
                        "title": 'upload',
                        "filename": uploadFile.name
                    }
                }));
            }
        });
    }else{
        uploadFile.mv(path.join('../video_mp4', uploadFile.name), function(err) {
            if (err){
                return res.status(500).send(err);
            }else{
                res.redirect(url.format({
                    pathname:"/upload/successful",
                    query: {
                        "filename": uploadFile.name
                    }
                }));
            }
        });
    }
});


router.get('/successful',function (req, res) {
    res.render('uplosdSuccessful', {title: 'Upload Successful', filename: req.query['filename']});
});


router.get('/process_video', function(req, res){
    var encoded_filename = req.headers.referer.toString().split('filename=')[1];
    var filename = decodeURIComponent(encoded_filename);
    var fileExt = path.extname(filename);
    var fileBaseName = filename.split(fileExt)[0]


    if(fileExt == '.avi'){
        fs.stat(path.join('../temp_avi',filename),function(err){
            if(err){
                return res.send(err, ' Please re-upload the video file!');
            }else{
                console.log('Converting '+filename+' from .avi to .mp4 ......');
                var avi_to_mp4 = 'ffmpeg -y -i ' + path.join('../temp_avi', filename) + ' ' + path.join('../video_mp4', fileBaseName+'.mp4');

                var t1_start = new Date();

                const { exec } = require('child_process');
                var child_process = exec(avi_to_mp4);
                child_process.stdout.on('data', function(data) {
                    console.log(`stdout: ${data}`);
                });

                child_process.stderr.on('data', function(data){
                    console.log(`stderr: ${data}`);
                });

                child_process.on('exit', function(){
                    var t1 = new Date() - t1_start;

                    console.log('Dectecting objects in '+fileBaseName+'.mp4 ......');
                    const { spawn } = require('child_process');
                    var command = ['../video_object_detection/video_object_detection.py' ,'-p', '../video_mp4', '-n='+fileBaseName+'.mp4'];

                    var t2_start = new Date();
                    var object_detection = spawn('/Library/Frameworks/Python.framework/Versions/2.7/bin/python', command);

                    // video_captioning.stdout.on('data', function(data) {
                    //     console.log(`stdout: ${data}`);
                    // });

                    object_detection.stderr.on('data', function(data){
                        console.log(`stderr: ${data}`);
                    });

                    object_detection.on('exit', function(){
                        var t2 = new Date() - t2_start;

                        console.log('Object detection completed!')
                        console.log('Generating caption for'+fileBaseName+'.mp4 ......');
                        const { spawn } = require('child_process');
                        var command = ['../web_VideoCaptioning/video_captioning.py' ,'-p', '../video_mp4', '-n='+fileBaseName+'.mp4'];

                        var t3_start = new Date();
                        var video_captioning = spawn('/Library/Frameworks/Python.framework/Versions/2.7/bin/python', command);

                        video_captioning.stdout.on('data', function(data) {
                            console.log(`stdout: ${data}`);
                        });

                        video_captioning.stderr.on('data', function(data){
                            console.log(`stderr: ${data}`);
                        });

                        video_captioning.on('exit',function () {
                            var t3 = new Date() - t3_start;
                            console.log('Caption generation completed!');
                            console.log('===================  t1: ' + t1 + 'ms   ' + 't2: ' + t2 + 'ms   ' + 't3: ' + t3 + 'ms');
                            fs.unlink(path.join('../temp_avi', filename));
                            return res.redirect('/playvideo?filename='+fileBaseName);
                        })
                    });
                });
            }
        });
    }else{
        fs.stat(path.join('../video_mp4', filename), function(err){
           if(err){
               return res.send(err, ' Please re-upload the video file!');
           }else{
               console.log('Dectecting objects in '+fileBaseName+'.mp4 ......');
               const { spawn } = require('child_process');
               var command = ['../video_object_detection/video_object_detection.py' ,'-p', '../video_mp4', '-n='+fileBaseName+'.mp4'];
               var object_detection = spawn('/Library/Frameworks/Python.framework/Versions/2.7/bin/python', command);

               object_detection.stderr.on('data', function(data){
                   console.log(`stderr: ${data}`);
               });

               object_detection.on('exit', function(){
                   console.log('Object detection completed!')
                   console.log('Generating caption for'+fileBaseName+'.mp4 ......');
                   const { spawn } = require('child_process');
                   var command = ['../web_VideoCaptioning/video_captioning.py' ,'-p', '../video_mp4', '-n='+fileBaseName+'.mp4'];
                   var video_captioning = spawn('/Library/Frameworks/Python.framework/Versions/2.7/bin/python', command);

                   video_captioning.stdout.on('data', function(data) {
                       console.log(`stdout: ${data}`);
                   });

                   video_captioning.stderr.on('data', function(data){
                       console.log(`stderr: ${data}`);
                   });

                   video_captioning.on('exit',function () {
                       console.log('Caption generation completed!');
                       fs.unlink(path.join('../temp_avi', filename));
                       return res.redirect('/playvideo?filename='+fileBaseName);
                   })
               });
           }
        });
    }
});

module.exports = router;
