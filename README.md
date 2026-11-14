# inGitDB JSON Schemas

This directory contains [JSON Schema](https://json-schema.org/) definitions for **inGitDB** configuration and collection definition files.

<!-- dev-approach:v1 -->
## Our approach to development

We build with our own tooling:

- **[SpecScore](https://specscore.md)** — specify requirements as `SpecScore.md` artifacts
- **[SpecStudio](https://specscore.studio)** — author & manage specs across their lifecycle
- **[inGitDB](https://ingitdb.com)** — store structured data in Git where applicable
- **[DALgo](https://dalgo.io)** — data access layer for Go
- **[cover100.dev](https://cover100.dev)** — drive toward 100% test coverage
- **[DataTug](https://datatug.io)** — query & explore data
<!-- /dev-approach -->

## Schemas

| Schema | File it describes |
| ------ | ----------------- |
| `ingitdb-root-collections.schema.json` | `.ingitdb/root-collections.yaml` |
| `ingitdb-settings.schema.json` | `.ingitdb/settings.yaml` |
| `ingitdb-collection.schema.json` | `<collection>/.collection/definition.yaml` (and `.collection/subcollections/<sub>/definition.yaml`) |
| `ingitdb-root-config.schema.json` | Deprecated: the single `.ingitdb.yaml` of the older layout, which the current reader does not read. Kept so existing references resolve. |

### `ingitdb-root-collections.schema.json`

`.ingitdb/root-collections.yaml` is a flat YAML map (no wrapper key) from a root collection id to its
directory, relative to the database root:

```yaml
tasks.backlog: data/tasks/backlog
countries: countries
```

### `ingitdb-settings.schema.json`

`.ingitdb/settings.yaml` holds `default_namespace`, `default_record_format`, `languages` and
`cache_control`. Unknown keys are rejected.

### `ingitdb-collection.schema.json`

Schema for a collection definition, `.collection/definition.yaml` inside the collection directory.
Unknown keys are rejected by inGitDB, and by this schema.

**Top-level properties:**

| Property              | Type                   | Required | Description                                                                 |
| --------------------- | ---------------------- | -------- | --------------------------------------------------------------------------- |
| `inherits`            | `string`               | No       | Path of a partial base definition to overlay under this one.                |
| `titles`              | `map[string]string`    | No       | Localized collection titles keyed by locale code.                           |
| `record_file`         | `RecordFileDef`        | **Yes**¹ | Defines file naming, format, and record storage type.                       |
| `data_dir`            | `string`               | No       | Relative path to the data files directory.                                  |
| `columns`             | `map[string]ColumnDef` | **Yes**¹ | Column definitions (at least one required).                                 |
| `columns_order`       | `string[]`             | No       | Display order of columns (unique, no duplicates).                           |
| `primary_key`         | `string[]`             | No       | Source primary key columns, written by importers.                           |
| `source_schema`       | `object`               | No       | Relational schema of an imported collection, written by importers.          |
| `default_view`        | `ViewDef`              | No       | The default view, declared inline.                                          |
| `readme`              | `object`               | No       | Controls the generated collection README.                                   |
| `min_records_count`   | `integer`              | No       | At least this many records (per parent record for a subcollection).         |
| `max_records_count`   | `integer`              | No       | At most this many records (per parent record for a subcollection).          |
| `conflict_resolution` | `object`               | No       | Per-collection conflict-resolution overrides.                               |
| `cache_control`       | `string`               | No       | HTTP Cache-Control directive for this collection's files.                   |

¹ Unless inherited through `inherits`. An `id` key is accepted and ignored: the id is the directory name.

**`RecordFileDef`** — defines how records are stored:

| Property            | Type     | Required | Description                                                                                       |
| ------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------- |
| `name`              | `string` | **Yes**  | File name pattern (supports `{key}` and column placeholders).                                     |
| `format`            | `enum`   | **Yes**  | `yaml` · `yml` · `json` · `markdown` · `toml` · `ingr` · `csv` · `jsonl` (lowercase).             |
| `type`              | `enum`   | **Yes**  | `map[string]any` (one record per file) · `[]map[string]any` (list) · `map[$record_id]map[$field_name]any` (map keyed by record id) |
| `records_dir`       | `string` | No       | Directory of the record files below the data directory; `.` is the data directory itself.         |
| `exclude_regex`     | `string` | No       | File names matching it are not records.                                                           |
| `content_field`     | `string` | No       | Markdown format only: the field that receives the body.                                           |
| `csv_cell_encoding` | `enum`   | No       | `json-v1`, csv format only.                                                                       |
| `key_encoding`      | `enum`   | No       | `none` (default: the file name is the key as it is) or `tilde-v1` (see below).                    |

**Record key encoding (`key_encoding: tilde-v1`).** A record key becomes a file or directory name one byte at a time: `A`–`Z`, `a`–`z`, `0`–`9` and `-` `_` `.` `@` `+` `=` `,` are kept; every other byte, `~` included, is written as `~` and two upper-case hexadecimal digits; a `.` that is the first or last byte, and the first byte of a key that (up to its first `.`, in any case) is a Windows device name, are written that way too. So `a/b` is stored as `a~2Fb`, `..` as `~2E~2E`, `CON` as `~43ON`, `é` as `~C3~A9`. Every reader shows the decoded key, and a name the encoding never writes is an error. Letter case is kept: record files or parent record directories that differ only in case are reported, and writers refuse to create one. With one record per file, a key whose file name would exceed 255 bytes is an error: such keys need a collection that keeps its records in one file. The full rules are in the ingitdb-go spec `record-key-encoding`; `ingitdb.EncodeRecordKey` and `ingitdb.DecodeRecordKey` implement them.

**`ColumnDef`** — defines a column in the collection:

| Property        | Type                | Required | Description                                                                                                                                    |
| --------------- | ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | `string` / `enum`   | **Yes**  | `string`, `int`, `float`, `bool`, `date`, `time`, `datetime`, `any`, `map[locale]string`, `map[keyType]valueType`, or a list `[]elementType`. |
| `title`         | `string`            | No       | Single-locale display title.                                                                                                                   |
| `titles`        | `map[string]string` | No       | Localized titles keyed by locale.                                                                                                              |
| `valueTitle`    | `string`            | No       | Display title for the column value.                                                                                                            |
| `required`      | `boolean`           | No       | Whether a value is required (default: `false`).                                                                                                |
| `required_when` | `string`            | No       | Starlark expression; required when it is True. Not combined with `required`.                                                                  |
| `length`        | `integer`           | No       | Exact length (characters, list elements, or map entries).                                                                                      |
| `min_length`    | `integer`           | No       | Minimum length.                                                                                                                                |
| `max_length`    | `integer`           | No       | Maximum length.                                                                                                                                |
| `min_value`     | `number`            | No       | Inclusive lower bound of a numeric column.                                                                                                     |
| `max_value`     | `number`            | No       | Inclusive upper bound of a numeric column.                                                                                                     |
| `enum`          | `array`             | No       | Permitted values.                                                                                                                              |
| `foreign_key`   | `string`            | No       | Root collection whose record keys the value must match (e.g. `users` or `auth.users`), or a subcollection path (`ext/commitius/cmSessions`, `spaces/$same/ext/$same/agreements`, `spaces/{spaceID}/ext/calendarius/happenings`). |
| `columns`       | `map[string]ColumnDef` | No    | Fields of a nested object; only on `any` (object values only) or a map type other than `map[locale]string`.                                    |
| `values`        | `ColumnDef`         | No       | Shape of every value of a map column (not `map[locale]string`); its `type` is the map's value type, written the same way.                     |
| `items`         | `ColumnDef`         | No       | Shape of every element of a list column (`[]T`); its `type` is `T`.                                                                            |
| `locale`        | `string`            | No       | Pairs the column with its `map[locale]string` sibling.                                                                                         |
| `format`        | `string`            | No       | Free-form content hint (markdown, html, uri, ...); not validated.                                                                              |
| `formula`       | `string`            | No       | Starlark expression of a computed column (never stored).                                                                                       |

`null` for `columns`, `values` or `items` is the same as leaving it out. A definition that uses any of the three needs an ingitdb-go release that has them; older readers refuse the whole database (definitions are decoded strictly), so every consumer upgrades first.

The column named `$ID` describes the record key. Typed `int` (no `+`, no leading zeros), `float`
(shortest decimal form: `1.5`, not `1.50` or `1e+06`), `bool`, `date` (`YYYY-MM-DD`), `time`
(`H:MM` or `H:MM:SS`, optional fractional seconds) or `datetime` (`YYYY-MM-DDTHH:MM:SS`, optional
fractional seconds and zone; RFC 3339 is a subset), every record key must parse as that type. The
JSON Schema cannot check this; `ingitdb validate` does. Ordinary temporal columns accept any text.

## Usage

Reference the schemas in your YAML files for IDE validation and autocompletion:

```yaml
# yaml-language-server: $schema=./schemas/ingitdb-collection.schema.json
```

## Source of Truth

These schemas are derived from the Go struct definitions in [`ingitdb-go/ingitdb/`](https://github.com/ingitdb/ingitdb-go/tree/main/ingitdb):

- [`definition.go`](https://github.com/ingitdb/ingitdb-go/blob/main/ingitdb/definition.go) — `Definition`
- [`collection_def.go`](https://github.com/ingitdb/ingitdb-go/blob/main/ingitdb/collection_def.go) — `CollectionDef`
- [`record_file_def.go`](https://github.com/ingitdb/ingitdb-go/blob/main/ingitdb/record_file_def.go) — `RecordFileDef`
- [`column_def.go`](https://github.com/ingitdb/ingitdb-go/blob/main/ingitdb/column_def.go) — `ColumnDef`
- [`column_type.go`](https://github.com/ingitdb/ingitdb-go/blob/main/ingitdb/column_type.go) — `ColumnType`
- [`config/root_config.go`](https://github.com/ingitdb/ingitdb-go/blob/main/ingitdb/config/root_config.go) — `Settings`, root collections
- [`view_def.go`](https://github.com/ingitdb/ingitdb-go/blob/main/ingitdb/view_def.go) — `ViewDef`

They are written by hand. When a field is added to one of these Go structs, add it here too:
the reader rejects unknown keys, so a schema that lags the code rejects valid definitions.
