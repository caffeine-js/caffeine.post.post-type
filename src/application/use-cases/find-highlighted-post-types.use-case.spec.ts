import { beforeEach, describe, expect, it } from "bun:test";
import { CountPostTypesUseCase } from "./count-post-types.use-case";
import { FindHighlightedPostTypesUseCase } from "./find-highlighted-post-types.use-case";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { PostType } from "@/domain";
import { Schema } from "@caffeine/schema";
import { t } from "@caffeine/models";

describe("FindHighlightedPostTypesUseCase", () => {
	let repository: PostTypeRepository;
	let countPostTypes: CountPostTypesUseCase;
	let sut: FindHighlightedPostTypesUseCase;

	const validSchemaString = Schema.make(
		t.Object({ content: t.String() }),
	).toString();

	beforeEach(() => {
		repository = new PostTypeRepository();
		countPostTypes = new CountPostTypesUseCase(repository);
		sut = new FindHighlightedPostTypesUseCase(repository, countPostTypes);
	});

	it("should find highlighted post types", async () => {
		const h1 = PostType.make({
			name: "H1",
			schema: validSchemaString,
			isHighlighted: true,
		});
		const h2 = PostType.make({
			name: "H2",
			schema: validSchemaString,
			isHighlighted: false,
		});
		await repository.create(h1);
		await repository.create(h2);

		const result = await sut.run(1);

		expect(result.value).toHaveLength(1);
		expect(result.value[0]).toBe(h1);
		expect(result.count).toBe(1);
		expect(result.totalPages).toBe(1);
	});

	it("should return empty results when no highlighted post types exist", async () => {
		await repository.create(
			PostType.make({
				name: "Not Highlighted",
				schema: validSchemaString,
				isHighlighted: false,
			}),
		);

		const result = await sut.run(1);

		expect(result.value).toHaveLength(0);
		expect(result.count).toBe(0);
		expect(result.totalPages).toBe(0);
	});
});
