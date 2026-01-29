import { describe, it, expect } from "vitest";
import { BuildPostType } from "./build-post-type.service";
import { PostType } from "../post-type";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { slugify, generateUUID } from "@caffeine/models/helpers";
import { t } from "@caffeine/models";

describe("BuildPostTypeService", () => {
	const validSchemaStr = JSON.stringify(t.Object({ content: t.String() }));
	const validUnmountedPostType = {
		id: generateUUID(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		name: "Test Type",
		slug: slugify("Test Type"),
		isHighlighted: true,
		schema: validSchemaStr,
	};

	it("should build a PostType from valid unmounted data", () => {
		const postType = BuildPostType.run(validUnmountedPostType);

		expect(postType).toBeInstanceOf(PostType);
		expect(postType.name).toBe(validUnmountedPostType.name);
		expect(postType.isHighlighted).toBe(validUnmountedPostType.isHighlighted);
		expect(postType.schema.toString()).toBe(validSchemaStr);
	});

	it("should throw InvalidDomainDataException if validation fails", () => {
		const invalidData = { ...validUnmountedPostType, id: undefined };

		expect(() => BuildPostType.run(invalidData as never)).toThrow(
			InvalidDomainDataException,
		);
	});
});
