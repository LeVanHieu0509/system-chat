class NodeLink {
  value: any;
  next = null;
  previous = null;

  constructor(value, prev, next) {
    this.value = value;
    this.next = next;
    this.previous = prev;
  }

  getData() {
    return this.value;
  }

  setData(data) {
    this.value = data;
  }

  getPrev() {
    return this.previous;
  }

  setPrev(data) {
    this.previous = data;
  }

  getNext() {
    return this.next;
  }

  setNext(data) {
    this.next = data;
  }

  toString() {
    return this.value.toString();
  }
}

export default NodeLink;
