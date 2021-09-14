import {Collection} from '../../../../src/ingitdb-schema';

// noinspection JSUnusedGlobalSymbols
export const roles: Collection = {
    format: 'json',
    schemaPath: './schema.json',
    manyToManyWith: [
        'auth/users'
    ]
};
