import { ModelDefinition } from './common';
import { ObjectID } from 'mongodb';
import mongoose, { Document, Schema } from 'mongoose';
import IBook from '../../../models/book';
import IPublisher from '../../../models/publisher';

const definition: ModelDefinition<IPublisher> = {
    name: { type: String, required: true, unique: true },
    books: [{ type: ObjectID, ref: 'Book', required: true }],
};

export const schema = new Schema<ModelDefinition<IPublisher>>(definition);

export const model = mongoose.models['Publisher']
    ? mongoose.model<IPublisher & Document>('Publisher')
    : mongoose.model<IPublisher & Document>('Publisher', schema);

export async function getPublisherId(name: string): Promise<ObjectID | false> {
    try {
        const result = await model.findOne({ name: name });
        return result?._id ?? false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function addPublisher(author: IPublisher): Promise<ObjectID | false> {
    try {
        const result = await model.create(author);
        return result?._id ?? false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function addBookToPublisher(publisherID: ObjectID, bookID: ObjectID): Promise<ObjectID | false> {
    try {
        const result = await model.findOneAndUpdate(
            { _id: publisherID },
            { $push: { books: bookID } },
            { useFindAndModify: false },
        );
        return result?._id ?? false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function getPublisherBooks(
    query: Partial<Omit<IPublisher & Pick<mongoose.Document, '_id'>, 'books'>>,
): Promise<Array<string | ObjectID> | false> {
    try {
        const search = await (await model.findOne(query).populate('books', 'title -_id'))?.execPopulate();
        return search?.books.map((book) => (book as IBook).title) ?? [];
    } catch (error) {
        console.error(error);
        return false;
    }
}
