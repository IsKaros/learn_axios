/*
 * @Author: your name
 * @Date: 2019-12-31 09:45:59
 * @LastEditTime : 2020-02-04 17:41:10
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \axios\axios\lib\axios.js
 */
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios'); // axios构造函数
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  // 为什么要这么做？context肯定是有request这个方法的呀
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  // 把axios上面的原型拷贝到instance上
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  // 把context拷贝到原型上面
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
// 将Axios类暴露，以允许类继承
axios.Axios = Axios;

// Factory for creating new instances
// create方法，工厂模式
// eg:var ajax = axios.create()
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
// 暴露cancel和cancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all / spread
// 暴露all和spread
// 问题来了：
// 可以var ajax = axios.create()
// 然后 ajax.all(promise)吗

axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
// 允许TS的默认引入用法
module.exports.default = axios;