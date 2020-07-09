import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { addBook, getBooksByISBN } from './db/schemas/mongodb/book';

dotenv.config({ debug: true });

const connection_string = process.env.DB_CONNECTION_STRING || '';

(async () => {
    const db = await mongoose.connect(connection_string, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
    const newBook = {
        ISBN: '9788566428452',
        title: 'Onde está a ovelha verde?',
        authors: ['Mem Fox'],
        category: 'Infantil',
        language: 'pt-br',
        publishedAt: new Date('2017'),
        publisher: 'Saber e Ler Editora',
    };
    const bookID = await addBook(newBook);
    console.log(bookID);
    const bookInfo = await getBooksByISBN({ ISBN: '9788566428452' });
    console.log(bookInfo);
    await db.connection.dropDatabase();
    await db.disconnect();
})();
