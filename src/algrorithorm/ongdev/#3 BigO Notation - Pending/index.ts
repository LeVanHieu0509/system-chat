// Tìm giá trị x trong mảng array

const bai1 = (n) => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let x = 2;

  console.time();
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == x) {
      console.log('Found x at', i);
      console.timeEnd();
      return;
    }
  }
};

// bai1(10);

/*
    arr = new: 1 lần
    x = 10: 1 lần
    i=0: 1 lần
    i< arr: n lần
    i++: n lần
    if(arr[i] == x) : n lần
    log: 2*n lần

    total: 5n + 3 lần
    Dộ phức tạp: O(n)
*/

// -----------------------------------//
const bai2 = (n) => {
  let sum = 0; // 1 lần
  console.time();

  for (let i = 0; i <= n; i++) {
    // i = 0: 1 ; i <=n: n lan ; i++ : n lan => n + n + 1 => 2n

    for (let j = i; j <= n; j++) {
      //i = 1; j: 1,2,3,4,5
      //i = 2; j: 2,3,4,5
      //i = 3; j: 3,4,5
      //i = 4; j: 4,5
      //i = 5; j: 5

      // => j sẽ chạy 5 + 4 + 3 + 2 + 1 lần
      // Tổng quát: n + (n-1) + (n-2) + (n-3) + ... + 1
      // suy ra: j sẽ chạy: 1 + 2 + 3 + ... + n = n * (n-1) /2

      //Với 1 vòng lặp cha sẽ chạy với all vòng lặp con
      // Số phép tính: 2 * (n * (n-1) /2)

      sum++; //(n * (n-1) /2) lần
    }
  }
  console.timeEnd();
  return sum; // 1 lần
};

/*
//6 trong
//4 ngoai

 Big O: 1 + 2n + 3n * (n-1) /2 + 1 = 3/2n^2 + 7/2n + 2 ==> O(n^2)
*/

console.log(bai2(3));
