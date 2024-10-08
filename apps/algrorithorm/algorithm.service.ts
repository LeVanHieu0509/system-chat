import { Injectable } from '@nestjs/common';
import DoublyLinkedList from './ongdev/#5 - Linked list phần 3/double-linked';

@Injectable()
export class AlgorithmService {
  getHello(): string {
    return 'Hello World!';
  }
  addFirst(): string {
    const linkedlist = new DoublyLinkedList();
    try {
      linkedlist.addFirst({ data: 15, name: 'Le Van Hieu' });
      linkedlist.addFirst({ data: 14, name: 'Le Van Tuan' });
      linkedlist.addFirst({ data: 13, name: 'Le Van Tuan' });
      linkedlist.addFirst({ data: 12, name: 'Le Van Tuan' });
      linkedlist.addFirst({ data: 11, name: 'Le Van Tuan' });

      // linkedlist.addFirst(10);
      // linkedlist.addLast(16);
      // linkedlist.removeFirst();
      // linkedlist.removeLast();
      // linkedlist.removeAt(1);
      // linkedlist.isEmpty();
      linkedlist.removeObject({ data: 12, name: 'Le Van Tuan' });

      // linkedlist.clear();

      return `Double Linked List: ${linkedlist.toString()}`;
    } catch (error) {
      console.log('error', error);
    }
  }
}
