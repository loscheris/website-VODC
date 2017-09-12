# website-VODC
## About the Website
This is a website application for user to process video by video object detector and video caption generator.

* The video object detector returns the object label and the corresponding appearance.
* The video caption generator returns a sentence to describe to video (performs better for the video < 20s).

Users are allowed to:

* Upload and Process Video 
* Search the video by **object name** or **video name**
* Watch video (provided with the machine generated caption and the object labels)
* Navigate video by clicking the object label

Dependencies of the website:

* Node.js
* MongoDB

##Before Using
Download the database, machine learning models

1. Download ‘extra.zip’ from: https://drive.google.com/file/d/0B6lX401WcyJRX2NqS0dDUmlUa00/view?usp=sharing
2. Unzip the file
3. mv extra/data ./Express\_
4. mv extra/ssd\_inception\_v2\_coco\_11\_06\_2017 ./video_object_detection
4. mv extra/models ./web\_VideoCaptioning
5. mv extra/vgg16.tfmodel ./web\_VideoCaptioning

***
video\_object\_detection dependencies:

* OpenCV 3.20
* TensorFlow 1.10
* PIL
* pymongo
* pillow 1.0
* xml
* protobuf 2.6

NB: run the following command **BEFORE** first time use:
```protoc video_object_detection/protos/*.proto --python_out=.```

***
web_VideoCaptioning main dependencies:

* OpenCV 3.20
* TensorFlow 1.10
* pandas
* Keras
* ipdb
* skimage
* pymongo

##Run the server
1. ```cd Express_```
1. ```mongod --dbpath data/ ```
3. In another terminal run:``` node bin/www```
4. Visit <localhost:3000> on Chrome


