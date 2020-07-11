## 目標
node.jsとsocket.ioを使ってお絵描きチャットを作る。
開発は今までvagrand上のubuntuで行っていたが仮想環境での開発はひと手間かかる事と
Expressのシンプルなサーバ機能を使うためWindows上でVSCode使いながら行う。

デプロイ先はherokuとする。
クレカ未登録での無料時間は毎月550時間。  
webアプリは5個まで。  
30分無稼働でスリープ。  
https://jp.heroku.com/free

お絵描きチャットはさんざん他のサービスで遊ばせてもらって
いつか自分でも作れたらと思っていたので
動いたら感動すると思う。

---

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

>! [remote rejected] master -> master (pre-receive hook declined)
error: failed to push some refs to >'https://git.heroku.com/majestic-biscayne-71255.git'

`heroku logs`  

>!     No default language could be detected for this app.
>			HINT: This occurs when Heroku cannot detect the buildpack to use  for this application automatically.
>			See https://devcenter.heroku.com/articles/buildpacks
> !     Push failed

言語がわからんと言ってる。
そういえばnpm initしてない。

`npm init`  
`npm install socket.io`  
`npm install express`  

`git add.`  
`git commit -m 'install socket.io, express'`

`git push heroku master`

ブラウザで見てみる  
https://majestic-biscayne-71255.herokuapp.com/  

エラー

>Application error
>An error occurred in the application and your page could not be served. If you are the application owner, check your logs for details. You can do this from the Heroku CLI with the command
>heroku logs --tail

`heroku logs`

>2020-07-05T02:58:53.944819+00:00 heroku[web.1]: State changed from crashed to starting
2020-07-05T02:58:56.672936+00:00 heroku[web.1]: Starting process with command `npm start`
2020-07-05T02:59:03.791120+00:00 app[web.1]: npm ERR! missing script: start
2020-07-05T02:59:03.807903+00:00 app[web.1]:
2020-07-05T02:59:03.808513+00:00 app[web.1]: npm ERR! A complete log of this run can be found in:
2020-07-05T02:59:03.808825+00:00 app[web.1]: npm ERR!     /app/.npm/_logs/2020-07-05T02_59_03_800Z-debug.log
2020-07-05T02:59:03.872981+00:00 heroku[web.1]: Process exited with status 1
2020-07-05T02:59:03.926009+00:00 heroku[web.1]: State changed from starting to crashed

package.json に
`"start": "node index.js",`
を追加

`git add .`  
`git commit -m ''`  
`git push heroku master`

`heroku open`

動いた。  
感動。  

---

## 機能追加

ここからサンプルを改変する。  
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
cssについてはあらためてきちんと学習する必要を痛感。
クリアボタンなどの誤操作すると影響が大きいボタンを発言ボタンなど頻度の高いコントロールから離すなど誤操作が起きない配置を工夫。
色の組み合わせのセンスがない。カラーチャートサイトなどを参考にする。
嫁や他人からの評価はUIデザインに集中した。
中身がスマートだろうがボロクソだろうが
正常に動作している限りはユーザの評価はUIの比重が強い。
開発者的には機能先行になりがちだがUI重要。

### タッチ対応

タッチ操作ではclientXのみでoffsetXが取得できない為、
ウインドウとキャンバス要素から計算してoffset値を取得。
またtouchcancel、touchendのタッチ離脱イベントではe.touches[0]が取得できないためエラー。
サンプルでもエラー吐いているが後続処理がなく実用上の問題になっていないため放置されているようだ。
今回はoffset値取得で問題となるためif (e.touches) { return false };できちんと処理を中断させる。
ダブルタップ時に画面が拡大されてしまうのでcssのtouch-action: manipulation;でダブルタップ無効化。
チャットが伸びてスクロールバーが発生するとタッチで描画する際に画面スクロールも同時発生するようになる為、
キャンバスでのタッチ操作を無効化。onMouseDownのe.preventDefault()。

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

---

## デプロイしてタッチデバイス実機で確認

タッチ操作はChromeのエミュレータで確認していたが
ここでherokuにデプロイし、実機で確認する。
様々な問題が発生。

### ユーザリストのユーザの高さが合わない
Windowsではフォントの高さが揃っていたがiOSでは英数字と漢字で高さが異なる為、名前によって箱の大きさが変わっていた。cssのline-height指定で解決。

### ボタンクリックした後に色が戻らない

cssで:hoverで指定していたがスマホでタッチするとhoverしっぱなしになる。:active指定に変更。

### inputにフォーカスするとzoomしてしまう。

