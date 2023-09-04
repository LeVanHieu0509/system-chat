/// array: Độ dài
// arr: mảng
//

class DynamicArray {
  arr;
  size = 0;
  capacity = 0;

  constructor(capacity) {
    if (capacity !== null) {
      this.capacity = capacity;
      this.arr = new Array(capacity);

      if (capacity < 0) throw Error('Error With Capacity');
    } else {
      this.capacity = 10;
      this.arr = new Array(capacity);
    }
  }

  static instance(a) {
    return new DynamicArray(a);
  }

  length() {
    return this.size;
  }

  isEmpty() {
    return this.length() == 0;
  }

  get(index) {
    return this.arr[index];
  }
  set(value, index) {
    this.arr[index] = value;

    return this.arr;
  }
  print() {
    return this.arr;
  }
  add(element) {
    // neu capacity less than size => x2 capacity

    if (this.size >= this.capacity - 1) {
      if (this.capacity == 0) this.capacity = 1;
      //Nếu capacity bị đầy thì x2 số lượng lênlên
      this.capacity *= 2;
      let newArr = Array(this.capacity * 2);

      for (let i = 0; i < this.arr.length; i++) {
        newArr[i] = this.arr[i];
      }

      this.arr = newArr;
    }
    this.arr[this.size++] = element;
  }
  removeAt(index) {
    //check dieu kien neu nhu index < size
    if (index > this.size) throw Error('Vui long nhap lai index');
    //tao ra 1 mang moi
    let newArr = new Array(this.capacity);

    for (let i = 0, j = 0; i < this.size; i++, j++) {
      if (j == index) i++;
      newArr[j] = this.arr[i];
    }

    this.arr = newArr;
    this.size--;
  }
  remove() {}
  indexOf(element) {
    for (let i = 0; i < this.arr.length; i++) {
      if (typeof element === 'object') {
        let object = element;
        return 'chua lam object';
      } else if (this.arr[i] == element) {
        return i;
      }
    }
    return -1;
  }
  contains(element) {
    return this.indexOf(element) !== -1;
  }
  iterator() {
    let index = 0;

    return {
      next: () => this.arr[index++],
    };
  }
  toString() {
    if (this.size == 0) return '[]';
    else {
      return `${this.arr}`;
    }
  }
}

const array = new Array();

// const arrayCustom = DynamicArray.instance(null);
const arrayCustom = new DynamicArray(2);

arrayCustom.add('A');
arrayCustom.add('N');
arrayCustom.add('H');
arrayCustom.add(' ');
arrayCustom.add('H');
arrayCustom.add('I');
arrayCustom.add('E');
arrayCustom.add('U');

console.log('Arr::', arrayCustom.toString());
console.log('indexOf', arrayCustom.indexOf(6));
console.log('contains', arrayCustom.contains(6));
// arrayCustom.removeAt(2);

console.log('length', arrayCustom.length());
console.log('isEmpty', arrayCustom.isEmpty());
console.log('print', arrayCustom.print());

// const instanceWithBAndC = DynamicArray.instance(undefined);
