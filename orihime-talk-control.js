const net = require('net');
const IS_WIN = /^win/.test(process.platform);

const KEY = '';
const SECRET = '';

// パイプないしソケット名の定義：MacかWinかで変更する
const PIPE_NAME = 'orihime_ipcapi'
let PIPE_PATH = '\\\\.\\pipe\\' + PIPE_NAME;
if(!IS_WIN){
  PIPE_PATH = '/tmp/' + PIPE_NAME;
}

// IPCの接続
const client = net.connect( PIPE_PATH, ()=>{
  console.log('Client: on connection');

});


// 送信処理ラッパー
const send = (json)=>{
  client.write(JSON.stringify(json));
};

// 通話コントロール関数
const startTalk = (orihime)=>{
  console.log('start talk with:', orihime.name);
  clearInterval(checkInterval);

  // 通話開始
  send({type:'talk-start', data:orihime.id});

  // 30病後に通話終了
  setTimeout(()=>{
    send({type:'talk-end', data:null});
  }, 1000*30);
};


// 認証
send({
  type: 'auth',
  data: {
    key: KEY, secret: SECRET
  }
});


// OriHime状態取得
const checkInterval = setInterval(()=>{
  send({
    type: 'get-orihimes', data: null
  });
}, 5000);


// 受信処理
client.on('data', (data) =>{
  console.log('on data:', data.toString());
  json = JSON.parse(data);

  // OriHimeリストであれば
  if(json.status == "orihimes"){
    for(let orihime of json.message){

      // 通話可能であれば通話コントロール関数を呼ぶ
      if(orihime.status){
        startTalk(orihime);
        break;
      }
    }

  }else if(json.status == "start talk"){
  }else if(json.status == "end talk"){
    process.exit()
  }
});
