/**
 * 模仿实现call apply
 * fn.apply(context,args)
 * context.fn(args)
 */
if (!Function.prototype.myApply) {
    Function.prototype.myApply = function (...args) {
        let context = args.shift();
        context.fn = this;     //this动态 即为调用myApply的执行环境==调用myApply方法的函数
        //在绑定对象上添加fn属性（即调用myApply的方法）--相当于改变了绑定对象了
        context.fn(...args);  //fn.myApply(context)->context.fn() 改变fn执行环境 
        delete context.fn;
    }
}
// 使用
function anyFn() {
    console.log(`name:${this.name}`)
}
let context1 = { name: 'obj' }, context2 = { name: 'obj2' }, context3 = { name: 'obj3' };
anyFn.myApply(context1);

/**
 * this动态变化 随着函数调用环境变化而变化
 * 给默认绑定（函数内this是）指定一个全局对象和undefined以外的值，就可实现和硬绑定bind（除了使用new情况外）相同效果，
 * 同时保留隐式绑定或显式call、apply绑定修改this的能力
 * curry应用
 */
if (!Function.prototype.softBind) {
    Function.prototype.softBind = function (oThis) {
        let fn = this;
        let curried = [].slice.call(arguments,1); //softBind函数除oThis以外所有参数
        let bound = function () {
            return fn.apply(
                //this===(window || global || ?this = {_called:true,_idleNext:null} Timeout) 这里函数调用时的this情况不好判断
                (!this || this===(global)) ? oThis : this, //默认调用(直接调用软绑定过的fn)this指向软绑定的对象; 若调用fn时apply或call显示绑定或obj.fn隐式绑定 那this将指向绑定的对象 
                curried.concat.apply(curried,arguments)
            );
        }
        //(构造函数绑定bind情况) bind返回的函数如果作为构造函数，搭配new关键字出现的话，我们的绑定this就需要“被忽略”
        bound.prototype = Object.create(fn.prototype); // ?? 兼容构造函数
        return bound;
    }
}

function foo() {
    console.log(`name:${this.name}`)
}

let obj = { name: 'obj' }, obj2 = { name: 'obj2' }, obj3 = { name: 'obj3'};
let fooObj = foo.softBind(obj);  //软绑定obj
// ？？
//软绑定 返回了新的柯里化（预设参数）的函数对象bound（复制了foo的原型）
//同时新对象函数执行后重新将foo原函数this重新apply（重定向this）
fooObj();  //-> obj 

obj2.foo = fooObj; //将 软绑定obj过的 函数进行隐式绑定
obj2.foo()  //-> obj2

setTimeout(fooObj, 100)  //-> obj 

foo(); //直接调用 没有软绑定