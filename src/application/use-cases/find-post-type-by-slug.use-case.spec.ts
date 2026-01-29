import { describe, it, expect, beforeEach } from "vitest";
import { FindPostTypeBySlugUseCase } from "./find-post-type-by-slug.use-case";
import { InMemoryPostTypeRepository } from "../../../test/infra/repositories/in-memory-post-type-repository";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import { PostType } from "@/domain/post-type";
import { PostTypeSchemaFactory } from "@/domain/factories/post-type-schema.factory";
import { t } from "@caffeine/models";

describe("FindPostTypeBySlugUseCase", () => {
	let useCase: FindPostTypeBySlugUseCase;
	let repository: InMemoryPostTypeRepository;

	beforeEach(() => {
		repository = new InMemoryPostTypeRepository();
		useCase = new FindPostTypeBySlugUseCase(repository);
	});

	it("should return a post type by slug", async () => {
		const slug = "test-slug";
		const schemaStr = JSON.stringify(t.Object({}));
		const schema = PostTypeSchemaFactory.make(schemaStr);

		const postType = PostType.make(
			{ name: "Test Post Type", slug, isHighlighted: false },
			schema,
		);
		await repository.create(postType);

		const result = await useCase.run(slug);

		expect(result.slug).toBe(slug);
		expect(result.name).toBe("Test Post Type");
	});

	it("should throw ResourceNotFoundException if post type not found", async () => {
		const slug = "non-existent-slug";
		await expect(useCase.run(slug)).rejects.toThrow(ResourceNotFoundException);
	});
});
