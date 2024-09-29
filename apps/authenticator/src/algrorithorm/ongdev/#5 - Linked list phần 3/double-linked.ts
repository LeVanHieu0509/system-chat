import { isShallowEqual } from '../../../utils/index';
import NodeLink from '.';

class DoublyLinkedList {
  size: number;
  head: NodeLink;
  tail: NodeLink;

  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // O(n)
  clear() {
    let currentNode = this.head;

    while (currentNode != null) {
      let nextNode = currentNode.getNext();

      currentNode.setData(null);
      currentNode.setNext(null);
      currentNode.setPrev(null);

      currentNode = nextNode;
    }

    this.tail = null;
    this.head = null;
    this.size = 0;
  }

  // constant
  length() {
    return this.size;
  }

  // constant
  isEmpty() {
    return this.length() == 0;
  }

  // O(1)
  add(element) {
    this.addLast(element);
  }

  // O(1)
  addFirst(element) {
    if (this.isEmpty()) {
      this.head = this.tail = new NodeLink(element, null, null);
    } else {
      this.head.setPrev(new NodeLink(element, null, this.head));

      this.head = this.head.getPrev();
    }
    this.size++;
  }

  // O(1)
  addLast(element) {
    //2 case
    //case 1: empty list
    if (this.isEmpty()) {
      this.tail = this.head = new NodeLink(element, null, null);
    } else {
      this.tail.setNext(new NodeLink(element, this.tail, null));
      this.tail = this.tail.getNext();
    }
    this.size++;
    //case 2: have node in list
  }

  // O(1)
  peekFirst() {
    //get data first node
    if (this.isEmpty()) throw new Error('Double linked list empty');
    return this.head.getData();
  }

  // O(1)
  peekLast() {
    //get data first node list
    if (this.isEmpty()) throw new Error('Double linked list empty');
    return this.tail.getData();
  }

  // O(1)
  removeFirst() {
    if (this.isEmpty()) throw new Error('Double linked list empty');

    const data = this.head.getData();

    this.head = this.head.getNext();

    this.size--;

    if (this.isEmpty()) this.tail == null;
    else this.head.setPrev(null);

    return data;
  }

  // O(1)
  removeLast() {
    if (this.isEmpty()) throw new Error('Double linked list empty');
    const data = this.tail.getData();

    this.size--;
    this.tail = this.tail.getPrev();
    if (this.isEmpty()) this.head == null;
    else this.tail.setNext(null);

    return data;
  }

  // O(1)
  removeNode(node: NodeLink) {
    if (node.getPrev() == null) return this.removeFirst();
    if (node.getNext() == null) return this.removeLast();

    let prevNode: NodeLink = node.getPrev();
    let nextNode: NodeLink = node.getNext();

    prevNode.setNext(nextNode);
    nextNode.setPrev(prevNode);
    this.size--;

    //clear memory cache
    node.setData(null);
    node.setNext(null);
    node.setPrev(null);
    node = null;

    return true;
  }

  // O(n)
  removeObject(object: Object) {
    let currentNode = this.head;
    if (object == null) {
      while (currentNode !== null) {
        if (currentNode.getData() == null) {
          this.removeNode(currentNode);

          return true;
        }
        currentNode = currentNode.getNext();
      }
    } else {
      while (currentNode !== null) {
        if (isShallowEqual(currentNode.getData(), object)) {
          this.removeNode(currentNode);

          return true;
        }
        currentNode = currentNode.getNext();
      }
    }

    return false;
  }

  // O(n)
  removeAt(index) {
    let current = this.head;
    //Dua vao size
    if (index < 0 || index >= this.size) throw new Error('Index Error');

    //co the loop tu head or tail
    if (index < this.size / 2) {
      let i = 0;
      while (i != index) {
        i++;
        current = current.getNext();
      }
    } else {
      let i = this.size;

      let current = this.tail;
      while (i != index) {
        current = current.getPrev();
        i--;
      }
    }

    return this.removeNode(current);
  }

  // O(n)
  indexOf(object: Object) {
    let currentNode = this.head;
    let index = 0;
    //Dua vao size
    if (object == null) {
      while (currentNode !== null) {
        if (currentNode.getData() == null) {
          return index;
        }

        currentNode = currentNode.getNext();
        index++;
      }
    } else {
      while (currentNode !== null) {
        if (currentNode.getData() == object) {
          return index;
        }
        currentNode = currentNode.getNext();
        index++;
      }
    }

    return -1;
  }

  // O(n)
  contains(object: Object) {
    return this.indexOf(object) != -1;
  }

  toString() {
    let current = this.head;

    let doubleLinked = [];

    while (current) {
      doubleLinked.push(current.getData());

      current = current.getNext();
    }

    console.log('doubleLinked new', doubleLinked);

    return JSON.stringify(doubleLinked);
  }
}

export default DoublyLinkedList;
