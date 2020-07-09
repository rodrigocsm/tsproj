import { ModelDefinition } from './common';
import { parse, hyphenate } from 'isbn-utils';
import { ObjectID } from 'mongodb';
import mongoose, { Document, Schema } from 'mongoose';
import IBook from '../../../models/book';
import IAuthor from '../../../models/author';
import IPublisher from '../../../models/publisher';
import { getAuthorId, addAuthor, addBookToAuthor } from './author';
import { getPublisherId, addPublisher, addBookToPublisher } from './publisher';

const definition: ModelDefinition<IBook> = {
    ISBN: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => parse(v) !== null,
        },
        set: (v) => hyphenate(v),
    },
    title: { type: String, required: true },
    authors: [{ type: ObjectID, required: true, ref: 'Author' }],
    publisher: { type: ObjectID, required: true, ref: 'Publisher' },
    description: { type: String, required: false, default: 'Add Description' },
    category: { type: String, required: true },
    language: { type: String, required: true, enum: ['en', 'pt-br', 'es', 'fr'], default: 'pt-br' },
    rate: { type: Number, required: false, default: 0 },
    publishedAt: { type: Date, required: true },
    isRead: { type: Boolean, required: false, default: false },
};

export const schema = new Schema<ModelDefinition<IBook>>(definition);

export const model = mongoose.models['Book']
    ? mongoose.model<IBook & Document>('Book')
    : mongoose.model<IBook & Document>('Book', schema);

export async function addBook(book: IBook): Promise<ObjectID | false> {
    const authorIds: ObjectID[] = [];
    for (const authorName of book.authors) {
        if (typeof authorName !== 'string') return false;
        let id = await getAuthorId({ name: authorName });
        if (!id) id = await addAuthor({ name: authorName, books: [] });
        if (!id) return false;
        authorIds.push(id);
    }
    if (typeof book.publisher !== 'string') return false;
    let publisherId = await getPublisherId(book.publisher);
    if (!publisherId) publisherId = await addPublisher({ name: book.publisher, books: [] });
    if (!publisherId) return false;
    try {
        const created = await model.create({ ...book, publisher: publisherId, authors: authorIds });
        if (!created._id) return false;
        for (const author of created.authors) {
            if (!(author instanceof ObjectID)) return false;
            const id = await addBookToAuthor(author, created?._id);
            if (!id) return false;
        }
        if (!(created.publisher instanceof ObjectID)) return false;
        const id = await addBookToPublisher(created.publisher, created?._id);
        if (!id) return false;
        return created?._id ?? false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function getBooksByISBN(isbn: Pick<IBook, 'ISBN'>): Promise<IBook | false> {
    try {
        const search = await (await model?.findOne(isbn)?.populate('authors')?.populate('publisher'))?.execPopulate();
        const authors = search?.authors.map((author) => (author as IAuthor).name ?? '') ?? [];
        const publisher = (search?.publisher as IPublisher).name ?? '';
        if (!search) return false;
        return { ...search.toObject(), publisher: publisher, authors: authors };
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function getBooksByTitle(title: Pick<IBook, 'title'>): Promise<IBook | false> {
    try {
        const result = await model
            ?.findOne(title)
            ?.populate('authors', 'name -_id')
            ?.populate('publisher', 'name -_id');
        return (await result?.execPopulate()) ?? false;
    } catch (error) {
        console.log(error);
        return false;
    }
}
