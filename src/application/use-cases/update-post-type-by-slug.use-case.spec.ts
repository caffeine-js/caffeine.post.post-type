import { describe, it, expect, beforeEach } from "vitest";
import { UpdatePostTypeBySlugUseCase } from "./update-post-type-by-slug.use-case";
import { InMemoryPostTypeRepository } from "../../../test/infra/repositories/in-memory-post-type-repository";
import {
	ResourceNotFoundException,
	ResourceAlreadyExistsException,
} from "@caffeine/errors/application";
import { PostType } from "@/domain/post-type";
import { PostTypeSchemaFactory } from "@/domain/factories/post-type-schema.factory";
import { t } from "@caffeine/models";

describe("UpdatePostTypeBySlugUseCase", () => {
	let useCase: UpdatePostTypeBySlugUseCase;
	let repository: InMemoryPostTypeRepository;
	let schemaStr: string;

	beforeEach(() => {
		repository = new InMemoryPostTypeRepository();
		useCase = new UpdatePostTypeBySlugUseCase(repository);
		schemaStr = JSON.stringify(t.Object({ content: t.String() }));
	});

	it("should update post type name and slug", async () => {
		const slug = "old-name";
		const pt = PostType.make(
			{ name: "Old Name", slug, isHighlighted: false },
			PostTypeSchemaFactory.make(schemaStr),
		);
		await repository.create(pt);

		const input = { name: "New Name" };

		const result = await useCase.run(slug, input);

		expect(result.name).toBe("New Name");
		expect(result.slug).toBe("new-name");

		const updatedInRepo = await repository.findBySlug("new-name");
		expect(updatedInRepo).toBeDefined();
		const oldInRepo = await repository.findBySlug(slug);
		expect(oldInRepo).toBeNull();
	});

	it("should update isHighlighted status", async () => {
		const slug = "test-item";
		const pt = PostType.make(
			{ name: "Test Item", slug, isHighlighted: false },
			PostTypeSchemaFactory.make(schemaStr),
		);
		await repository.create(pt);

		const input = { isHighlighted: true };

		const result = await useCase.run(slug, input);

		expect(result.isHighlighted).toBe(true);

		const updatedInRepo = await repository.findBySlug(slug);
		expect(updatedInRepo?.isHighlighted).toBe(true);
	});

	it("should throw ResourceNotFoundException if post type not found", async () => {
		const slug = "non-existent";
		const input = { name: "New Name" };

		await expect(useCase.run(slug, input)).rejects.toThrow(
			ResourceNotFoundException,
		);
	});

	it("should throw ResourceAlreadyExistsException if new name causes slug collision", async () => {
		const slug1 = "item-one";
		const pt1 = PostType.make(
			{ name: "Item One", slug: slug1, isHighlighted: false },
			PostTypeSchemaFactory.make(schemaStr),
		);
		await repository.create(pt1);

		const slug2 = "item-two";
		const pt2 = PostType.make(
			{ name: "Item Two", slug: slug2, isHighlighted: false },
			PostTypeSchemaFactory.make(schemaStr),
		);
		await repository.create(pt2);

		// Try to rename item-two to "Item One" (collides with item-one)
		const input = { name: "Item One" };

		await expect(useCase.run(slug2, input)).rejects.toThrow(
			ResourceAlreadyExistsException,
		);
	});

	it("should not update properties if input dto is empty", async () => {
		const slug = "no-update";
		const pt = PostType.make(
			{ name: "No Update", slug, isHighlighted: false },
			PostTypeSchemaFactory.make(schemaStr),
		);
		await repository.create(pt);

		const input = {}; // Empty input
		const result = await useCase.run(slug, input);

		expect(result.name).toBe("No Update");
		expect(result.slug).toBe("no-update");
		expect(result.isHighlighted).toBe(false);

		// Typically updatedAt should NOT change if no props provided,
		// but checking implementation specifically for: if (name || isHighlighted) -> update updatedAt
		// If input is empty, name undefined, isHighlighted undefined.
		// So updatedAt should be same as original creation (assuming we can track it, but here it's fast).
		// We verify at least it didn't crash and logic flowed.
	});
});
