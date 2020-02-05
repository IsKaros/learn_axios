'use strict';

var utils = require('./../utils');
// 为什么要专门提一下重复的头部在node中会被忽略的字段，难道axios是基于node实现？可如果是基于node实现的话，那么它是不会被跨域拦住的，但事实是它会被拦住
// 但反正他是基于node的标准实现的
// Headers whose duplicates are ignored by node 
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
// 对象的妙用
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]); // 为什么多个set-cookie就要一直添加，而不是覆盖
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val; // 其他的，如果键名存在就字符串形式屏节
      }
    }
  });

  return parsed;
};
