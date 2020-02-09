/*
 * @Author: your name
 * @Date: 2020-02-07 17:41:36
 * @LastEditTime: 2020-02-09 17:37:45
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \axios\lib\core\createError.js
 */

'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};