import { ObjectID } from 'mongodb';
import IBook from './book';

export default interface IPublisher {
    name: string;
    books: Array<ObjectID | string | IBook>;
}
