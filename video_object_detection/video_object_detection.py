import argparse
import os.path
if os.path.basename(os.getcwd()) != 'video_object_detection':
    os.chdir('../video_object_detection/')
from extract_frames import extract
from process_image import process
from pymongo import MongoClient

#Parse argument
parser = argparse.ArgumentParser()
parser.add_argument("-p", dest="video_path",
                    help="input video path", default='/Users/banzhiyong/final_project/data/MSVD/YouTubeClips')
parser.add_argument("-n", dest="video_file_name", nargs='+',
                    help="input video file name", default='_O9kWD8nuRU_50_56.avi')
parser.add_argument("-fp", dest="video_full_path",
                    help="input video full path")
args = parser.parse_args()

print args.video_file_name

if args.video_full_path == None:
    video_full_path = os.path.join(args.video_path, args.video_file_name[0])
else:
    video_full_path = args.video_full_path

print video_full_path

#extract frames from video
extract_fps = 4
frame_path = './input_videos/frames'
frame_name, frame_indices, frame_count, fps, duration = extract(video_full_path, frame_path, extract_fps)

#object detection for each frames
model_name = 'ssd_inception_v2_coco_11_06_2017'
result = process(frame_path, frame_name, model_name)

#Clean frame files
video_file_name = os.path.basename(video_full_path)
video_file_basename = os.path.splitext(video_file_name)[0]
video_file_ext = os.path.splitext(video_file_name)[1]
remove_files = [i for i in os.listdir(frame_path) if i.startswith(video_file_basename) and i.endswith('.jpg')]
for i in remove_files:
    os.remove(os.path.join(frame_path, i))


# Select labels for each second of the video
total_no_frame = extract_fps*duration
objects = {}
retain_prob = 70

for i in range(int(duration)):
    base = i*extract_fps
    objects[i] = {}
    for key in result[base]:
        objects[i][key] = result[base][key]
        for offeset in range(1, extract_fps):
            if key in result[base+offeset]:
                objects[i][key]+= result[base+offeset][key]
            else:
                objects[i].pop(key, None)
                break
        if key in objects[i]:
            if objects[i][key]/extract_fps < retain_prob:
                objects[i].pop(key, None)

#Find all labels exist in the video
all_labels =[]
for i in range(int(duration)):
    for key in objects[i]:
        if key not in all_labels:
            all_labels.append(key)
print all_labels

# Reformatting labels and insert them to db
# labels_for_db = [{'label': , 'start_time': , 'end_time': }, {}, ....]
# Elements in this LIST are ranked by 'start_time'
labels_for_db = []
for i in range(int(duration)):
    if 'detectedBefore' in objects[i]:
        continue
    elif objects[i] == {}:
        current_label = {'label': 'NoObject', 'start_time': i, 'end_time': i+1}
        count = 1;
        while(i+count<int(duration) and objects[i+count]=={}):
            objects[i+count]['detectedBefore'] = True
            count += 1
        current_label['end_time'] = i+count
        labels_for_db.append(current_label)
    else:
        for key in objects[i]:
            current_label = {'label': key, 'start_time': i, 'end_time': i+1}
            count = 1
            while(i+count<int(duration) and (key in objects[i+count])):
                objects[i+count].pop(key, None)
                if objects[i+count] == {}:
                    objects[i+count]['detectedBefore'] = True
                count += 1
            current_label['end_time'] = i+count
            labels_for_db.append(current_label)

print '==================================================================='
print labels_for_db

client = MongoClient('mongodb://localhost:27017/')
db = client.video_objects
collection = db.videos

toDB = {"v_name": video_file_basename, "format": video_file_ext, "duration": duration, "frame_count": frame_count, "fps": fps, "all_labels": all_labels, "specific_labels": labels_for_db}
collection.insert_one(toDB)
