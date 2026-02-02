import { describe, it, expect, beforeEach } from "vitest";
import { FindPostTypeByIdUseCase } from "./find-post-type-by-id.use-case";
import { PostTypeRepository } from "@/infra/repositories/test/post-type-repository";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import { PostType } from "@/domain/post-type";
import { PostTypeSchemaFactory } from "@/domain/factories/post-type-schema.factory";
import { t } from "@caffeine/models";

describe("FindPostTypeByIdUseCase", () => {
	let useCase: FindPostTypeByIdUseCase;
	let repository: PostTypeRepository;

	beforeEach(() => {
		repository = new PostTypeRepository();
		useCase = new FindPostTypeByIdUseCase(repository);
	});

	it("should find post type by id", async () => {
		const schemaStr = JSON.stringify(t.Object({ content: t.String() }));
		const pt = PostType.make(
			{ name: "Test Item", slug: "test-item", isHighlighted: false },
			PostTypeSchemaFactory.make(schemaStr),
		);
		await repository.create(pt);

		const result = await useCase.run(pt.id);

		expect(result).toBeDefined();
		expect(result.id).toBe(pt.id);
		expect(result.slug).toBe("test-item");
		expect(result.name).toBe("Test Item");
	});

	it("should throw ResourceNotFoundException if post type not found", async () => {
		const nonExistentId = "non-existent-id";

		await expect(useCase.run(nonExistentId)).rejects.toThrow(
			ResourceNotFoundException,
		);
	});

	it("should trim the id before searching", async () => {
		const schemaStr = JSON.stringify(t.Object({ content: t.String() }));
		const pt = PostType.make(
			{ name: "Test Item", slug: "test-item", isHighlighted: false },
			PostTypeSchemaFactory.make(schemaStr),
		);
		await repository.create(pt);

		const result = await useCase.run(`  ${pt.id}  `);

		expect(result).toBeDefined();
		expect(result.id).toBe(pt.id);
	});
});
