import { beforeEach, describe, expect, it, mock } from "bun:test";
import { FindPostTypeUseCase } from "./find-post-type.use-case";
import { PostType } from "@/domain";
import { EntitySource } from "@caffeine/entity/symbols";
import { Schema } from "@caffeine/schema";
import { t } from "@caffeine/models";
import type { FindEntityByTypeUseCase } from "@caffeine/application/use-cases";
import type { UnpackedPostTypeDTO } from "@/domain/dtos";
import type { IPostType, IPostTypeReader } from "@/domain/types";

describe("FindPostTypeUseCase", () => {
	let findEntityByTypeUseCaseMock: FindEntityByTypeUseCase<
		typeof UnpackedPostTypeDTO,
		IPostType,
		IPostTypeReader
	>;
	let mockRun: ReturnType<typeof mock>;
	let sut: FindPostTypeUseCase;

	const validSchemaString = Schema.make(
		t.Object({ content: t.String() }),
	).toString();

	beforeEach(() => {
		mockRun = mock();
		findEntityByTypeUseCaseMock = {
			run: mockRun,
		} as unknown as FindEntityByTypeUseCase<
			typeof UnpackedPostTypeDTO,
			IPostType,
			IPostTypeReader
		>;
		sut = new FindPostTypeUseCase(findEntityByTypeUseCaseMock);
	});

	it("should call findEntityByTypeUseCase with correct arguments", async () => {
		const postType = PostType.make({
			name: "Test",
			schema: validSchemaString,
		});
		mockRun.mockResolvedValue(postType);

		const result = await sut.run("any-value");

		expect(mockRun).toHaveBeenCalledWith(
			"any-value",
			PostType[EntitySource],
		);
		expect(result).toBe(postType);
	});
});
