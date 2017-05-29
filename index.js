'use strict';

module.exports = class MxContentReplaceWebpackPlugin {
  constructor(options) {
    if (MxContentReplaceWebpackPlugin.hasValidOptions(options)) {
      this.modificationSrc = options.src;
      this.modificationDes = options.dest;
      this.modificationExts = options.exts;

      this.buildTrigger = 'emit';
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

  apply(compiler) {
    compiler.plugin(this.buildTrigger, (compilation, callback) => {
      this.replace(compilation);
      callback && callback();
    });
  }
};
