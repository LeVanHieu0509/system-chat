/*
  # Fibonacci
  fib = 1 1 2 3 5 8 13 21 ...

  Solution:

  fib(2) = fib(1) + fib(0)
  fib(3) = fib(2) + fib(1)
  ...
  fib(n) = fib(n-1) + fib(n-2)

  fib(1) = fib(0) - fib(-1)

  if(n < 2) fib(n) == 1
  else fib(n) = fib(n-1) + fib(n-2) 
*/

function fib(n) {
  if (n < 2) return 1;
  else return fib(n - 1) + fib(n - 2);
}

console.log(fib(7));

/*
    Tính giai thừa
    5! = 1x2x3x4x5
    n! = 1x2x3x ...x n
    factorial(n) = 1 x 2 x ... x (n-2) x (n-1) x n

    if(n < 1) return
    else factorial(n) * factorial(n - 1)

    
*/

function factorial(n) {
  if (n < 1) return 1;
  else return n * factorial(n - 1);
}

console.log(factorial(3));

//thap ha noi
/*
    Bài toàn tháp Hà Nội là trò chơi toán học gồm 3 cọc và n đĩa có kích thước khác nhau. Ban đầu các đĩa được xếp chồng lên nhau trong cọc A như hình vẽ.
    Yêu cầu của bài toán: Di chuyển toàn bộ các đĩa ở cọc A sang cọc C với điều kiện sau.

    Mỗi lần thực hiện chỉ được di chuyển một đĩa
    Các đĩa phải xếp theo nguyên tắc, đĩa lớn ở dưới, đĩa nhỏ ở trên.
    Được phép thêm một cọc B làm trung gian để di chuyển các đĩa.
*/

function solveThapHaNoi(n, source, destination, auxiliary) {
  if (n == 1) {
    console.log('n=1');
    console.log(`Move disk 1 from ${source} to ${destination}`);
    return;
  }

  console.log('n=', n);
  solveThapHaNoi(n - 1, source, auxiliary, destination);
  console.log(`move disk ${n} from ${source} to ${destination}`);
  solveThapHaNoi(n - 1, auxiliary, destination, source);
}

solveThapHaNoi(3, 'A', 'C', 'B');

//cach 2:
function swap(n, a, b) {
  console.log(`move disk ${n} tu ${a} to ${b}`);
}

function thapHaNoi(n, a, b, c) {
  if (n == 1) return swap(1, a, c);
  else {
    console.log('run', n);
    thapHaNoi(n - 1, a, c, b);
    swap(n, a, c);
    thapHaNoi(n - 1, b, a, c);
  }
}

thapHaNoi(3, 'A', 'B', 'C');
