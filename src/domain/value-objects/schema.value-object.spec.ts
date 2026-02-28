import { describe, expect, it, spyOn } from "bun:test";
import { SchemaVO } from "./schema.value-object";
import { t } from "@caffeine/models";
import { Schema, SchemaManager } from "@caffeine/schema";

describe("SchemaVO", () => {
	const info = { name: "schema", source: "domain" };

	it("should create a valid instance with a valid JSON string", () => {
		const schemaInstance = Schema.make(
			t.Object({ content: t.String({ minLength: 1 }) }),
		);
		const validJsonSchema = schemaInstance.toString();

		const vo = SchemaVO.make(validJsonSchema, info);

		expect(vo.value).toBeInstanceOf(Schema);
		expect(vo.value.toString()).toBe(validJsonSchema);
	});

	it("should throw an error if value is not a valid typed string at runtime", () => {
		// @ts-expect-error Testing runtime validation for incorrect type
		expect(() => SchemaVO.make(123, info)).toThrow();
	});

	it("should throw an error for invalid JSON string", () => {
		expect(() => SchemaVO.make("invalid json string", info)).toThrow();
	});

	it("should throw InvalidPropertyException when validate() fails defensively", () => {
		const validJsonSchema = Schema.make(
			t.Object({ content: t.String({ minLength: 1 }) }),
		).toString();

		const spy = spyOn(SchemaManager, "isSchema").mockReturnValue(false);

		expect(() => SchemaVO.make(validJsonSchema, info)).toThrow();

		spy.mockRestore();
	});
});
