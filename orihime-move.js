const net = require('net');
const IS_WIN = /^win/.test(process.platform);

// パイプないしソケット名の定義：MacかWinかで変更する
const PIPE_NAME = 'orihime_ipcapi'
let PIPE_PATH = '\\\\.\\pipe\\' + PIPE_NAME;
if(!IS_WIN){
  PIPE_PATH = '/tmp/' + PIPE_NAME;
}

// JSON群
const firstPosition = {
  type: "move-all",
  data: {
    head: {
      yaw: 0.5, pitch: 0.5
    },
    rarm: {
      roll: 0.86, pitch: 0.1
    },
    larm: {
      roll: 0.86, pitch: 0.1
    }
  }
};
const runMotion = {
  type: "motion",
  data: {
    index: 0
  }
};
const headUp = {
  type: "move",
  data: {
    part: 'head-pitch', value: 0.9
  }
};
const headDown = {
  type: "move",
  data: {
    part: 'head-pitch', value: 0.1
  }
};

// IPCの接続
const client = net.connect( PIPE_PATH, ()=>{
  console.log('Client: on connection');
});

// 受信処理
client.on('data', (data) =>{
  console.log('Client: on data:', data.toString());
  json = JSON.parse(data);
  if(json.status == "start talk"){
  }else if(json.status == "end talk"){
    process.exit()
  }
});

// 送信処理
client.write(JSON.stringify(firstPosition));
setTimeout(()=>{
  client.write(JSON.stringify(runMotion));

  let odd = true
  setInterval(()=>{
    if(odd){
      client.write(JSON.stringify(headDown));
    }else{
      client.write(JSON.stringify(headUp));
    }
    odd = !odd;
  }, 2000);

}, 2000);
