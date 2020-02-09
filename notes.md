## learn axios

自己阅读axios源码之后的笔记。

axios版本：0.19.0

## axios的目录

|-- axios
    |-- CHANGELOG.md
    |-- index.d.ts
    |-- index.js
    |-- LICENSE
    |-- package.json
    |-- README.md
    |-- UPGRADE_GUIDE.md
    |-- dist
    |   |-- axios.js
    |   |-- axios.map
    |   |-- axios.min.js
    |   |-- axios.min.map
    |-- lib
        |-- axios.js
        |-- defaults.js
        |-- utils.js
        |-- adapters
        |   |-- http.js
        |   |-- README.md
        |   |-- xhr.js
        |-- cancel
        |   |-- Cancel.js
        |   |-- CancelToken.js
        |   |-- isCancel.js
        |-- core
        |   |-- Axios.js
        |   |-- createError.js
        |   |-- dispatchRequest.js
        |   |-- enhanceError.js
        |   |-- InterceptorManager.js
        |   |-- mergeConfig.js
        |   |-- README.md
        |   |-- settle.js
        |   |-- transformData.js
        |-- helpers
            |-- bind.js
            |-- buildURL.js
            |-- combineURLs.js
            |-- cookies.js
            |-- deprecatedMethod.js
            |-- isAbsoluteURL.js
            |-- isURLSameOrigin.js
            |-- normalizeHeaderName.js
            |-- parseHeaders.js
            |-- README.md
            |-- spread.js

dist目录是打包后的结果，源码的部分只要看lib文件夹就可以了

 |-- lib
        |-- axios.js
        |-- defaults.js
        |-- utils.js
        |-- adapters
        |   |-- http.js
        |   |-- README.md
        |   |-- xhr.js
        |-- cancel
        |   |-- Cancel.js
        |   |-- CancelToken.js
        |   |-- isCancel.js
        |-- core
        |   |-- Axios.js
        |   |-- createError.js
        |   |-- dispatchRequest.js
        |   |-- enhanceError.js
        |   |-- InterceptorManager.js
        |   |-- mergeConfig.js
        |   |-- README.md
        |   |-- settle.js
        |   |-- transformData.js
        |-- helpers
            |-- bind.js
            |-- buildURL.js
            |-- combineURLs.js
            |-- cookies.js
            |-- deprecatedMethod.js
            |-- isAbsoluteURL.js
            |-- isURLSameOrigin.js
            |-- normalizeHeaderName.js
            |-- parseHeaders.js
            |-- README.md
            |-- spread.js

## 阅读顺序

以下顺序省略lib文件夹

1.core/axios.js -> util.js -> helpers/bind.js

2.helpers/bind.js -> util.js

3.core/axios ->  helpers/buildURL.js

4.core/axios -> core/interceptorManage.js

5.core/axios -> core/dispatchRequest.js

6.core/dispatchRequest.js -> core/transformData.js

7.core/dispatchRequest.js -> cancel/isCancel.js

8.core/dispatchRequest.js -> default.js

9.defaults.js -> helpers/normalizeHeaderName.js

10.default.js -> adapters/http.js

11.default.js -> adapters/xhr.js

12.adapter/xhr.js -> core/settle.js

13.core/settle.js -> core/createError.js

14.core/createError -> helpers/enhanceError.js

## bind.js

就是自己手写实现的一个bind函数

```javascript
function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
}

```



## util

util是一个非针对axios的工具函数文件。工具函数有：
+ isArray
+ isArrayBuffer
+ isBuffer
+ isFormData
+ isArrayBufferView
+ isString
+ isNumber
+ isUndefined
+ isObject
+ isDate
+ isFile
+ isBlob
+ isFunction
+ isStream
+ isURLSearchParams
+ isStandardBrowserEnv
+ forEach
+ merge
+ deepMerge
+ extend
+ trim
+ isBuffer(用`is-buffer`库)

### isNumber,isUndefined,isObject,isString

这四个函数主要使用`typeof`运算符进行判断，其中isObject需要排除为null的情况。

### isDate,isFile,isBlob,isFunction,isArrayBuffer,isArray

主要使用`Object.prototype.toString`配合`call`进行判断结果是否为`[object xxxxx]`

### isArrayBufferView

