import { t } from "@caffeine/models";

export const SchemaDTO = t.String({
	format: "json",
	description:
		"A serialized TypeBox schema in JSON format that defines the structure and validation rules for a post type. It is typically generated and managed via `SchemaManager`.",
	examples: [
		'{"type":"object","properties":{"content":{"type":"string","minLength":1}},"required":["content"]}',
	],
});

export type SchemaDTO = t.Static<typeof SchemaDTO>;
