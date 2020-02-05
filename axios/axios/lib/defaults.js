'use strict';
// 应该是默认配置文件
var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

// 默认的content-type
var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};
// 如果还没有content-type就给一个content-type
function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}
// 默认适配器
function getDefaultAdapter() {
  var adapter;
  // Only Node.JS has a process variable that is of [[Class]] process 只有当Node.js有一个进程变量是process类实例化出来的
  if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    // 如果是node,就用node的适配器(如果处在node的环境中就用node的http服务)
    adapter = require('./adapters/http');
  } else if (typeof XMLHttpRequest !== 'undefined') {
    // 如果是浏览器就是用 XHR 适配器(处在浏览器的环境中就使用XMLHttpRequest对象)
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(), // 使用默认的适配器
  // transformRequest:一个数组，只有一个元素，transformRequest方法
  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    // 某些特定的类型直接返回
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    // ArrayBufferView返回data.buffer
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    // 如果是URLSearchParams类型的话，要设置content-type,并且返回的是字符串形式
    // 为什么URLSearchParams就要设置content-type为 'application/x-www-form-urlencoded;charset=utf-8'

    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    // 如果data是对象设置content-type，并且返回的是json字符串
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],
  // 转化响应头
  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    // 如果响应的数据是字符串，默认为json字符串，json.parse()进行转化
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        /* Ignore */
      }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  //`validateStatus` 
  // 定义对于给定的HTTP 响应状态码是 resolve 或 reject promise。
  // 如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，promise 将被 resolve; 否则，promise 将被 reject
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};
// 默认的请求头
defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};
// delete,get,head方法默认没有配置
utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});
// post,put,patch方法中content-type为application/x-www-form-urlencoded
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;