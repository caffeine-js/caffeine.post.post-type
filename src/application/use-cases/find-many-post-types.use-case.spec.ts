import { beforeEach, describe, expect, it } from "bun:test";
import { CountPostTypesUseCase } from "./count-post-types.use-case";
import { FindManyPostTypesUseCase } from "./find-many-post-types.use-case";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { PostType } from "@/domain";
import { Schema } from "@caffeine/schema";
import { t } from "@caffeine/models";

describe("FindManyPostTypesUseCase", () => {
	let repository: PostTypeRepository;
	let countPostTypes: CountPostTypesUseCase;
	let sut: FindManyPostTypesUseCase;

	const validSchemaString = Schema.make(
		t.Object({ content: t.String() }),
	).toString();

	beforeEach(() => {
		repository = new PostTypeRepository();
		countPostTypes = new CountPostTypesUseCase(repository);
		sut = new FindManyPostTypesUseCase(repository, countPostTypes);
	});

	it("should find many post types", async () => {
		const postType = PostType.make({ name: "Test", schema: validSchemaString });
		await repository.create(postType);

		const result = await sut.run(1);

		expect(result.value).toHaveLength(1);
		expect(result.value[0]).toBe(postType);
		expect(result.count).toBe(1);
		expect(result.totalPages).toBe(1);
	});

	it("should return empty results when no post types exist", async () => {
		const result = await sut.run(1);

		expect(result.value).toHaveLength(0);
		expect(result.count).toBe(0);
		expect(result.totalPages).toBe(0);
	});
});
