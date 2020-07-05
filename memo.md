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

