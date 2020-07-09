import { ObjectID } from 'mongodb';
import IBook from './book';

export default interface IAuthor {
    name: string;
    books: Array<ObjectID | string | IBook>;
}
