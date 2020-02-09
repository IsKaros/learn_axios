/*
 * @Author: your name
 * @Date: 2020-02-07 17:41:36
 * @LastEditTime : 2020-02-09 11:37:10
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \axios\lib\helpers\buildURL.js
 */
'use strict';

var utils = require('./../utils');

function encode(val) {
  // 浏览器会默认调用encodeURIComponent对URI进行编码，
  // 直接encode在把有用的字符replace成原来的字符
  return encodeURIComponent(val).
  replace(/%40/gi, '@').
  replace(/%3A/gi, ':').
  replace(/%24/g, '$').
  replace(/%2C/gi, ',').
  replace(/%20/g, '+').
  replace(/%5B/gi, '[').
  replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 * 构建完整的URL
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  // 没有参数就直接返回url
  if (!params) {
    return url;
  }
  // 如果传入了参数序列化函数，则序列号参数
  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) { // 如果没有序列化函数并且类型为URLSearchParams，则直接调用参数的toString方法
    serializedParams = params.toString();
  } else {
    var parts = []; // 如果都不满足

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }
      // a='abc'&b=[1,2,3]
      if (utils.isArray(val)) {
        key = key + '[]';
        // b=b[]
      } else {
        val = [val];
        // a=['abc']
      }
      // 遍历数值，转成字符串
      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        // 'a=[abc]','b[]=[1,2,3]'
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
    // a=[abc]&b[]=[1,2,3]
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    // 如果url里包含‘#’，那么删除前面url开头到#中间的内容
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    // 返回的url如果没有？那么就补上？，如果有了，说明本来的url已经有参数，那么用&连接
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};