setTimeout(() => {
  console.log(2); // Task 3: Chạy trong Macrotask Queue
});

new Promise((res, rej) => {
  console.log(1); // Task 1: Chạy ngay trong Call Stack (Promise executor là đồng bộ)

  res(3); //  Thêm `.then` callback vào Microtask Queue
})
  .then((data) => console.log(data))
  .then(() => console.log('then 1'))
  .then(() => console.log('then 3'))
  .then(() => console.log('then 4'));

// Task 2: Chạy trong Microtask Queue

new Promise((res, rej) => {
  console.log(4); // Task 1: Chạy ngay trong Call Stack (Promise executor là đồng bộ)

  res(5); //  Thêm `.then` callback vào Microtask Queue
})
  .then((data) => console.log(data))
  .then(() => console.log('then 2'))
  .then(() => console.log('then 5'));

(async () => {
  console.log('async start'); // Task 2: Đồng bộ trong async function
  const result = await Promise.resolve('async result'); // Đẩy .then() vào Microtask Queue
  console.log(result); // Task 5: Microtask Queue sau khi Promise resolve
})();

console.log(6); // Task 1: Chạy trong Call Stack

/*
1
4
6
3
5
then 1
then 2
then 3
then 5
then 4
2
*/
