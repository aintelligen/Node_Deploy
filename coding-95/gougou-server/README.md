### 项目介绍

本期一共 5 个项目

website-server  静态站点代码
movie-server    电影网站代码
wechat-server   微信公众号代码
gougou-server   狗狗说的服务器端代码

以及微信小程序前后端代码

indust-app    微信小程序前端源代码
indust-server  微信小程序服务器代码

其中 (http://coding.imooc.com/class/56.html)[gougou-server] 是慕课网收费课程，它是关于 React Native 来开发 App，以及开发 App 后台的项目。本课程是讲服务端部署，恰好这个 React Native App 是收费课程，所以根据课程交叉协议，只能将共同的部分，也就是 gougou-server 服务器端代码拿出来共享给购买了该课程的同学，gougou-app 的源代码不能放出来，请理解。

但是微信小程序，因为并没有推出配套课程，因此不违反这个协议，indust-app 和 indust-server 前后端代码都放出来，可以共享给大家。

### 跟进课程必知

对于很多新手同学，建议大家首先用自己开发的自己熟悉的项目来往线上部署，我提供的 5 个项目，你部署会有难度，除了 website-server/movie-server，其他 3 个项目，你未必熟悉，特别是 gougou-server/wechat-server，如果可能，还是建议先部署其他的项目，这两个先搁置，适当研究下源码结构和功能便可，如果确实感兴趣，可以后期本课程跟进后，再去购买学习这两个课程后，重新部署，这样也省时间。


### 运行前准备

wechat-server 下的 options.json
indust-server 下的 config/config.js
indust-app    下的 utils/api.js
gougou-server 下的 config/config.js

这几个项目都有自己的配置文件，需要你按照提示，先修改成你自己的以后，才能成功启动。

比如 wechat-server/options.json

```
{
  "port": 3004,
  "appID": "你的为你 appID",
  "appSecret": "你的微信 appSecret",
  "baseUrl": "http://你的微信配置地址/nodeport",
  "token": "你的微信 Token"
}

```

### 如何运行程序

MongoDB 版本可以多试几个，我共享这个项目的时候，本地版本是 3.4.1

本地 Node.js 版本都设置为 >= v6.10.0 的版本就行

所有项目都是可以直接

```
npm install
node app.js
```
来启动项目

而 indust-server 是小程序，需要特殊处理

1. 首先命令行进入到 indust-server 目录下执行 npm install
2. 输入以下命令，把本地数据导入：mongorestore -h 127.0.0.1:27017 -d indust-app ./data
3. node app.js 启动本项目
4. 命令行再切换到 indust-app 下执行 npm i && npm i wept -g
5. 输入 wept 启动小程序项目
6. 在 chrome 中打开 http://127.0.0.1:3000，同时 chrome 启动开发者工具，点击设备图标切换到移动端调试模式，再刷新一下就好了

