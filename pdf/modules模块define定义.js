//函数式编程
// const MyModules = function (Manage) {
//     return function () {
//         Manage.apply(null,arguments);
//     }
// }

/**
 * MyModules函数 现代模块机制 iife立即执行函数 块作用域和闭包
 * @param name '' 定义本身模块
 * @param deps [] 定义模块需引入文件
 * @param impl fn 定义模块函数
 */
const MyModules = (function Manage(params) {
    let modules = {};                  // 类似 缓存机制??
    function define(name,deps,impl) {
        deps = deps.map(element => modules[element]);
        modules[name] = impl.apply(impl, deps);
    }
    function get(name) {
        return modules[name];
    }
    return {
        define : define,
        get    : get
    }
})();

/**
 * MyModules.define函数的使用
 * @param '' 定义本身模块
 * @param [] 定义模块需引入文件
 * @param fn 定义模块函数
 */
MyModules.define("bar",[],function () {
    function hello(params) {
        return `Let me introduce ${params}`;
    }
    return {
        hello : hello
    };
});

MyModules.define('foo',['bar'], function(bar) {
    let hungry = 'hippo';
    function awesome() {
        console.log(bar.hello(hungry).toUpperCase());
    }
    return {
        awesome : awesome
    }
});
let bar = MyModules.get('bar');
let foo = MyModules.get('foo');
console.log(bar.hello('hippo'));
foo.awesome();