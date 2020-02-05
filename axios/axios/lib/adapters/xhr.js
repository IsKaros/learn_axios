'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    // 判断data选项是不是formData类型，如果是那么由浏览器决定他的类型
    // 'PUT', 'POST', 和 'PATCH'这三个方法才用data传参
    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    // HTTP 基本验证
    // 如果config中有auth属性，那么就用该auth属性
    // 如果config没有auth属性，
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      // Authorization字段使用btoa转成base64编码
      // 为什么这么做？
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }
    // 从config中拿到方法和完整的路径
    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    // 设置请求超时时间
    request.timeout = config.timeout;

    // Listen for ready state
    // 监听readystatechange事件
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      // 如果使用文件协议，大多数浏览器都会返回的status属性都为0，尽管他是一个成功的请求
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      // 判断ajax对象是否有getAllResponseHeaders方法
      // 存在就执行方法，获取所有的响应头，然后进行转化，否则就返回null
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      // 传统ajax是怎么做的，这里又为什么要特地生成一个response对象
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };
      // 处理这个封装ajax的promise对象
      settle(resolve, reject, response);

      // Clean up request
      // 清除请求内容
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    // 处理浏览器请求取消 
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      // 清除请求内容
      request = null;
    };

    // Handle low level network errors
    // 出错的处理函数
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      // 清除请求
      request = null;
    };

    // Handle timeout
    // 请求超时的处理函数
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    // 添加xsrf头部，只有在标准浏览器环境下才能成功
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      // 只有当xsrfCookieName被传递的时候，并且(withCredentials为true或者请求的url和当前网站位于同一域名)
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;
      // 这个xsrfHeaderName也是要传的，也就是要使用xsrf必须xsrfHeaderName和xsrfCookieName都传
      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    // 给请求添加请求头
    // 使用ajax原生的setRequestHeader方法
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        // 如果data是undefined就删除content-type，用默认的
        // 所以经常会看到，get请求是无法改content-type的，因为，get请求的参数是通过params传递而不是通过data传递
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    // 原生的withCredentials属性
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    // 如果传递了响应头就也设置
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // 如果不兼容XMLHttpRequest Level 2
        // 那么XMLHttpRequest Level 2是什么？
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    // onDownloadProgress方法
    // 如果传递onDownloadProgress方法
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    // onUploadProgress方法
    // 如果传递了onUploadProgress方法，并且ajax存在upload属性
    // 什么时候ajax存在upload属性，兼容性？
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }
    // 如果cancelToken存在
    // 这个cancelToken是什么？，cancelToken.js的代码有点不懂
    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }
    // 如果没有传递data的话
    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};