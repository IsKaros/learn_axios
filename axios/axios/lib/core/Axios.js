/*
 * @Author: your name
 * @Date: 2019-12-31 09:45:59
 * @LastEditTime : 2020-02-04 17:19:12
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \axios\axios\lib\core\Axios.js
 */
'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

/**
 * Create a new instance of Axios
 * Axios构造函数
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 * request方法
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  // 允许 axios('example/url'[,config]) 类fetch api用法
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }
  // 合并配置项
  config = mergeConfig(this.defaults, config);
  config.method = config.method ? config.method.toLowerCase() : 'get';

  // Hook up interceptors middleware
  // 连接到拦截器中间件
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  // 请求拦截器的fulfilled,rejected、
  // 形成的结构：
  // [interceptor2.fulfilled, interceptor2.rejected, interceptor1.fulfilled, interceptor1.rejected, dispatchRequest, undefined]
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });
  // 响应拦截器的fulfilled,rejected
  // 形成的结构：
  // [interceptor1.fulfilled, interceptor1.rejected, dispatchRequest, undefined,
  // responseInter1.fulfilled, responseInter1.rejected, responseInter2.fulfilled, responseInter2.rejected]
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });
  // 只要chain还有东西，就一直删(shift),然后删掉的那个作为resolve/reject回调，
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }
  // 为什么要这么做？
  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  // 构建完整的Uri
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
// 为以下不需要data传参的方法(delete,get,head,options)提供别名
// 可以使用 axios().get()形式
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function (url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});
// 为(post,put,patch)提供别名
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function (url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;