import { describe, it, expect, beforeEach } from "vitest";
import { DeletePostTypeBySlugUseCase } from "./delete-post-type-by-slug.use-case";
import { InMemoryPostTypeRepository } from "../../../test/infra/repositories/in-memory-post-type-repository";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import { PostType } from "@/domain/post-type";
import { PostTypeSchemaFactory } from "@/domain/factories/post-type-schema.factory";
import { t } from "@caffeine/models";

describe("DeletePostTypeBySlugUseCase", () => {
	let useCase: DeletePostTypeBySlugUseCase;
	let repository: InMemoryPostTypeRepository;

	beforeEach(() => {
		repository = new InMemoryPostTypeRepository();
		useCase = new DeletePostTypeBySlugUseCase(repository);
	});

	it("should delete a post type by slug", async () => {
		const slug = "post-type-to-delete";
		const schemaStr = JSON.stringify(t.Object({ content: t.String() }));

		const postType = PostType.make(
			{ name: "Post Type To Delete", slug, isHighlighted: false },
			PostTypeSchemaFactory.make(schemaStr),
		);
		await repository.create(postType);

		await useCase.run(slug);

		const deleted = await repository.findBySlug(slug);
		expect(deleted).toBeNull();
	});

	it("should throw ResourceNotFoundException if post type not found", async () => {
		const slug = "non-existent-slug";
		await expect(useCase.run(slug)).rejects.toThrow(ResourceNotFoundException);
	});
});
