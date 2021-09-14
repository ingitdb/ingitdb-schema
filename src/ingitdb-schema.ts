export interface inGitDBMeta {
    version: "0.0.1";
    collectionsDefaultPath?: string;
}

export type Format = 'json';

export interface CollectionBase {
    format: Format;
    schemaPath?: './schema.json' | string;
}

export interface Collection extends CollectionBase {
    path?: string;
    manyToManyWith?: string[];
}

export interface SubCollection extends CollectionBase {
    parent?: string;
}