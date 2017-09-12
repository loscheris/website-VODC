Download database, machine learning models
1. Download ¡®extra.zip¡¯ from: https://drive.google.com/file/d/0B6lX401WcyJRX2NqS0dDUmlUa00/view?usp=sharing
2. Unzip the file
3. mv extra/data ./Express_
4. mv extra/ssd_inception_v2_coco_11_06_2017 ./video_object_detection
4. mv extra/models ./web_VideoCaptioning
5. mv extra/vgg16.tfmodel ./web_VideoCaptioning

=======================================================================
video_object_detection main dependencies:
OpenCV 3.20
numpy
TensorFlow 1.10
matplotlib
PIL
pymongo
pillow 1.0
xml
protobuf 2.6

NB: run the following command BEFORE first time usage:
protoc video_object_detection/protos/*.proto --python_out=.

=======================================================================
web_VideoCaptioning main dependencies:
OpenCV 3.20
numpy
TensorFlow 1.10
pandas
Keras
matplotlib
ipdb
skimage
pymongo

=======================================================================
Run the server and the database
1. cd Express_
1. mongod --dbpath data/ 
3. In another terminal run: node bin/www
4. Visit localhost:3000¡¯ on Chrome