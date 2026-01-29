import { describe, it, expect, beforeEach } from "vitest";
import { GetPostTypeNumberOfPagesUseCase } from "./get-post-type-number-of-pages.use-case";
import { InMemoryPostTypeRepository } from "../../../test/infra/repositories/in-memory-post-type-repository";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";
import { PostType } from "@/domain/post-type";
import { PostTypeSchemaFactory } from "@/domain/factories/post-type-schema.factory";
import { t } from "@caffeine/models";

describe("GetPostTypeNumberOfPagesUseCase", () => {
	let useCase: GetPostTypeNumberOfPagesUseCase;
	let repository: InMemoryPostTypeRepository;

	beforeEach(() => {
		repository = new InMemoryPostTypeRepository();
		useCase = new GetPostTypeNumberOfPagesUseCase(repository);
	});

	it("should return the correct number of pages", async () => {
		const schemaStr = JSON.stringify(t.Object({}));
		const schema = PostTypeSchemaFactory.make(schemaStr);

		// Create 25 items. If MAX_ITEMS_PER_QUERY is 10 (default assumption or based on constant), result should be 3.
		// We trust the imported constant.
		const totalItems = 25;

		for (let i = 0; i < totalItems; i++) {
			await repository.create(
				PostType.make(
					{ name: `PT ${i}`, slug: `pt-${i}`, isHighlighted: false },
					schema,
				),
			);
		}

		const expectedPages = Math.ceil(totalItems / MAX_ITEMS_PER_QUERY);
		const result = await useCase.run();

		expect(result).toBe(expectedPages);
	});
});
