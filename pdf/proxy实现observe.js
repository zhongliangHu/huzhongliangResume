/**
 * 利用proxy和Reflect实现观察者模式
 */
let queueObservers = new Set();
function observable(obj) {
    return new Proxy(obj,{
        set(target, propKey, value, receiver){
            //Reflect.set完成赋值的默认行为 proxy set执行拦截赋值操作 有receiver会默认执行defineProperty
            const result = Reflect.set(target, propKey, value, receiver); //???没有执行此句 会输出 张三，20
            queueObservers.forEach((observer)=>{
                observer();  //如果没有执行上面Reflect.set当前的obj值还是"张三" 还未set为"李四"
            });
            return Reflect.set(target, propKey, value, receiver); //或者result
        },
        // get(target, propKey, receiver) {
        //     return Reflect.get(target, propKey, receiver);
        // }
    });
}
function observe(fn) {
    queueObservers.add(fn);
}
//使用举例 
//数据对象person是观察目标，函数print是观察者。一旦数据对象发生变化，print就会自动执行。
const person = observable({
    name: '张三',
    age: 20
});

function print() {
    console.log(`${person.name}, ${person.age}`)
}

observe(print);
person.name = '李四';
// 输出
// 李四, 20


/**
 * 实现Web服务的客户端
 * 
 */
function createWebService(url) {
    return new Proxy({},{
        get(target,propKey,receiver){
            return () => httpGet(baseUrl + '/' + propKey); //获取propKey值并添加至url尾部进行 发送请求 返回一个promise实例
            //return new Promise(()=>{
            //     setTimeout(() => {
                    //异步后 返回data
            //     }, 100);
            // });
        }
    })
} 

const service = createWebService('http://example.com/data');
//新建了一个 Web 服务的接口，这个接口返回各种数据。proxy 可以拦截这个对象的任意属性(如下:employees)，所以不用为每一种数据(employees)写一个适配方法，只要写一个 Proxy 拦截就可以了
service.employees().then(json => {
    const employees = JSON.parse(json);
    // ···
});