/**
 * 给任何想遍历的对象 定义@@iterator
 */
let myObject = {
    a:2,
    b:3
}

 //使用例子
let it = myObject[Symbol.iterator]();
it.next();
it.next();
it.next();
for (const iterator of myObject) {
    console.log(iterator);  // value值 而不是forin的key值
}
//数组有内置的@@iterator 
let arr = [1,2,3];
for (const iterator of arr) {
    console.log(iterator);
}

//@@iterator 实现

