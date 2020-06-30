import { expect } from 'chai';
import { hello, helloWho } from './../src/index';

describe('Testes iniciais', function () {
    it('Deve receber o Hello World', () => {
        const result: string = hello();
        expect(result).to.equal('Hello World!');
    });

    it('Deve receber Hello + nome', () => {
        const nome = 'Rodrigo';
        const result: string = helloWho(nome);
        expect(result).to.equal(`Hello ${nome}!`);
    });
});
