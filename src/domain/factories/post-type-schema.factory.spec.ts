import { describe, it, expect } from "vitest";
import { PostTypeSchemaFactory } from "./post-type-schema.factory";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { Schema, t } from "@caffeine/models";

describe("PostTypeSchemaFactory", () => {
	it("should create a Schema from a valid JSON schema string", () => {
		const validSchemaStr = JSON.stringify(t.Object({ content: t.String() }));
		const schema = PostTypeSchemaFactory.make(validSchemaStr);
		expect(schema).toBeInstanceOf(Schema);
	});

	it("should throw InvalidDomainDataException when string is not a valid schema", () => {
		const invalidSchemaStr = "invalid-json-schema";

		expect(() => PostTypeSchemaFactory.make(invalidSchemaStr)).toThrow(
			new InvalidDomainDataException(
				"post@post-type:schema",
				"The provided schema is invalid.",
			),
		);
	});
});
