import { ObjectID } from 'mongodb';

type IsRequired<T> = undefined extends T ? false : true;
type FieldType<T> = T extends number
    ? typeof Number
    : T extends string
    ? typeof String
    : T extends Date
    ? typeof Date
    : T extends boolean
    ? typeof Boolean
    : T extends ObjectID
    ? typeof ObjectID
    : unknown;
type Field<T> = {
    type: FieldType<T>;
    required: IsRequired<T>;
    enum?: Array<T>;
    default?: T;
    unique?: boolean;
    validate?: { validator: (v: T) => boolean };
    get?: (v: T) => T;
    set?: (v: T) => T;
    ref?: string;
};

export type ModelDefinition<M> = { [P in keyof M]-?: M[P] extends Array<infer U> ? Array<Field<U>> : Field<M[P]> };
