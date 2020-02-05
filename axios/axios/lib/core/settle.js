/*
 * @Author: your name
 * @Date: 2019-12-31 09:45:59
 * @LastEditTime : 2020-01-01 17:53:22
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \axios\axios\lib\core\settle.js
 */
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // 这个validateStatus是怎么去到config里面的，是自动生成的？还是ajax对象默认的？
  // 判断response.config.validateStatus，如果是值必须存在，如果是函数，则用于验证response.status是否有效。
  // 有效才resolve
  // 无效就抛出一个被增强过的Error对象，该对象可以获取到请求内容和响应内容
  if (!validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};