import { describe, it, expect } from "vitest";
import { PostType } from "./post-type";
import { Schema, t } from "@caffeine/models";
import { InvalidDomainDataException } from "@caffeine/errors/domain";

describe("PostType", () => {
	const validSchema = Schema.make(t.Object({ content: t.String() }));
	const validProps = {
		name: "Test Post Type",
		slug: "test-post-type",
		isHighlighted: false,
	};

	it("should create a PostType with valid data", () => {
		const postType = PostType.make(validProps, validSchema);
		expect(postType).toBeInstanceOf(PostType);
		expect(postType.name).toBe(validProps.name);
	});

	it("should throw InvalidDomainDataException when properties are invalid", () => {
		const invalidProps = {
			...validProps,
			name: undefined, // Invalid: name is required
		};

		expect(() => PostType.make(invalidProps as never, validSchema)).toThrow(
			new InvalidDomainDataException("post@post-type"),
		);
	});

	it("should throw InvalidDomainDataException when schema is not an instance of Schema", () => {
		const invalidSchema = {} as Schema; // Not a Schema instance

		expect(() => PostType.make(validProps, invalidSchema)).toThrow(
			new InvalidDomainDataException("post@post-type:schema"),
		);
	});
});
