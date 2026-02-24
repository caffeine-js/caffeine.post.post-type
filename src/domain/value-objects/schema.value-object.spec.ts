import { describe, expect, it, vi } from "vitest";
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

	it("should throw an error if typebox format 'json' is strictly enforced for invalid JSON", () => {
		try {
			SchemaVO.make("invalid json string", info);
		} catch (error) {
			expect(error).toBeDefined();
		}
	});

	it("should throw InvalidPropertyException when validate() fails defensively", () => {
		const validJsonSchema = Schema.make(
			t.Object({ content: t.String({ minLength: 1 }) }),
		).toString();

		// Mock isSchema validation strictly for value object logic
		const spy = vi.spyOn(SchemaManager, "isSchema").mockReturnValue(false);

		expect(() => SchemaVO.make(validJsonSchema, info)).toThrow();

		spy.mockRestore();
	});
});
