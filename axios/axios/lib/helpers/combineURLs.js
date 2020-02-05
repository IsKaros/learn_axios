/*
 * @Author: your name
 * @Date: 2019-12-31 09:45:59
 * @LastEditTime : 2020-02-03 18:17:06
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings 
 * @FilePath: \axios\axios\lib\helpers\combineURLs.js
 */
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 * 合成新的url，relativeURL存在就把baseURL和relativeURL中的‘/’清除，再用‘/’连接，不存在就直接返回baseURL
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  // 这个replace替换baseURL结尾斜杆，relativeURL开头的斜杆
  return relativeURL ?
    baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') :
    baseURL;
};