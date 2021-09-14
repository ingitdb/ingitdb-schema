import {Collection} from '../../../../src/ingitdb-schema';

// noinspection JSUnusedGlobalSymbols
export const users: Collection = {
    format: 'json',
    schemaPath: './schema.json',
    manyToManyWith: [
        'auth/users'
    ]
};
