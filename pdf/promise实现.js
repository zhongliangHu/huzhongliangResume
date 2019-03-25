try {
    module.export = Mypromise;
} catch (error) {    
}
//使用
const promise1 = new Mypromise(function (resolve, reject) { //预设的两个（函数）参数
    try {
        setTimeout(function () {
            resolve("1");
        }) 
    } catch (error) {
        reject(error);
    }
}).then();

//自定义Promise类
function Mypromise(executor) {
    let self = this;
  
    self.status = "pending";
    self.data = "";
    self.onResolvedCallback = [];
    self.onRejectedCallback = [];
    function resolve(value) {
        if (value instanceof Mypromise) { //如果resolve传入promise类的实例，则执行该实例的then方法(实质内部也是执行nextTick也是micro-task)
            return value.then(resolve,reject);
        }
        process.nextTick(function () { //micro-task 异步执行resolve
            if (self.status === "pending") {
                self.status = "resolved";
                self.data = value;
                self.onResolvedCallback.forEach(cb => {
                    cb(value); //箭头函数不会改变this值 所以cb的this绑定仍然是self
                });
            }
        });
    }
    function reject(reason) {
        process.nextTick(function () { //micro-task 异步执行reject
            if (self.status === "pending") {
                self.status = "rejected";
                self.data = reason;
                self.onRejectedCallback.forEach(cb => {
                    cb(value); //箭头函数不会改变this值 所以cb的this绑定仍然是self
                });
            }
        });
    }
    try {
        executor(resolve, reject); //执行new Promise时的传入的executor函数(并预设的resolve,reject参数-闭包应用)
    } catch (error) {
        reject(error);
    }

}
Mypromise.prototype.then = function (onresolve,onreject) { //then()返回一个新的Promise类的实例
    let self = this;
    let promise2;
    //值的穿透
    onresolve = typeof onresolve === "function" ? onresolve : function (val) {return val;} //返回的值通过resolve不断传下去
    onreject = typeof onreject === "function" ? onreject : function (reason) { return reason; } //返回的值通过reject返回
    //执行then时 如果还没执行resolve或reject（状态仍是pending）则将传入的onresolve放入回调数组中，将来执行resolve时再执行
    if (self.status === "pending") {
        return promise2 = new Mypromise(function (resolve, reject) {    //因为resolve是异步了 所以此处不需要异步
            self.onResolvedCallback.push(function (value) { //执行cb(value)时传入了
                try {
                    let x = onresolve(value);
                    resolvePromise(promise2, x, resolve, reject)
                    // if (x instanceof Promise) { // 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
                    //     x.then(resolve, reject)
                    // }
                    //？
                } catch (error) {
                    reject(error);
                }
            });
            self.onRejectedCallback.push(function (reason) {
                try {
                    let x = onreject(reason);
                    resolvePromise(promise2, x, resolve, reject)
                    // if (x instanceof Promise) {
                    //     x.then(resolve, reject)
                    // }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
    if (self.status === "resolved") {
        return promise2 = new Mypromise(function (resolve,reject) {
            process.nextTick(function () {  //异步执行onresolve
                try {
                    let x = onresolve(self.data);
                    resolvePromise(promise2, x, resolve, reject)
                    // if (x instanceof Promise) { // 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
                    //     x.then(resolve, reject)
                    // }
                    // resolve(x) // 否则，以它的返回值做为promise2的结果
                } catch (error) {
                    reject(error);
                }
            });
           
        });
    }
    if (self.status === "rejected") {
        return promise2 = new Mypromise(function (resolve, reject) {
            process.nextTick(function () {  //异步执行onreject
                try {
                    let x = onreject(self.data);
                    resolvePromise(promise2, x, resolve, reject)
                //     if (x instanceof Promise) {
                //         x.then(resolve, reject)
                //     }
                //    ?? 在这里停止???
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}
function resolvePromise(promise2, x, resolve, reject) {
    var then
    var thenCalledOrThrow = false

    if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise!'))
    }

    if (x instanceof Promise) {
        if (x.status === 'pending') { //because x could resolved by a Promise Object
            x.then(function (v) {
                resolvePromise(promise2, v, resolve, reject)
            }, reject)
        } else { //but if it is resolved, it will never resolved by a Promise Object but a static value;
            x.then(resolve, reject)
        }
        return
    }

    if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
        try {
            then = x.then //because x.then could be a getter
            if (typeof then === 'function') {
                then.call(x, function rs(y) {
                    if (thenCalledOrThrow) return
                    thenCalledOrThrow = true
                    return resolvePromise(promise2, y, resolve, reject)
                }, function rj(r) {
                    if (thenCalledOrThrow) return
                    thenCalledOrThrow = true
                    return reject(r)
                })
            } else {
                resolve(x)
            }
        } catch (e) {
            if (thenCalledOrThrow) return
            thenCalledOrThrow = true
            return reject(e)
        }
    } else {
        resolve(x)
    }
}
/** 
 * https://github.com/xieranmaya/blog/issues/3
    resolvePromise函数即为根据x的值来决定promise2的状态的函数
    也即标准中的[Promise Resolution Procedure](https://promisesaplus.com/#point-47)
    x为`promise2 = promise1.then(onResolved, onRejected)`里`onResolved/onRejected`的返回值
    `resolve`和`reject`实际上是`promise2`的`executor`的两个实参，因为很难挂在其它的地方，所以一并传进来。
    相信各位一定可以对照标准把标准转换成代码，这里就只标出代码在标准中对应的位置，只在必要的地方做一些解释
*/
function resolvePromiseBase(promise2, x, resolve, reject) {
    var then
    var thenCalledOrThrow = false

    if (promise2 === x) { // 对应标准2.3.1节
        return reject(new TypeError('Chaining cycle detected for promise!'))
    }

    if (x instanceof Promise) { // 对应标准2.3.2节
        // 如果x的状态还没有确定，那么它是有可能被一个thenable决定最终状态和值的
        // 所以这里需要做一下处理，而不能一概的以为它会被一个“正常”的值resolve
        if (x.status === 'pending') {
            x.then(function (value) {
                resolvePromiseBase(promise2, value, resolve, reject)
            }, reject)
        } else { // 但如果这个Promise的状态已经确定了，那么它肯定有一个“正常”的值，而不是一个thenable，所以这里直接取它的状态
            x.then(resolve, reject)
        }
        return
    }

    if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) { // 2.3.3
        try {

            // 2.3.3.1 因为x.then有可能是一个getter，这种情况下多次读取就有可能产生副作用
            // 即要判断它的类型，又要调用它，这就是两次读取
            then = x.then
            if (typeof then === 'function') { // 2.3.3.3
                then.call(x, function rs(y) { // 2.3.3.3.1
                    if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
                    thenCalledOrThrow = true
                    return resolvePromiseBase(promise2, y, resolve, reject) // 2.3.3.3.1
                }, function rj(r) { // 2.3.3.3.2
                    if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
                    thenCalledOrThrow = true
                    return reject(r)
                })
            } else { // 2.3.3.4
                resolve(x)
            }
        } catch (e) { // 2.3.3.2
            if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
            thenCalledOrThrow = true
            return reject(e)
        }
    } else { // 2.3.4
        resolve(x)
    }
}


Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
}

Promise.deferred = Promise.defer = function () {
    var dfd = {};
    dfd.promise = new Promise(function (resolve, reject) {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
}
