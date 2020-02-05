/*
 * @Author: your name
 * @Date: 2019-12-31 09:45:59
 * @LastEditTime : 2020-02-03 18:54:45
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \axios\axios\lib\core\mergeConfig.js
 */
'use strict';

var utils = require('../utils');

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  // config：用于返回的最后配置
  var config = {};
  // 为什么是判断字符串的undefined而不是单纯的undefined？
  // 如果config2中url,method,params,data不是字符串的undefined，那么就传入到config中
  utils.forEach(['url', 'method', 'params', 'data'], function valueFromConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    }
  });
  // 对于headers,auth,proxy而言
  utils.forEach(['headers', 'auth', 'proxy'], function mergeDeepProperties(prop) {
    // 如果config2所对应的值中是一个对象
    if (utils.isObject(config2[prop])) {
      // 深度结合config1和config2所对应的值
      // 那么问题来了谁覆盖谁
      config[prop] = utils.deepMerge(config1[prop], config2[prop]);
    } else if (typeof config2[prop] !== 'undefined') {
      // 如果config2所对应的值不是字符串的undefined
      // 直接传入config
      config[prop] = config2[prop];
    } else if (utils.isObject(config1[prop])) {
      // config1中所对应的值是对象，那么config1所对应的值深度结合到config中
      config[prop] = utils.deepMerge(config1[prop]);
    } else if (typeof config1[prop] !== 'undefined') {
      // 如果config1所对应的值不是字符串的undefined
      // 直接传入config,如果该条件成立，那么前面的会被覆盖
      config[prop] = config1[prop];
    }
  });
  // 对于以下配置项
  utils.forEach([
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'maxContentLength',
    'validateStatus', 'maxRedirects', 'httpAgent', 'httpsAgent', 'cancelToken',
    'socketPath'
  ], function defaultToConfig2(prop) {
    // 如果config2所对应的值不是一个字符串的undefined
    // 那么传入config
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (typeof config1[prop] !== 'undefined') {
      // 如果config1所对应的值不是一个字符串的undefined
      // 那么传入config,如果该假设成立，上面假设成立的情况下，上面的所对应的值会被覆盖
      config[prop] = config1[prop];
    }
  });

  return config;
};