ArrayBufferView数据类型的判断比较特别。
1.`typeof ArrayBuffer`不等于'undefined'，并且`ArrayBuffer.isView`函数要存在，那么就返回ArrayBuffer.isView(param)
2.如果前面`typeof`已经为false，或者isView函数不存在，那么`instanceof`判断val.buffer是否为ArrayBuffer的实例。

具体代码
```javascript
var  result;
if ((typeof  ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	result = ArrayBuffer.isView(val);
} else {
	result = (val) && (val.buffer) && (val.buffer  instanceof  ArrayBuffer);
}
return  result;
```
### isStream

1.首先必须是一个对象，可用`isObject`判断
2.而且val.pipe必须是一个方法，可以用`isFunction`判断

### isURLSearchParams

1.`typeof`判断URLSearchParams这种数据类型是否存在.
2.如果存在，判断val是否为URLSearchParams的一个实例(instanceof).

### trim

清除字符串两边的空格(replace+正则)
```javascript
str.replace(/^\s*/,'').replace(/\s$/,'')
```
### isStandardBrowserEnv

判断当前是否处于标准的Web环境
为false的情况
1.`typeof`判断navigator不等于'undefined'

2.navigator.product是'ReactNativa','NativeScript','NS'其中的一种

为true

window和document经`typeof`判断都不为'undefined'

### forEach(obj,fn)

遍历一个数组或者对象，并对每个元素执行某个方法
+ obj,需要遍历的对象|数组
+ fn,对每个元素执行的方法
1.如果obj为null,或者typeof为'undefined'，返回。
2.如果obj都不是一个对象，转化成一个数组
```javascript
if (typeof  obj !== 'object') {
	obj = [obj];
}
```
3.isArray判断obj是否为数组，是就for循环遍历，再用fn.call(null,obj[i],index,obj)
4,如果不是数组，for in循环，再用`Object.prototype.hasOwnProperty.call(obj,key)`判断key是否在obj中存在，存在则`fn.call(null,obj[key],key,obj)`

### merge/deepMerge

合并对象，支持N个参数

merge代码

```javascript
var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
```

deepMerge

```javascript
 var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = deepMerge(result[key], val);
    } else if (typeof val === 'object') {
      result[key] = deepMerge({}, val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
```

merge中`assignValue`的逻辑

1.如果result[key]已存在且为对象，同时后来相同的key的对应的值也为对象类型,那就递归merge,但是后来的会覆盖前面的

2.如果result[key]不存在/存在但不是对象，直接赋值

3.如果result[key]存在且为对象类型，但是后来相同的key所对应的值不是对象类型，那么直接赋值。

4.如果result[key]不存在/存在但不是对象类型，同时后来相同的key所对应的值也不是对象类型，那么直接赋值.

deepMerge

1.如果result[key]不存在/存在但不是对象类型，同时后来相同的key所对应的值也不是对象类型，那么直接赋值

2.如果result[key]存在且是对象类型，同时后来相同的key所对应的值也是对象类型，那么递归执行deepMerge。

3.如果result[key]不存在/存在但不是对象类型,但是后来相同的key所对应的值也是对象类型，那么也递归执行。

### extend(a, b, thisArg)

通过手动添加B来扩展A对象,如果元素有的类型是函数，那么**允许改变函数的this指向**。

```javascript
 forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
```

只有当thisArg参数存在且B中有元素为函数类型，才会通过bind改变该函数的指向

## util.js的想法

1.Stream是什么？

> 流（stream）是 Node.js 中处理流式数据的抽象接口。 `stream` 模块用于构建实现了流接口的对象。

stream是一个抽象的接口, node里有很多对象实现了这个接口, 如: 对http服务器发起请求的request对象就是一个Stream, 还有stdout(标准输出);

node.js  Stream有四种流类型: 

1) Readable   可读操作

2) Writable   可写操作

3) Duplex    可读可写操作

4) Transform  操作被写入数据, 然后读出结果(大致是说, 你把数据载入我的方法里, 我帮你处理后再返回给你)

而且所有的stream 都是Events 对象的实例, 也就是说可以直接添加各种监听事件哈~ 常用的stream流的事件有:

　1) data   当有数据可读时候触发

　2) end   没有更多数据可读时触发

　3) erroer  在接收和写入过程中发生错误时触发

　4) finish  所有数据已被写入时触发 (写入操作时候用)

2.URLSearchParams是什么，什么时候出现的，兼容性？