iOSではfont-size:16px未満だとフォーカス時に画面ズームされる。発言し終わっても画面がズームしたままとなるため、UXがよくない。解決策は16px以上に設定との事だがretina考慮しデバイスピクセル比2倍の32px指定したがズームが発生した。段階的に試した結果、42px以降でズームが発生しなくなった。なぜ42pxなのかはわからないが、暫定対応とする。

### 画面をスクロールした状態でタッチのoffsetがきちんと取れていない

window.pageYOffset不要だった。

```
e.touches[0].clientY - window.pageYOffset - rect.top
```
↓
```
e.touches[0].clientY - rect.top
```

### input外をクリックした時フォーカスを外してキーボードを閉じたい

inputにフォーカスがあたると画面が下にズレ、キーボードが表示される。
input外をタッチしてキーボードを閉じられるようにしたい。
下記の方法で出来た。

```
document.addEventListener('click', () => {});
```

下記のようにblurを使う必要があるかと思ったが不要だった。

```
document.addEventListener('click', () => {
  if (document.activeElement !== send_text) {
    send_text.blur();
  }
```

キーボードは閉じられたが画面は下に降りたままでキャンバスが見えないので
同時に画面一番上までスクロールする。

```
document.addEventListener('click', () => { scrollTo(0, 0); });
```

### クライアントがスリープなどで切断された時にクライアント自身に切断された事を通知されない

スリープ復帰しても描けてしまうため、クライアントがサーバと切断している事に気づけない。ハートビートなどを実装する必要あり？次回のIssue。
※socket.on('disconnect')で拾えた。対応済み。

### 前回のログイン情報を保持

名前入力時に前回入力した名前を引き継ぐ。
sessionStorageを使う。次回のIssue。

### プレイヤーの名前の重複を防ぐ

暫定対応としてGuestにはミリ秒を事前に振る。
再帰で同名いたら番号振る。次回のIssue。

### タッチデバイスで実機確認方法

実機確認するために何度もデプロイしてリポジトリを汚してしまった。
同じネットワーク内であればip:portでアクセスして確認できる。

---

## 公開

最低限の動作確認ができたので言語学習者の集まるSNS、HelloTalkで公開し
可能であればフィードバックを貰う。

## 公開後

問題発生。
接続時の名前入力にprompt使用しているが。
HelloTalk内のブラウザはpromptが出ない。
正常系ではありえない想定だった名前なしで接続された状態で操作されるとnameを参照しに行く処理でundefinedエラーが発生し
そのままサーバプロセスがこける。

名前入力の画面を新たに用意して対応。
サーバごと落ちる件nameを参照しに行く箇所にtry~catchと
process.on('uncaughtException')で対応。

アプリを再起動  
`heroku ps:scale web=0`  
`heroku ps:scale web=1`

---

## 微修正

### タッチデバイスか判定し操作を変える

スマホを考慮し、画面タッチでソフトキーボードを閉じて
画面上部までスクロールし、キャンバスに画面を戻す動きにしていたが
PCでは不要な為、クライアントがタッチデバイスかどうか判断して動きを変える。

```
    function isTouchDevice() {
        return ('ontouchstart' in document) && ('orientation' in window)
    }
```

### 描画ログを保持

途中参加のクライアントはまっさらなキャンバスからスタートで
それ以前に描かれていた絵が見られなかった。
サーバ側で描画ログを保持し、クライアント接続時にそれまでに描かれた絵を再生するよう修正。

### ボタンをdivタグからbuttonに変更

HelloTalk内ブラウザで文章をクリックすると翻訳が出てきてしまう。
このためボタンが押しづらい。ボタンに変更する。

### IssueをGitHubのIssuesで管理

https://github.com/mgningithub/eChat/issues

### 描画ログを永続化させる

herokuは30分無稼働だとプロセスを停止させる。
描画ログをサーバーのメモリで持つ為、停止されると描画ログが消える。
間をあけてアクセスすると先人の絵が見られない。
外部ファイルに記憶し永続化させたい。

永続化はRedisなどのDBを使用すべきだろうが
今回はJSONの外部ファイルとする。
ファイルIOを減らす為に切断時に描画ログ保存、
1人目のクライアントに対して描画ログをファイルから読み込み、
2人目以降はサーバーのメモリにある描画ログを使用する。

デプロイし、再起動を試したがログが反映されない。
herokuではファイル書き込みができず、永続化はDBかS3など外部ストレージを使う必要があるらしい。引き続き課題とする。

### Redis導入

導入までは下記
https://github.com/mgningithub/test-redis/blob/master/memo.md

git cloneでリモートにリポジトリコピーして修正

localhost:3000でアクセスできるようになるのはWSL2以降。
WSLではhttp://192.168.11.6:3000/とipで指定。


