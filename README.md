# IPC API for OriHime PC版コントローラアプリ

IPC API for OriHime PC版コントローラアプリは、通話中のOriHimeを外部ソフトウェアから制御するためのAPIです。

## 対応プラットフォーム
Windows, macOS  
それぞれのOSに対応した[OriHime PC版コントローラ 2.4.2以降](https://biz.orylab.com/#/download)。  
および、OriHimeによる通話の開始条件（OriHimeも必要です）。  
実行したい言語の実行環境が必要です。  

## できること
OriHimeを制御し、サーボモータの動作をコントロールします。

## できないこと
- 通話の開始、終了をコントロールすることはできません。（状態取得は可能です。対応予定）
- OriHime PC版コントローラアプリの代わりに通話を行うことはできません。

---

## API仕様
macOS, Windows環境共通です。  
送受信共にデータは全てJSON文字列によってやりとりされます。

### 接続

#### Windows
- IPC: 名前付きパイプ
- パイプ名: `orihime_ipcapi`

#### macOS
- IPC: Unixソケット
- ソケット: `/tmp/orihime_ipcapi`
- ポート番号なし

接続処理例: node.js
```
const net = require('net');
const IS_WIN = /^win/.test(process.platform);
const PIPE_NAME = 'orihime_ipcapi'
let PIPE_PATH = '\\\\.\\pipe\\' + PIPE_NAME;
if(!IS_WIN){
  PIPE_PATH = '/tmp/' + PIPE_NAME;
}

// 接続
const client = net.connect( PIPE_PATH, ()=>{
  console.log('Client: on connection');
});

// 制御送信
client.write(JSON.stringify(exampl_json));

// 受信
client.on('data', (data) =>{
  console.log('Client: on data:', data.toString());
  json = JSON.parse(data);
});
```

###  OriHime制御
OriHimeの動作をコントロールします。  
OriHimeには3つの部位と、それぞれに2つ、計6つのサーボモータがあります  

|Body part|servo|part-id|initial|note|
|---|---|---|
|head|yaw|head-yaw|0.5|首横方向|
|head|pitch|head-pitch|0.5|首縦方向|
|rarm|roll|rarm-roll|0.86|右腕横方向|
|rarm|pitch|rarm-pitch|0.1|右腕縦方向|
|larm|roll|larm-roll|0.86|左腕横方向|
|larm|pitch|larm-pitch|0.1|左腕縦方向|

OriHimeのサーボモータの角度はそれぞれが`0.0-1.0`の範囲で表現されます。  
制御APIはAPI種別を表す `type` と値を表す `data` のキーを持ちます。それぞれの `data` キー内にそれぞれ異なるデータを設定することでOriHimeを制御します。

#### サーボモータ動作API
- type: `move`
- data:
  - part: [part-id: string]
  - value: 0.0 - 1.0 [number]


例: 頭を縦に動かすJSON
```
{
  "type": "move",
  "data": {
    "part": 'head-pitch',
    "value": 0.9
  }
}
```

#### サーボモータ全動作API
- type: `move-all`
- data:
  - head:
    - yaw: 0.0 - 1.0 [number]
    - pitch: 0.0 - 1.0 [number]
  - rarm:
    - roll: 0.0 - 1.0 [number]
    - pitch: 0.0 - 1.0 [number]
  - larm:
    - roll: 0.0 - 1.0 [number]
    - pitch: 0.0 - 1.0 [number]

例: OriHimeを初期値へ設定するJSON
```
{
  "type": "move-all",
  "data": {
    "head": {
      "yaw": 0.5,
      "pitch": 0.5
    },
    "rarm": {
      "roll": 0.86,
      "pitch": 0.1
    },
    "larm": {
      "roll": 0.86,
      "pitch": 0.1
    }
  }
}
```

#### モーション発行API
- type: `motion`
- data:
  - index: 0-9[motion index: number]

例: 「はい」を実行するJSON
```
{
  "type": "motion",
  "data": {
    "index": 0,
  }
}
```

### ステータス受信
APIの利用に際して発生したいくつかの情報を受信することができます。  

- status: [status-code: string]
- message: [status-info: string]

|Status code|note|
|---|---|
|start talk|通話開始|
|end talk|通話終了|
|*-error|APIエラーが発生した場合、`-error`を含むエラー情報が発生します|

```

// 送信データのJSONバリデーションエラー
{
  "type": "json-parse-error",
  "message": "please send json-string"
}

// 通話開始
{
  "type": "start talk",
  "message": ""
}
```

---

## サンプルアプリケーション
それぞれ、PC版コントローラアプリを起動し、 **通話を開始した後** に実行してください。  
正常に動作すれば、通話中のOriHimeが首を上下に動かします。

### node.js

対応環境: macOS, Windows  
[node.jsのダウンロード](https://nodejs.org/en/download/)
```
  node orihime-move.jp
```

### Python (2.7)

対応環境: Windows  
[Pythonのダウンロード](https://www.python.org/downloads/)
```
  python win-orihime-move.py
```
