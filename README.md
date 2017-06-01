> 在 webpack 打包流中替换内容

在 webpack 打包过程的 emit 和 done 阶段，对指定后缀名的文件，进行文本替换

## 安装

```shell
npm i mx-webpack-content-replace-plugin --save-dev
```

### webpack

**Require `mx-webpack-content-replace-plugin`**
```javascript
var mxWebpackContentReplacePlugin = require('mx-webpack-content-replace-plugin')
```
添加这个插件到你的插件列表

#### 不指定path选项，默认是 emit 触发
```javascript
var config = {
  plugins: [
    new mxWebpackContentReplacePlugin({
      src: /\/assets/g,
      dest: 'assets',
      exts: ['html', 'js', 'json']
    })
  ]
}
```

#### 指定path选项，默认是 done 触发
```javascript
var config = {
  plugins: [
    new mxWebpackContentReplacePlugin({
      src: /\/assets/g,
      dest: 'assets',
      exts: ['html', 'js', 'json'],
      path: 'F:/xxx/xxx/'
    })
  ]
}
```

### 配置项

#### src
- Type: `String` || `RegExp`
- Default: 没有默认值
- Required: true

用于指定被替换的部分

#### dest
- Type: `String`
- Default: 没有默认值
- Required: true

用于指定用来替换的内容

#### exts
- Type: `Array<String>`
- Default: 没有默认值
- Required: true

#### path
- Type: `String`
- Default: ''
- Required: false

用于指定要替换某文件下指定的文件， 如果设置了path, 则在 done 时触发
