import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateCatDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    age: number;

    @IsNotEmpty()
    breed: string;
}