export interface inGitDBMeta {
    version: "0.0.1";
    collectionsDefaultPath?: string;
}

export type Format = 'json';

export interface CollectionBase {
    format?: Format;
    schemaPath?: './schema.json' | string;
}

export interface Collection extends CollectionBase {
    path?: string;
    min?: number; // Minimum number of records in the collection
    max?: number; // Maximum number of records in the collection
    manyToManyWith?: { [id: string]: ManyToMany };
}

export interface ManyToMany {
    min: number;
    max?: number;
}

export interface SubCollection extends CollectionBase {
    parent?: string;
}