export function hello(): string {
    return 'Hello World!';
}

export function helloWho(nome: string): string {
    return `Hello ${nome}!`;
}

console.log(hello());
