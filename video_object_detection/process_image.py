import numpy as np
import os
#import six.moves.urllib as urllib
import sys
import tarfile
import tensorflow as tf
import zipfile
from collections import defaultdict
from io import StringIO
from matplotlib import pyplot as plt
from PIL import Image
from utils import label_map_util
from utils import visualization_utils as vis_util

def process(frame_path, frame_name, model_name):
    # model path
    PATH_TO_CKPT = model_name + '/frozen_inference_graph.pb'

    # List of the strings that is used to add correct label for each box.
    PATH_TO_LABELS = os.path.join('data', 'mscoco_label_map.pbtxt')

    NUM_CLASSES = 90
    no_objects_detected = 4

    detection_graph = tf.Graph()
    with detection_graph.as_default():
        od_graph_def = tf.GraphDef()
        with tf.gfile.GFile(PATH_TO_CKPT, 'rb') as fid:
            serialized_graph = fid.read()
            od_graph_def.ParseFromString(serialized_graph)
            tf.import_graph_def(od_graph_def, name='')

    label_map = label_map_util.load_labelmap(PATH_TO_LABELS)
    categories = label_map_util.convert_label_map_to_categories(label_map, max_num_classes=NUM_CLASSES, use_display_name=True)
    category_index = label_map_util.create_category_index(categories)

    def load_image_into_numpy_array(image):
        (im_width, im_height) = image.size
        return np.array(image.getdata()).reshape((im_height, im_width, 3)).astype(np.uint8)

    TEST_IMAGE_PATHS = [ os.path.join(frame_path, i) for i in frame_name ]

    # Size, in inches, of the output images.
    IMAGE_SIZE = (12, 8)
    result = {}

    with detection_graph.as_default():
        with tf.Session(graph=detection_graph) as sess:
            count = 0
            for image_path in TEST_IMAGE_PATHS:
                image = Image.open(image_path)
                # the array based representation of the image will be used later in order to prepare the
                # result image with boxes and labels on it.
                image_np = load_image_into_numpy_array(image)
                # Expand dimensions since the model expects images to have shape: [1, None, None, 3]
                image_np_expanded = np.expand_dims(image_np, axis=0)
                image_tensor = detection_graph.get_tensor_by_name('image_tensor:0')
                # Each box represents a part of the image where a particular object was detected.
                boxes = detection_graph.get_tensor_by_name('detection_boxes:0')
                # Each score represent how level of confidence for each of the objects.
                # Score is shown on the result image, together with the class label.
                scores = detection_graph.get_tensor_by_name('detection_scores:0')
                classes = detection_graph.get_tensor_by_name('detection_classes:0')
                num_detections = detection_graph.get_tensor_by_name('num_detections:0')
                # Actual detection.
                (boxes, scores, classes, num_detections) = sess.run(
                  [boxes, scores, classes, num_detections],
                  feed_dict={image_tensor: image_np_expanded})
                # Visualization of the results of a detection.

                result[count] ={}
                print 'Processing frame '+ str(count) + '/' + str(len(TEST_IMAGE_PATHS))
                temp_classes = np.squeeze(classes).astype(np.int32)

                for i in range (min(no_objects_detected, np.squeeze(boxes).shape[0])):
                    if temp_classes[i] in category_index.keys():
                        class_name = str(category_index[temp_classes[i]]['name'])
                        temp_score = int(100*np.squeeze(scores)[i])
                        #print class_name + ": " + str(int(100*np.squeeze(scores)[i]))
                        if class_name in result[count]:
                            if temp_score > result[count][class_name]:
                                result[count][class_name] = temp_score
                        else:
                            result[count][class_name] = temp_score
                #print " "
                count += 1

                # vis_util.visualize_boxes_and_labels_on_image_array(
                #   image_np,
                #   np.squeeze(boxes),
                #   np.squeeze(classes).astype(np.int32),
                #   np.squeeze(scores),
                #   category_index,
                #   use_normalized_coordinates=True,
                #   line_thickness=8)
                # plt.figure(figsize=IMAGE_SIZE)
                # plt.imshow(image_np)
                # plt.show()
    return result



if __name__ == '__main__':
    model_name = 'ssd_inception_v2_coco_11_06_2017'
    frame_path = './input_videos/frames'
    frame_name = [file for file in os.listdir(frame_path) if file.endswith('.jpg')]
    process(frame_path, frame_name, model_name)
