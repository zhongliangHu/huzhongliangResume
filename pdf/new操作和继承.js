/**
 * new 操作 1.新创全新函数对象 2.新对象执行prototype连接 3.新对象绑定this 4.如果类函数没有返回其它对象 那么new表达式返回这个新对象
 */
//分清对象 对象的子集--函数对象（有其特殊性如protoype属性）
//js每个对象（包括函数对象）都有一个特殊的[[prototype]]内置属性P142  一般不可见，可通过__proto__来查看
//js每个函数默认有一个prototyp公有但不可枚举（enumberable:false）的属性P146，当然函数对象同时又内置的[[prototype]]
//（以下是自己推导的可能有欠缺）每个普通函数或类函数（除了Function类?）对象 是new Function()出来的 
//如下面Foo函数对象的__proto__是Function.prototype;
//Function.prototype也是一个对象它的__proto__是Object.protoype,同时Function.prototype也有自己定义的属性如apply等;
//Function函数对象(不是new Function出来的吧?内置的)它的__proto__应该是Object.prototype    
//Object.prototype对象有自身的属性如toString，valueOf等，它的__proto__是null[[protoype]]链到此结束。

//js内置了Object.prototype（所有实例都是对象 但不是所有对象是实例）和 Function.prototype  并且Function.prototype是个函数 不是所有函数都是new Function出来的
// Function.prototype.bind没有prototype不是所有函数都有prototype
//Function.prototype的__proto__指向Object.prototype
//Object.prototype的__proto__为null; 有了Function.prototype才有了function Function(){} 

// function Foo() { 
//     this.value = 1;
// }
// let foo = new Foo(2); // 将函数对象变为普通对象 ->{value : 1}
// // //new 操作 生成新对象
// let obj = {};
// obj = Object.create(Foo.prototype); // 
// Foo.call(obj);  //将Foo函数this指针调向新对象 并执行Foo函数
// //return obj; 
//实现一个new  let obj = newCreate(Fn,value);
function newCreate(...arg) {
    //创建一个新对象
    let obj = new Object(); //Object.create(null)
    //获取构造函数constructor
    let Con =arg.shift(); //con = [].shift.call(arguments)
    //原型链连接
    obj.__proto__ = Con.prototype;
    // this绑定新对象
    let result = Con.apply(obj, arg); 
    // 确保 new出来的 是对象 ???
    return typeof result === 'object' ? result : obj;
}

function Faz(){

}
Faz.prototype = {}; // Faz原本的prototype属性的constructor丢失了
Object.defineProperty(Faz.prototype,"constructor",{
    enumerable:false,
    writable:true,
    configurable:true,
    value:Faz //让constructor指向Faz
})

if (!Object.create){
    Object.create = function(obj){
        function F(){}
        F.prototype = Object;
        return new F();
    }
}

Object.defineProperty(Object.prototype,"__proto__",{
    get: function protoGetter() {
        return Object.getPrototypeOf(this);
    },
    set: function protoSetter(obj) {
        Object.setPrototypeOf(this, obj);
    }
});

// let a = 'a';
// let myObject = {
//     [Foo] : Foo,
//     [true] : true,
//     [[1]] : 1,
//     [obj] : obj,
//     [a+'b'] : 'ab'
// }
// console.log(myObject);

//P145 属性设置和屏蔽？？？
let anotherObject = {
    a : 2,
    b : {1:1}
}
let ownObject = Object.create(anotherObject); //[[prototype]]连接
anotherObject.a; //2
ownObject.a //2
anotherObject.hasOwnProperty('a'); // true
ownObject.hasOwnProperty('a') //fasle
ownObject.a++;  //隐式屏蔽? ownObject.a = ownObject.a +1 新建ownObject屏蔽属性a
anotherObject.a //2
ownObject.a  //3
ownObject.hasOwnProperty('a') //true