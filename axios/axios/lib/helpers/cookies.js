/*
 * @Author: your name
 * @Date: 2019-12-31 09:45:59
 * @LastEditTime : 2020-01-01 18:03:44
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \axios\axios\lib\helpers\cookies.js
 */
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  // 只有标准的浏览器环境才支持document.cookie
  // 返回一个对象，
  (function standardBrowserEnv() {
    return {

      /**
       * @description: write方法：添加cookie
       * @param name {type} cookie名 
       * @param value {type} cookie值
       * @param expires {type} cookie过期时间
       * @param path {type} cookie的路径
       * @param domain {type} cookie的域名
       * @param secure {type} secure字段
       * @return: 
       */
      // cookie居然有这么字段/属性，这些属性是怎么来的？
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));
        // 过期时间是个数字
        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }
        // 路径是给字符串
        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }
        // 域名是字符串
        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }
        // secure等于true
        if (secure === true) {
          cookie.push('secure');
        }
        // 直接覆盖？
        document.cookie = cookie.join('; ');
      },
      // read方法：获取cookie的值
      // 正则匹配cookie
      // 如果获取到了cookie就返回，没有这个cookie就返回null
      read: function read(name) {
        // 解析cookie的函数/(^|;\\s*)( name )=([^;]*)'/
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        // 为什么match[3]，字符串的match方法的结果是什么？

        return (match ? decodeURIComponent(match[3]) : null);
      },
      // remove方法：函数方法
      // 直接让某个cookie过期
      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  // 非浏览器的标准环境
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() {
        return null;
      },
      remove: function remove() {}
    };
  })()
);