import mongoose from 'mongoose';
import { expect } from 'chai';
import { hyphenate } from 'isbn-utils';
import IBook from '../src/models/book';
import { addBook, getBooksByISBN, getBooksByTitle } from '../src/db/schemas/mongodb/book';
import { getAuthorBooks } from '../src/db/schemas/mongodb/author';
import { getPublisherBooks } from '../src/db/schemas/mongodb/publisher';
import dotenv from 'dotenv';
import path from 'path';

const dotEnvPath = path.resolve('./.env');

dotenv.config({ path: dotEnvPath });

const bookList: Array<IBook> = [
    {
        ISBN: '9788544102749',
        title: 'Guerra dos Tronos',
        authors: ['George R. R. Martin'],
        category: 'Fantasia',
        language: 'pt-br',
        publishedAt: new Date('2015'),
        publisher: 'Leya',
    },
    {
        ISBN: '9788580440270',
        title: 'A Fúria dos Reis',
        authors: ['George R. R. Martin'],
        category: 'Fantasia',
        language: 'pt-br',
        publishedAt: new Date('2010'),
        publisher: 'Leya',
    },
    {
        ISBN: '9788580446289',
        title: 'A Tormenta das Espadas',
        authors: ['George R. R. Martin'],
        category: 'Fantasia',
        language: 'pt-br',
        publishedAt: new Date('2012'),
        publisher: 'Leya',
    },
    {
        ISBN: '9788532530783',
        title: 'Harry Potter e a Pedra Filosofal',
        authors: ['J. K. Rowling'],
        category: 'Fantasia',
        language: 'pt-br',
        publishedAt: new Date('2017'),
        publisher: 'Rocco',
    },
    {
        ISBN: '9788532530554',
        title: 'Harry Potter e a Câmara Secreta',
        authors: ['J. K. Rowling'],
        category: 'Fantasia',
        language: 'pt-br',
        publishedAt: new Date('2016'),
        publisher: 'Rocco',
    },
];
const connection_string = process.env.CONN_STRING;
let db: typeof mongoose;
describe('Teste das funções de acesso ao banco', function () {
    this.timeout(0);
    this.beforeAll(async () => {
        db = await mongoose.connect(connection_string, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });
    });
    this.afterAll(async () => {
        await db.connection.dropDatabase();
        await db.disconnect();
    });
    it('Deve salvar um livro no banco e retornar o id', async () => {
        for (const book of bookList) {
            const id = await addBook(book);
            const result = id ? id : 'invalid';
            expect(mongoose.Types.ObjectId.isValid(result));
        }
    });
    it('Deve retornar um livro se buscado por seu ISBN', async () => {
        const bookInfo = await getBooksByISBN({ ISBN: bookList[1].ISBN });
        const result = bookInfo === false ? { title: 'invalid' } : bookInfo;
        expect(result.title).to.be.equal(bookList[1].title);
    });
    it('Deve retornar os autores como um array de strings', async () => {
        const bookInfo = await getBooksByISBN({ ISBN: bookList[0].ISBN });
        const result = bookInfo === false ? { authors: [''] } : bookInfo;
        expect(result.authors).to.be.deep.equal(bookList[0].authors);
    });
    it('Deve retornar a editora como um string', async () => {
        const bookInfo = await getBooksByISBN({ ISBN: bookList[0].ISBN });
        const result = bookInfo === false ? { publisher: 'invalid' } : bookInfo;
        expect(result.publisher).to.be.deep.equal(bookList[0].publisher);
    });
    it('Deve retornar um livro se buscado por seu título', async () => {
        const bookInfo = await getBooksByTitle({ title: bookList[0].title });
        const result = bookInfo === false ? { ISBN: 'invalid' } : bookInfo;
        expect(result.ISBN).to.be.equal(hyphenate(bookList[0].ISBN));
    });
    it('Deve retornar uma lista com os títulos do livros de um autor', async () => {
        const books = await getAuthorBooks({ name: bookList[0].authors[0].toString() });
        const result = books === false ? [] : books;
        const expected = bookList
            .filter((book) => book.authors[0] === bookList[0].authors[0])
            .map((book) => book.title);
        expect(result).to.be.deep.equal(expected);
    });
    it('Deve retornar uma lista com os títulos do livros de uma editora', async () => {
        const books = await getPublisherBooks({ name: bookList[0].publisher.toString() });
        const result = books === false ? [] : books;
        const expected = bookList.filter((book) => book.publisher === bookList[0].publisher).map((book) => book.title);
        expect(result).to.be.deep.equal(expected);
    });
});
