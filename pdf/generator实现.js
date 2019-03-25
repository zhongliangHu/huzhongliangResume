
//https://yuchengkai.cn/docs/frontend/#generator-实现
// cb 也就是编译过的 test 函数
function generator(cb) {
    return (function () {
        var _context = {              //设置一个对象（指针??） 用于储存当前操作的位置 .next时正确执行switch中的代码
            next: 0,
            sent: "",
            stop: function () { }
        };

        return {
            next: function (value) {     //执行generator(cb)返回{next:fun}对象 即可进行.next()操作
                _context.sent = value;
                var ret = cb(_context);  //进行.next()时 此步 对传入generator的cb函数参数的形参预设_context参 并执行cb
                if (ret === undefined) return { value: undefined, done: true }; //添加if判断??
                return {
                    value: ret,
                    done: false
                };
            }
        };
    })();
}
// 如果你使用 babel 编译后可以发现 test 函数变成了这样
function test() {
    var a;
    return generator(function (_context) {   //传入generator回调函数fn 并且此fn含有预设的_context对象参数 用于改变_context的next值并进行返回操作
        while (1) {
            switch ((_context.prev = _context.next)) {
                // 可以发现通过 yield 将代码分割成几块
                // 每次执行 next 函数就执行一块代码
                // 并且表明下次需要执行哪块代码
                case 0:
                    a = 1 + 2;
                    _context.next = 4;
                    return 2; //执行yield后的语句 并返回-执行后的返回值
                case 4:
                    _context.next = 6;
                    return 3;
                // 执行完毕
                case 6:
                case "end":
                    return _context.stop();
            }
        }
    });
}

// 使用 * 表示这是一个 Generator 函数
// 内部可以通过 yield 暂停代码
// 通过调用 next 恢复执行
// function* test() {
//     let a = 1 + 2;
//     yield 2;
//     yield 3;
// }
let b = test();
console.log(b.next()); // >  { value: 2, done: false }
console.log(b.next()); // >  { value: 3, done: false }
console.log(b.next()); // >  { value: undefined, done: true }