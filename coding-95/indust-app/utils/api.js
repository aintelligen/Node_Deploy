// var base = 'http://rap.taobao.org/mockjsdata/12789/api/'
// var base = 'http://127.0.0.1:1234/api/'

// mini.iblack7.com/api/ 是我个人的项目域名，如果你是本地预览的话，可以继续用这个 base url，如果是你自己部署到线上的话，需要你更换成自己的域名，同时，建议在这个之前，先把数据库中的图片资源，都下载上传到自己的云图床中，上传中可以按照下载后的文件名，设置上传的名称，如果云图床支持的话，这样等于你无缝的把域名切换了，同时，用到的静态资源都在你的域名下，而且所有的分类名啊，图片 ID 啊什么都没变化，如果上传后图片文件名变了，那么对应的 creations 表里面的所有文件名，你都需要同步修改一下，不然拿不到资源。

var base = 'https://mini.iblack7.com/api/'

module.exports = {
  signup: base + 'u/signup',
  verify: base + 'u/verify',
  categories: base + 'categories',
  creations: base + 'creations',
  creation: base + 'creation',
  pins: base + 'pins',
  pin: base + 'pin',
  comments: base + 'comments'
}
