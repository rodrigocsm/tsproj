import { ModelDefinition } from './common';
import { ObjectID } from 'mongodb';
import mongoose, { Document, Schema } from 'mongoose';
import IAuthor from '../../../models/author';
import IBook from '../../../models/book';

const definition: ModelDefinition<IAuthor> = {
    name: { type: String, required: true, unique: true },
    books: [{ type: ObjectID, ref: 'Book', required: true }],
};

export const schema = new Schema<ModelDefinition<IAuthor>>(definition);

export const model = mongoose.models['Author']
    ? mongoose.model<IAuthor & Document>('Author')
    : mongoose.model<IAuthor & Document>('Author', schema, 'Author');

export async function getAuthorId(query: Pick<IAuthor, 'name'>): Promise<ObjectID | false> {
    try {
        const result = await model.findOne(query);
        return result?._id ?? false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function addAuthor(author: IAuthor): Promise<ObjectID | false> {
    try {
        const result = await model.create(author);
        return result?._id ?? false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function addBookToAuthor(authorID: ObjectID, bookID: ObjectID): Promise<ObjectID | false> {
    try {
        const result = await model.findOneAndUpdate(
            { _id: authorID },
            { $push: { books: bookID } },
            { useFindAndModify: false },
        );
        return result?._id ?? false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function getAuthorBooks(
    query: Partial<Omit<IAuthor & Pick<mongoose.Document, '_id'>, 'books'>>,
): Promise<Array<string | ObjectID> | false> {
    try {
        const search = await (await model.findOne(query).populate('books', 'title -_id'))?.execPopulate();
        return search?.books.map((book) => (book as IBook).title) ?? [];
    } catch (error) {
        console.error(error);
        return false;
    }
}
