import { ObjectID } from 'mongodb';
import IAuthor from './author';
import IPublisher from './author';

export default interface IBook {
    ISBN: string;
    title: string;
    authors: Array<ObjectID | string | IAuthor>;
    publisher: ObjectID | string | IPublisher;
    description?: string;
    category: string;
    language: string;
    publishedAt: Date;
    isRead?: boolean;
    rate?: number;
}
