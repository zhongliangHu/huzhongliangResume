// console.log(1);
// new Promise(function (resolve, reject){
   
//     setTimeout(function (){
//         resolve(true);
//     }, 0);
//     //reject(false);
// }).then(function(){
//     console.log(2);
// }, function(){
//     console.log(3);
// });
// console.log(4);
// 1-4-2
// 有reject则????? 1-4-3

new Promise(resolve => {
    resolve(1);
    Promise.resolve().then(() => console.log(2));
    console.log(4)
}).then(t => console.log(t));
console.log(3);
// 4-3-2-1

/**
 * js浏览器 处理HTML标记构建DOM树 处理CSS标记构建CSSOM树 且与DOM树合并成一个渲染树 根据渲染树布局计算每个节点几何信息 将节点绘制在屏幕上
 * 事件循环每次为一个tick 执行顺序：宏任务 -> 所有微任务microtask -> 宏任务
 * 
 * 渲染时机是在 microtask 之后，事件队列之前执行
 * 在一次事件循环中多次修改同一dom，只有最后一次才进行绘制
 * 如果希望在每轮事件循环中呈现变动，可以使用 requestAnimationFrame
 * 
 * task 宏任务: script代码执行、setTimeout、setInterval、I/O、UI交互事件、postMessage、requestAnimationFrame??(是吗???)、MessageChannel、setImmediate(Node.js环境）
 * microtask 微任务: Promise.then、MutaionObserver、process.nextTick(Node.js环境）
 */
 
// console.log('script start');

// setTimeout(function() {
//   console.log('timeout1');
// }, 10);

// new Promise(resolve => {
//     console.log('promise1');
//     resolve();
//     setTimeout(() => console.log('timeout2'), 10);
// }).then(function() {
//     console.log('then1')
// })

// console.log('script end');
// script start-promise1-script end-then1-timeout1-timeout2

/** 
 * Node环境 js  运行机制
 * Node的Event Loop分阶段，阶段有先后，依次是
    * expired timers and intervals，即到期的setTimeout/setInterval
    * I/O events，包含文件，网络等等
    * immediates，通过setImmediate注册的函数
    * close handlers，close事件的回调，比如TCP连接断开
 * 同步任务及每个阶段之后都会清空microtask队列
    * 优先清空next tick queue，即通过process.nextTick注册的函数
    * 再清空other queue，常见的如Promise
 * 
 * 执行栈 -> process.nextTick -> 任务队列 -> setImmediate
 */
// process.nextTick(function A() {
//     console.log(1);
//     process.nextTick(function B() { console.log(2); });
// });

// setTimeout(function timeout() {
//     console.log('TIMEOUT FIRED');
// }, 0)

// setImmediate(function () {
//     setImmediate(function A() {
//         console.log(1);
//         setImmediate(function B() { console.log(2); });
//     });

//     setTimeout(function timeout() {
//         console.log('TIMEOUT FIRED');
//     }, 0);
// });
// 1-2-TIMEOUT FIRED-?????1-TIMEOUT FIRED-2

// console.log(1)

// setTimeout(() => {
//     console.log(2)
//     new Promise(resolve => {
//         console.log(4)
//         resolve()
//     }).then(() => {
//         console.log(5)
//     })
//     process.nextTick(() => {
//         console.log(3)
//     })
// })

// new Promise(resolve => {
//     console.log(7)
//     resolve()
// }).then(() => {
//     console.log(8)
// })

// process.nextTick(() => {
//     console.log(6)
// })
// 1-7-6-8-2-4-3-5