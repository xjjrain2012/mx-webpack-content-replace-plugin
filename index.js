'use strict';

const fs = require('fs');
const path = require('path');

module.exports = class MxContentReplaceWebpackPlugin {
  constructor(options) {
    if (MxContentReplaceWebpackPlugin.hasValidOptions(options)) {
      this.modificationSrc = options.src;
      this.modificationDes = options.dest;
      this.modificationExts = options.exts;
      this.path = options.path || '';
      this.buildTrigger = this.getBuildTrigger(options.buildTrigger);
    }
  }

  static hasRequiredParameters(options) {
    return Object.hasOwnProperty.call(options, 'src') &&
           Object.hasOwnProperty.call(options, 'dest') &&
           Object.hasOwnProperty.call(options, 'exts');
  }

  static hasValidOptions(options) {
    if (typeof options !== 'object') {
      return false;
    }

    return MxContentReplaceWebpackPlugin.hasRequiredParameters(options) && Array.isArray(options.exts) && options.exts.length > 0;
  }

  getBuildTrigger(trigger) {
    return trigger && ['done', 'emit'].indexOf(trigger) !== -1 ? trigger : this.path !== '' ? 'done' : 'emit';
  }

  replaceContent(src) {
    return src.replace(new RegExp(this.modificationSrc), this.modificationDes);
  }

  arrayBufferSourceHandle(src) {
    let str = String.fromCharCode.call(null, src);
    str = this.replaceContent(str);
    return Uint8Array.from(Array.from(str).map(o => o.charCodeAt(0)));
  }

  createAssetsFileObject(out) {
    return {
      source: function() { return out; },
      size: function() { return out.length; }
    };
  }

  replace(compilation) {
    let assetsKeys = Object.keys(compilation.assets).filter(key => {
      let arr = key.split('.');
      if (arr.length < 2) {
        return false;
      }
      return this.modificationExts.indexOf(arr.pop()) != -1 ? true : false;
    });
    console.log('filter assets by ext name: ', assetsKeys);
    assetsKeys.forEach(key => {
      let source = compilation.assets[key].source();
      let out = undefined;
      if (typeof source === 'string') {
        out = this.replaceContent(source);
      }
      if (typeof source === 'object') {
        out = this.arrayBufferSourceHandle(source);
      }
      if (out) {
        compilation.assets[key] = this.createAssetsFileObject(out);
      }
    });

  }

  getFileList (buildPath) {
    let ret = [];
    let files = fs.readdirSync(buildPath);
    files.forEach((item) => {
      let tempPath = path + item;
      let stat = fs.statSync(tempPath);
      if (stat.isDirectory()) {
        ret = ret.concat(this.getFileList(tempPath + '/'));
      } else {
          let ext = path.extname(tempPath);
          if (ext) {
              ext = ext.substr(1);
              if (this.modificationExts.indexOf(ext) !== -1) {
                  ret.push(tempPath);
              }
          }
              
      }
    });
    return ret;
  }

  replaceFile() {
    let files = this.getFileList(this.path);
    files.forEach((file) => {
        const str = fs.readFileSync(file, 'utf8');
        const out = this.replaceContent(str);
        fs.writeFileSync(file, out);
    });
  }

  apply(compiler) {
    if (this.buildTrigger === 'emit') {
      compiler.plugin('emit', (compilation, callback) => {
        this.replace(compilation);
        callback && callback();
      });
      return;
    }
    if (this.buildTrigger === 'done') {
      compiler.plugin('done', (compilation, callback) => {
        this.replaceFile();
        callback && callback();
      });
      return;
    }
      
  }
};
