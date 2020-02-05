/*
 * @Author: your name
 * @Date: 2019-12-31 09:45:59
 * @LastEditTime : 2020-02-03 17:58:56
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \axios\axios\lib\helpers\normalizeHeaderName.js
 */
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    // 如果名字既不等于normalizedName 并且双方全转大写之后也不相等的话，设置正确的key,把value给它
    // 然后把原来那个删掉
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};