'use strict';

var utils = require('./../utils');
// 判断发出请求的路径的域名是否和浏览器的域名位于同一域名
module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
     * Parse a URL to discover it's components
     *
     * @param {String} url The URL to be parsed
     * @returns {Object}
     */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        // IE浏览器居然需要设置两次属性才能正常获取DOM对象(a)的属性？
        // 通过把a标签获取到完整的url路径
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      // 获取到这个路径，把他放到a标签上，看会被解析成什么样的完整路径
      // 返回的这个对象的所有属性在location中都可以找到
      return {
        href: urlParsingNode.href, // 完整路径
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '', // 协议
        host: urlParsingNode.host, // 域
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '', // 参数
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '', // 哈希戳后的内容
        hostname: urlParsingNode.hostname, // 域名
        port: urlParsingNode.port, // 端口
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
          urlParsingNode.pathname : '/' + urlParsingNode.pathname
      };
    }
    // 直接拿当前页面的路径解析
    originURL = resolveURL(window.location.href);

    /**
     * Determine if a URL shares the same origin as the current location
     *
     * @param {String} requestURL The URL to test
     * @returns {boolean} True if URL shares the same origin, otherwise false
     */
    // 判断api路径和当前的浏览器地址是否共享一个源
    // 先转化，如果是字符串，那么就解析这个字符串的，
    // 判断转化后的路径的协议和域名是否和当前页面的路径的协议和域名完全相等
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
        parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  // 非标准浏览器环境，web worker/RN,缺乏支持，直接返回一个会返回true的函数
  // 如果web worker缺乏支持的话，那么在web worker里面要怎么发起请求，原生？
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);