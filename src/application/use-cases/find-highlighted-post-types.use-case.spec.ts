import { describe, it, expect, beforeEach } from "vitest";
import { FindHighlightedPostTypesUseCase } from "./find-highlighted-post-types.use-case";
import { PostTypeRepository } from "@/infra/repositories/test/post-type-repository";
import { PostType } from "@/domain/post-type";
import { PostTypeSchemaFactory } from "@/domain/factories/post-type-schema.factory";
import { t } from "@caffeine/models";

describe("FindHighlightedPostTypesUseCase", () => {
	let useCase: FindHighlightedPostTypesUseCase;
	let repository: PostTypeRepository;

	beforeEach(() => {
		repository = new PostTypeRepository();
		useCase = new FindHighlightedPostTypesUseCase(repository);
	});

	it("should return only highlighted post types", async () => {
		const schemaStr = JSON.stringify(t.Object({ content: t.String() }));
		const schema = PostTypeSchemaFactory.make(schemaStr);

		const highlighted = PostType.make(
			{ name: "Highlight", slug: "highlight", isHighlighted: true },
			schema,
		);
		const notHighlighted = PostType.make(
			{ name: "Not Highlight", slug: "not-highlight", isHighlighted: false },
			schema,
		);

		await repository.create(highlighted);
		await repository.create(notHighlighted);

		const result = await useCase.run();

		expect(result).toHaveLength(1);
		expect(result[0]?.slug).toBe("highlight");
	});
});
