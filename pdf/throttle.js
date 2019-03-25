/**
 * underscore 节流函数，返回函数连续调用时，func 执行频率限定为 次 / wait
 *
 * @param  {function}   func      回调函数
 * @param  {number}     wait      表示时间窗口的间隔
 * @param  {object}     options   如果想忽略开始函数的的调用，传入{leading: false}。
 *                                如果想忽略结尾函数的调用，传入{trailing: false}
 *                                两者不能共存，否则函数不能执行
 * @return {function}             返回客户调用函数
 */

//获取当前时间戳的
function now() {
    return +new Date();
}

function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    // 之前的时间戳
    var previous = 0;
    // 如果 options 没传则设为空对象
    if (!options) options = {};
    // 定时器回调函数
    var later = function () {
        // 如果设置了 leading，就将 previous 设为 0
        // 用于下面函数的第一个 if 判断
        previous = options.leading === false ? 0 : +new Date();
        // 置空一是为了防止内存泄漏，二是为了下面的定时器判断
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function () {
        // 获得当前时间戳
        var now = +new Date();
        // 首次进入前者肯定为 true
        // 如果需要第一次不执行函数
        // 就将上次时间戳设为当前的
        // 这样在接下来计算 remaining 的值时会大于0
        if (!previous && options.leading === false) previous = now;
        // 计算剩余时间
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        // 如果当前调用已经大于上次调用时间 + wait
        // 或者用户手动调了时间
        // 如果设置了 trailing，只会进入这个条件
        // 如果没有设置 leading，那么第一次会进入这个条件
        // 还有一点，你可能会觉得开启了定时器那么应该不会进入这个 if 条件了
        // 其实还是会进入的，因为定时器的延时
        // 并不是准确的时间，很可能你设置了2秒
        // 但是他需要2.2秒才触发，这时候就会进入这个条件
        if (remaining <= 0 || remaining > wait) {
            // 如果存在定时器就清理掉否则会调用二次回调
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            // 判断是否设置了定时器和 trailing
            // 没有的话就开启一个定时器
            // 并且不能不能同时设置 leading 和 trailing
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};
function throttleBase(fn, threshold) {
    // 记录上次执行的时间
    var last
    // 定时器
    var timer
    // 默认间隔为 250ms
    threshold || (threshold = 250)
    // 返回的函数，每过 threshold 毫秒就执行一次 fn 函数
    return function () {
        // 保存函数调用时的上下文和参数，传递给 fn
        var context = this
        var args = arguments
        var now = +new Date()
        // 如果距离上次执行 fn 函数的时间小于 threshold，那么就放弃
        // 执行 fn，并重新计时
        if (last && now < last + threshold) {
            clearTimeout(timer)
            // 保证在当前时间区间结束后，再执行一次 fn
            timer = setTimeout(function () {
                last = now
                fn.apply(context, args)
            }, threshold)
            // 在时间区间的最开始和到达指定间隔的时候执行一次 fn
        } else {
            last = now
            fn.apply(context, args)
        }
    }
}

function throttle2(fn, wait, options) {
    let timer = null;  // 缓存定时器 
    let result, timeStamp, previous, hasPast, args, context;
    let later = (context, args) => {
        timer = null;
        previous = now();
        result = fn.apply(context, args);
    }
    //options.leading  //
    return function () { //timeout 
        timeStamp = now();
        previous = previous || timeStamp;
        context = this;
        args = [].slice.call(arguments,0);
        hasPast = timeStamp - previous;
        if (previous && hasPast < wait) {   // throttle 若在规定时间内触发 则重新开始计时 
            clearTimeout(timer);            // 此处一直在规定时间内触发 则一直被重新计时 不会被执行
            timer = setTimeout(later.bind(this, context, args), wait - hasPast);
        }else {
            previous = timeStamp;
            result = fn.apply(context, args);
            context = args = null;
        }
        return result;
    }
}

//demo例子
function ajax(n) { //ajax 相当于一次异步ajax请求
    //let n = 0;
    setTimeout(() =>
        console.log(n++),
        0);
    //console.log(n++);
}
//setInterval(ajax.bind(null,0),100) // 模仿不断触发事件 导致发异步请求
//改为debounce节流触发
let throttleAjax = throttle(ajax, 10000)
setInterval(() => {
    throttleAjax(0)  
}, 3000);           






