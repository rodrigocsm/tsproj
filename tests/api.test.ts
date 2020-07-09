import chai, { expect } from 'chai';
import chaiLike from 'chai-like';
import chaiThings from 'chai-things';
import dotenv from 'dotenv';
import path from 'path';
import * as Server from './../src/api/server';

const dotEnvPath = path.resolve('./.env');

dotenv.config({ path: dotEnvPath });

chai.use(chaiLike);
chai.use(chaiThings);

describe('Testando variáveis de ambiente', () => {
    it('Deve ler corretamente a variável PORT', () => {
        const expected = '5000';
        const result = process.env.PORT;
        expect(result).to.equal(expected);
    });
    it('Deve ler corretamente a variável HOST', () => {
        const expected = 'localhost';
        const result = process.env.HOST;
        expect(result).to.equal(expected);
    });
});

describe('API - Rotas dos livros', function () {
    this.beforeAll(async () => {
        await Server.config();
        await Server.start(+(process.env.PORT || 3000), process.env.HOST || 'localhost');
    });
    this.afterAll(async () => {
        await Server.stop();
    });
    it('GET /books deve retornar a lista dos livros', async () => {
        const result = await Server.server.inject({
            method: 'GET',
            url: '/books',
        });
        expect(JSON.parse(result.payload)).to.be.an('array');
    });
});
