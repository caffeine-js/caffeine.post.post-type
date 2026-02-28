import { beforeEach, describe, expect, it } from "bun:test";
import { CountPostTypesUseCase } from "./count-post-types.use-case";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { PostType } from "@/domain";
import { Schema } from "@caffeine/schema";
import { t } from "@caffeine/models";

describe("CountPostTypesUseCase", () => {
	let repository: PostTypeRepository;
	let sut: CountPostTypesUseCase;

	const validSchemaString = Schema.make(
		t.Object({ content: t.String() }),
	).toString();

	beforeEach(() => {
		repository = new PostTypeRepository();
		sut = new CountPostTypesUseCase(repository);
	});

	it("should count default post types", async () => {
		await repository.create(
			PostType.make({ name: "1", schema: validSchemaString }),
		);
		await repository.create(
			PostType.make({ name: "2", schema: validSchemaString }),
		);

		const result = await sut.run("DEFAULT");

		expect(result.count).toBe(2);
		expect(result.totalPages).toBe(1);
	});

	it("should count highlighted post types", async () => {
		await repository.create(
			PostType.make({
				name: "1",
				schema: validSchemaString,
				isHighlighted: true,
			}),
		);
		await repository.create(
			PostType.make({
				name: "2",
				schema: validSchemaString,
				isHighlighted: false,
			}),
		);

		const result = await sut.run("HIGHLIGHTS");

		expect(result.count).toBe(1);
		expect(result.totalPages).toBe(1);
	});
});
