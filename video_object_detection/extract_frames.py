import sys
sys.path.append("/usr/local/lib/python2.7/site-packages")
import cv2
import os.path
import numpy as np

def extract(video_path, output_path, extract_fps):

    if not os.path.exists(video_path):
        print os.path.basename(video_path) + " not found"
        return

    #initialise video caption
    try:
        cap = cv2.VideoCapture(video_path)
    except:
        pass

    fps = cap.get(cv2.CAP_PROP_FPS)
    # Extract frames
    frame_list = []
    while True:
        ret,frame = cap.read()
        if ret is False:
            break
        frame_list.append(frame)

    frame_list = np.array(frame_list)
    frame_count = len(frame_list)
    duration = frame_count/fps

    print '==================================================================='
    print 'Video Info:'
    print 'fps: ' + str(fps)
    print 'duration: ' + str(duration)
    print 'frame_count: ' + str(frame_count)
    print '==================================================================='

    num_frames = int(extract_fps * duration)
    #Select num_frames from all the frames
    if frame_count > num_frames:
        frame_indices = np.linspace(0, frame_count-1, num=num_frames, endpoint=False).astype(int)
        frame_list = frame_list[frame_indices]

    i=0
    frame_name = []
    video_file_name = os.path.basename(video_path)
    video_file_name = os.path.splitext(video_file_name)[0]
    for frame_ in frame_list:
        filename =  video_file_name + '_frame_' + str(frame_indices[i])+ '.jpg'
        output_filepath = os.path.join(output_path, filename)
        frame_name.append(filename)
        cv2.imwrite(output_filepath, frame_)
        i+=1

    return frame_name, frame_indices, frame_count, fps, duration


if __name__ == '__main__':
    video_path = './input_videos/zzit5b_-ukg_5_20.avi'
    frame_path = './input_videos/frames'
    extract(video_path, frame_path)
