'use strict';

/**
 * Creates a new URL by combining the specified URLs
 * 合成新的url，relativeURL存在就把baseURL和relativeURL中的‘/’清除，再用‘/’连接，不存在就直接返回baseURL
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};
