import { describe, it, expect, beforeEach } from "vitest";
import { FindManyPostTypesUseCase } from "./find-many-post-types.use-case";
import { PostTypeRepository } from "@/infra/repositories/test/post-type-repository";
import { PostType } from "@/domain/post-type";
import { PostTypeSchemaFactory } from "@/domain/factories/post-type-schema.factory";
import { t } from "@caffeine/models";

describe("FindManyPostTypesUseCase", () => {
	let useCase: FindManyPostTypesUseCase;
	let repository: PostTypeRepository;

	beforeEach(() => {
		repository = new PostTypeRepository();
		useCase = new FindManyPostTypesUseCase(repository);
	});

	it("should return a list of post types for a given page", async () => {
		const schemaStr = JSON.stringify(t.Object({}));
		const schema = PostTypeSchemaFactory.make(schemaStr);

		// Repository paginates with size 10. Let's create 15 items.
		for (let i = 1; i <= 15; i++) {
			const pt = PostType.make(
				{ name: `PT ${i}`, slug: `pt-${i}`, isHighlighted: false },
				schema,
			);
			await repository.create(pt);
		}

		// Page 1 should have 10 items
		const page1 = await useCase.run(1);
		expect(page1).toHaveLength(10);
		expect(page1[0]?.slug).toBe("pt-1");

		// Page 2 should have 5 items
		const page2 = await useCase.run(2);
		expect(page2).toHaveLength(5);
		expect(page2[0]?.slug).toBe("pt-11");
	});
});