> **`URLSearchParams`** 接口定义了一些实用的方法来处理 URL 的查询字符串。
>
> 一个实现了 `URLSearchParams` 的对象可以直接用在 [`for...of`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...of) 结构中，例如下面两行是相等的。
>
> ```js
> for (var p of mySearchParams);
> for (var p of mySearchParams.entries());
> ```

[MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/API/URLSearchParams)

IE全都不兼容,Edge要17及以上，其他浏览器高版本都支持。

3.merge和deepMerge的区别

+ merge允许合并后的对象的元素可以是对象，deepMerge合并之后的对象的每个元素都是简单数据类型。
+ 由于merge合并后的对象的元素可以是对象，存在对象的引用，而deepMerge则没有对于对象的引用
+ deepMerge合并之后，扁平化了。

4.merge/deepMerge的assignValue函数为什么要写在里面，单独拿出来不行吗？

不行，因为assignValue函数需要用到merge/deepMerge中的变量result。单独拿出来改写函数，反而麻烦。

5.forEach函数中，为什么要用到`Object.prototype.hasOwnProperty`?

## buildURL.js

构建完整的URL

### encode

![buildURL-encode](D:\learn\learn_axios\pictures\buildURL-encode.png)



encode函数模拟浏览器对URL进行解析的过程。

+ 先用encodeURIComponen()对URL进行编码
+ 除此之外，浏览器还对部分字符进行了转换

### buildURL(url, params, paramsSerializer)

 @param {string} url The base of the url (e.g., http://www.google.com)

 @param {object} [params] The params to be appended

 @returns {string} The formatted url

![](D:\learn\learn_axios\pictures\buildURL.png)

**params是一个对象**。

+ 如果没有传入参数,直接return

+ 如果传入了参数序列化函数，那么使用该函数序列化参数

+ 如果参数是一个URLSearchParams类型的对象，那么直接`toString`

如果 2，3都不满足，那么对参数进行如下处理

1.如`a=abc&b=[1,2,3]` ->`a=[abc]&b[]=[1,2,3]`,然后遍历

2.如果`value`是Date对象，转成ISO字符串

3.如果`value`是对象，就`JSON.stringfy()`

4.encode(key) +''=''+encode(val),push进临时的数组，再将临时的数组`join`拼接

![](D:\learn\learn_axios\pictures\buildUrl-2.png)

+ 再对url中的`#`和`?`做相应的处理

总体思路，获取正确url和params

+ 对于params，要做一些参数类型的验证和处理（Date,URlSearchParams）。
+ 对于url,`#`,`?`,`&`这几个符号要做一些处理

## interceptorManager

拦截器的管理类

InterceptorManage类只有handlers数组

### use 

注册拦截器

![](D:\learn\learn_axios\pictures\interceptorManage-use.png)

### eject 

删除拦截器

![](D:\learn\learn_axios\pictures\interceptorManage-eject.png)

### forEach

 遍历所有的拦截器

![](D:\learn\learn_axios\pictures\interceptorManage-forEach.png)

##  transformData

转换数据的函数，可用于请求/响应的数据

![](D:\learn\learn_axios\pictures\transformData.png)

## normalizeHeaderName(header,normalizedName)

规范化所有Header里面的字段名称

![](D:\learn\learn_axios\pictures\normalizeHeaderName.png)

+ 参数1：header
+ 参数2：已经规范化过的字段名称

思路：

`forEach`遍历整个header对象，如果找到一个字段，名字和规范不一致，但是两者转大写之后又一致，那么将原来名称所对应的值覆盖新字段(规范化的字段)，并删除原来的字段。

## http.js

用于适配node环境的adapter。

axios是基于promise的，客户端还是node端，就是返回一个promise。

### 重写resolve/reject函数

![](D:\learn\learn_axios\pictures\rewrite-promiseCallback.png)

装饰器模式的体现

## createError.js enhanceError.js

+ createError :封装一个Error对象。
+ enhanceError: 增加一个Error对象

![](D:\learn\learn_axios\pictures\createError.png)

![](D:\learn\learn_axios\pictures\enhanceError.png)

### 思考

1.这样写有什么好处，因为enhanceError的内容其实也可以写在createError里面

这样写，分开来，各自做各自的事，createError只做一件事，创建一个Error对象，而EnhanceError则增强该对象，互不干扰，任务更细化，解耦合。

2.enhance为什么要给error对象添加toJSON方法

有助于更清楚报错内容，而不是只有报错信息

## settle.js

