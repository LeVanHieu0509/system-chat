import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces';

@Injectable()
export class CatsService {
    private readonly cats: Cat[] = [{ age: 12, breed: "bánh mì", name: "Con chó" }];

    create(cat: Cat) {
        this.cats.push(cat);
    }

    findAll(): Cat[] {
        return this.cats;
    }
}