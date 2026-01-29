import { describe, it, expect, beforeEach } from "vitest";
import { CreatePostTypeUseCase } from "./create-post-type.use-case";
import { InMemoryPostTypeRepository } from "../../../test/infra/repositories/in-memory-post-type-repository";
import { ResourceAlreadyExistsException } from "@caffeine/errors/application";
import { t } from "@caffeine/models";
import { PostType } from "@/domain/post-type";
import { PostTypeSchemaFactory } from "@/domain/factories/post-type-schema.factory";
import { slugify } from "@caffeine/models/helpers";

describe("CreatePostTypeUseCase", () => {
	let useCase: CreatePostTypeUseCase;
	let repository: InMemoryPostTypeRepository;

	beforeEach(() => {
		repository = new InMemoryPostTypeRepository();
		useCase = new CreatePostTypeUseCase(repository);
	});

	it("should create a new post type", async () => {
		const input = {
			name: "New Post Type",
			schema: JSON.stringify(t.Object({ content: t.String() })),
		};

		const result = await useCase.run(input);

		expect(result).toMatchObject({
			name: input.name,
			slug: "new-post-type",
		});

		const created = await repository.findBySlug("new-post-type");
		expect(created).toBeDefined();
		expect(created?.name).toBe(input.name);
	});

	it("should throw ResourceAlreadyExistsException if slug already exists", async () => {
		const name = "Existing Post Type";
		const slug = slugify(name);
		const schemaStr = JSON.stringify(t.Object({ content: t.String() }));

		// Pre-populate repository
		const existingPostType = PostType.make(
			{ name, slug, isHighlighted: false },
			PostTypeSchemaFactory.make(schemaStr),
		);
		await repository.create(existingPostType);

		const input = {
			name: name,
			schema: schemaStr,
		};

		await expect(useCase.run(input)).rejects.toThrow(
			ResourceAlreadyExistsException,
		);
	});
});
