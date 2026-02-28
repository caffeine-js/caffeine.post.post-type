import { beforeEach, describe, expect, it } from "bun:test";
import { DeletePostTypeUseCase } from "./delete-post-type-by-slug.use-case";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { FindPostTypeUseCase } from "./find-post-type.use-case";
import { PostType } from "@/domain";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import { Schema } from "@caffeine/schema";
import { t } from "@caffeine/models";
import type { IPostType, IPostTypeReader } from "@/domain/types";
import { FindEntityByTypeUseCase } from "@caffeine/application/use-cases";
import type { UnpackedPostTypeSchema } from "@/domain/schemas";

describe("DeletePostTypeUseCase", () => {
	let repository: PostTypeRepository;
	let findPostType: FindEntityByTypeUseCase<
		UnpackedPostTypeSchema,
		IPostType,
		IPostTypeReader
	>;
	let findPostTypeUseCase: FindPostTypeUseCase;
	let sut: DeletePostTypeUseCase;

	const validSchemaString = Schema.make(
		t.Object({ content: t.String() }),
	).toString();

	beforeEach(() => {
		repository = new PostTypeRepository();
		findPostType = new FindEntityByTypeUseCase(repository);
		findPostTypeUseCase = new FindPostTypeUseCase(findPostType);

		sut = new DeletePostTypeUseCase(repository, findPostTypeUseCase);
	});

	it("should delete a post type", async () => {
		const postType = PostType.make({ name: "Test", schema: validSchemaString });
		await repository.create(postType);

		await sut.run(postType.slug);

		expect(repository.items).toHaveLength(0);
	});

	it("should throw ResourceNotFoundException if post type not found", async () => {
		await expect(sut.run("non-existent")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
