import { beforeEach, describe, expect, it } from "bun:test";
import { CreatePostTypeUseCase } from "./create-post-type.use-case";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { ResourceAlreadyExistsException } from "@caffeine/errors/application";
import { Schema } from "@caffeine/schema";
import { t } from "@caffeine/models";
import type { IPostTypeUniquenessCheckerService } from "@/domain/types/services";
import { SlugUniquenessCheckerService } from "@caffeine/domain/services";

describe("CreatePostTypeUseCase", () => {
	let repository: PostTypeRepository;
	let uniquenessChecker: IPostTypeUniquenessCheckerService;
	let sut: CreatePostTypeUseCase;

	const validSchemaString = Schema.make(
		t.Object({ content: t.String() }),
	).toString();

	beforeEach(() => {
		repository = new PostTypeRepository();
		uniquenessChecker = new SlugUniquenessCheckerService(repository);
		sut = new CreatePostTypeUseCase(repository, uniquenessChecker);
	});

	it("should create a post type successfully", async () => {
		const result = await sut.run({
			name: "Test Post Type",
			schema: validSchemaString,
		});

		expect(result).toBeDefined();
		expect(result.name).toBe("Test Post Type");
		expect(repository.items).toHaveLength(1);
		expect(repository.items[0]).toEqual(result);
	});

	it("should throw ResourceAlreadyExistsException if slug is already taken", async () => {
		await sut.run({
			name: "Test Post Type",
			schema: validSchemaString,
		});

		await expect(
			sut.run({
				name: "Test Post Type",
				schema: validSchemaString,
			}),
		).rejects.toThrow(ResourceAlreadyExistsException);
	});
});
