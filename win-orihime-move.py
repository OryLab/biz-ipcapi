import json, struct
from threading import Timer

pipeName = "\\\\.\\pipe\\orihime_ipcapi"
firstPosition = {
  "type": "move-all",
  "data": {
    "head": {
      "yaw": 0.5, "pitch": 0.5
    },
    "rarm": {
      "roll": 0.86, "pitch": 0.1
    },
    "larm": {
      "roll": 0.86, "pitch": 0.1
    }
  }
};
headUp = {
  "type": "move",
  "data": {
    "part": 'head-pitch', "value": 0.9
  }
};
headDown = {
  "type": "move",
  "data": {
    "part": 'head-pitch', "value": 0.1
  }
};

wf = open(pipeName, 'wb', 0)

def writePipeJson(obj):
  text = json.dumps(obj)
  wf.write(struct.pack('I', len(text)))
  wf.write(text)
  print "write: " + text

writePipeJson(firstPosition)

odd = True
def moving(odd):
  if odd:
    writePipeJson(headUp)
  else:
    writePipeJson(headDown)
  odd = not odd
  Timer(2.0, moving, args=[odd]).start()
Timer(2.0, moving, args=[odd]).start()
