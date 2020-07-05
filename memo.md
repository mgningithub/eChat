## 目標
node.jsとsocket.ioを使ってお絵描きチャットを作りたい。
開発は今までvagrand上のubuntuで行っていたが仮想環境は正直面倒くさいし
nodeなのでWindows上でVSCode使いながら行う。

デプロイ先はherokuとする。
クレカ未登録での無料時間は毎月550時間。  
webアプリは5個まで。  
30分無稼働でスリープ。  
https://jp.heroku.com/free

お絵描きチャットはさんざん他のサービスで遊ばせてもらって
いつか自分でも作れたらと思っていたので
動いたら感動すると思う。

## node.jsアップデート
インストーラダウンロードし実行  
エラー発生。  

>The installer has Insufficient privileges to access...

vsCode起動していた。終了してOS再起動して再インストール。  
`node -v`

## githubへコミット

### .gitignore作成(local)

### リポジトリ作成(github)
git@github.com:mgningithub/eChat.git

### リポジトリ作成(local)

git init  
git add .  
git commit -m "first commit"  
git remote add origin git@github.com:mgningithub/eChat.git  
git push -u origin master  

## Heroku デプロイ

### CLIインストール
https://qiita.com/shti_f/items/b4b5d830672d908eff4e

`heroku login`  
`heroku create`  
https://majestic-biscayne-71255.herokuapp.com/
https://git.heroku.com/majestic-biscayne-71255.git

`git push heroku master`  
失敗した

---

! [remote rejected] master -> master (pre-receive hook declined)
error: failed to push some refs to 'https://git.heroku.com/majestic-biscayne-71255.git'

---

`heroku logs`  

---

!     No default language could be detected for this app.
			HINT: This occurs when Heroku cannot detect the buildpack to use  for this application automatically.
			See https://devcenter.heroku.com/articles/buildpacks
 !     Push failed

---

言語がわからんと言ってる。
そういえばnpm initしてない。

npm init  
npm install socket.io  
npm install express  

git add.
git commit -m 'install socket.io, express'

git push heroku master

ブラウザで見てみる  
https://majestic-biscayne-71255.herokuapp.com/  

エラー

---

Application error
An error occurred in the application and your page could not be served. If you are the application owner, check your logs for details. You can do this from the Heroku CLI with the command
heroku logs --tail

---

heroku logs

---
2020-07-05T02:58:53.944819+00:00 heroku[web.1]: State changed from crashed to starting
2020-07-05T02:58:56.672936+00:00 heroku[web.1]: Starting process with command `npm start`
2020-07-05T02:59:03.791120+00:00 app[web.1]: npm ERR! missing script: start
2020-07-05T02:59:03.807903+00:00 app[web.1]:
2020-07-05T02:59:03.808513+00:00 app[web.1]: npm ERR! A complete log of this run can be found in:
2020-07-05T02:59:03.808825+00:00 app[web.1]: npm ERR!     /app/.npm/_logs/2020-07-05T02_59_03_800Z-debug.log
2020-07-05T02:59:03.872981+00:00 heroku[web.1]: Process exited with status 1
2020-07-05T02:59:03.926009+00:00 heroku[web.1]: State changed from starting to crashed

---

package.json に
`"start": "node index.js",`
を追加

git add .  
git commit -m ''  
git push heroku master  

heroku open

動いた。  
感動。  

---

## 機能追加

ここからサンプルの改変する。  
サンプルは全画面キャンバスで絵チャットができる単機能であり  
キャンバスサイズがウインドウサイズと同一なため、ユーザによりサイズが合わない。  
またウインドウサイズを変更すると変更したクライアントのみキャンバスがクリアされるなど
あくまで最低限動作を確認できるサンプルで実用的ではない。  

ここにキャンバスサイズの固定、UI作成、タッチ対応、文字のチャット、ユーザ管理、の機能を追加する。

### キャンバスサイズの固定

cssでキャンバスサイズを指定したが正しくお絵描きできない。
JS側のサイズの認識がCSSの指示ではなく、canvas要素デフォルトのサイズで認識しているように見える。
html側で直接canvasのサイズを指定。
サイズはスマホでも画面が大きくなるよう一旦900pxで指定。
理想はクライアント側は常に全画面表示で解像度に合わせてキャンバス描画の比率を調整だが
特に線の太さなどで割切れない比率になると異常が起こりそうな気がする。
丸めなどの調整でなんとかなる気もするが次回のIssueとする。

### UI作成

テキスト中央揃え、要素の右詰などで細かく時間を溶かす。
cssについては雰囲気でやってしまっているが一度きちんと学習する必要を痛感。
クリアボタンなどの誤操作すると影響が大きいボタンを発言ボタンなど頻度の高いコントロールから離すなど誤操作が起きない配置を工夫。
色の組み合わせのセンスがない。カラーチャートサイトなどを参考にする。
嫁や他人からの評価はUIデザインに集中した。
中身がスマートだろうがボロクソだろうが
正常に動作している限りはユーザの評価はUIに比例する。
開発者的には機能先行になりがちだがUIに投資する価値はある。

### タッチ対応

タッチ操作ではclientXのみでoffsetXが取得できない為、
ウインドウとキャンバス要素から計算してoffset値を取得。
またtouchcancel、touchendのタッチ離脱イベントではe.touches[0]が取得できないためエラー。
サンプルでもエラー吐いているが後続処理がなく実用上の問題になっていないため放置されているようだ。
自分の場合はoffset値取得で問題となるためif (e.touches) { return false };できちんと処理を中断させる。
ダブルタップ時に画面が拡大されてしまうのでcssのtouch-action: manipulation;でダブルタップ無効化。
チャットが伸びてスクロールバーが発生するとタッチで描画する際に画面スクロールも同時発生するようになる為、
キャンバスでのタッチ操作を無効化。onMouseDownのe.preventDefault()。
iOS実機でinputにフォーカスするとズームされる。font-size:16px以下で動く仕様。iPhoneのretinaなどはデバイスピクセル比が2倍。倍の32px設定する。

### 文字のチャット

sayのemit時、どういったデータで受け渡しするか2度ほど大きく変えた。
システムメッセージはダミーのユーザのオブジェクトで対応。リファクタリングの余地あり。

### ユーザ管理

server, client間のsocketの扱いを理解するのに時間がかかった。
具体的に言うとユーザの名前をサーバ側で持つのかクライアント側で持つのか悩んだ。
サーバ側で一元管理しJSONでユーザ情報を受け渡しする形とした。
clear時にsocket.idに対応した名前がplayersから取得できない、
disconnect時にsocket.idが2つ表示されるという現象が起きた。1ユーザで2接続あるように見えるため、chat.jsでmain.jsでそれぞれsocket=io();している事が原因と目星をつける。html側でchat.js,main.jsを呼び出す前にグローバルでconst socket = io();とする。やはり接続が2つ出て時間を溶かす。しばらく経つとコードは変えていないが、きちんと動くようになった。ブラウザ側のキャッシュがクリアされない事が原因だと思われる。プライベートモードなどで試す。
ユーザ背景色はランダムで個別に色を持つようにした。背景色となるため、淡い色でランダム生成するよう調整。

## 公開
