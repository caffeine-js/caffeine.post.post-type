import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import { UpdatePostTypeUseCase } from "./update-post-type.use-case";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { FindPostTypeUseCase } from "./find-post-type.use-case";
import { PostType } from "@/domain";
import {
	InvalidOperationException,
	ResourceAlreadyExistsException,
} from "@caffeine/errors/application";
import { Schema } from "@caffeine/schema";
import { t } from "@caffeine/models";
import { SlugUniquenessCheckerService } from "@caffeine/domain/services";
import type { IPostTypeUniquenessCheckerService } from "@/domain/types/services";
import { FindEntityByTypeUseCase } from "@caffeine/application/use-cases";
import type { UnpackedPostTypeDTO } from "@/domain/dtos";
import type { IPostType, IPostTypeReader } from "@/domain/types";

describe("UpdatePostTypeUseCase", () => {
	let repository: PostTypeRepository;
	let uniquenessChecker: IPostTypeUniquenessCheckerService;
	let findEntityByType: FindEntityByTypeUseCase<
		typeof UnpackedPostTypeDTO,
		IPostType,
		IPostTypeReader
	>;
	let findPostTypeUseCase: FindPostTypeUseCase;
	let sut: UpdatePostTypeUseCase;

	const validSchemaString = Schema.make(
		t.Object({ content: t.String() }),
	).toString();

	beforeEach(() => {
		repository = new PostTypeRepository();
		uniquenessChecker = new SlugUniquenessCheckerService(repository);
		findEntityByType = new FindEntityByTypeUseCase(repository);
		findPostTypeUseCase = new FindPostTypeUseCase(findEntityByType);

		sut = new UpdatePostTypeUseCase(
			repository,
			findPostTypeUseCase,
			uniquenessChecker,
		);
	});

	const makePostType = (name: string = "Original Name") => {
		return PostType.make({
			name,
			schema: validSchemaString,
		});
	};

	it("should update name and highlight status", async () => {
		const postType = makePostType();
		await repository.create(postType);

		const result = await sut.run(postType.slug, {
			name: "New Name",
			isHighlighted: true,
		});

		expect(result.name).toBe("New Name");
		expect(result.isHighlighted).toBe(true);
		expect(repository.items).toContain(result);
	});

	it("should update slug when updateSlug is true", async () => {
		const postType = makePostType("Old Name");
		await repository.create(postType);
		const oldSlug = postType.slug;

		await sut.run(postType.slug, { name: "New Name" }, true);

		expect(postType.slug).not.toBe(oldSlug);
		expect(repository.items[0]?.slug).toBe(postType.slug);
	});

	it("should update with explicit slug", async () => {
		const postType = makePostType();
		await repository.create(postType);

		await sut.run(postType.slug, { slug: "new-custom-slug" });

		expect(postType.slug).toBe("new-custom-slug");
		expect(repository.items[0]?.slug).toBe("new-custom-slug");
	});

	it("should throw InvalidOperationException if no data provided", async () => {
		await expect(sut.run("any-slug", {})).rejects.toThrow(
			InvalidOperationException,
		);
	});

	it("should throw InvalidOperationException if name, updateSlug and slug are all provided", async () => {
		await expect(
			sut.run("any-slug", { name: "New Name", slug: "new-slug" }, true),
		).rejects.toThrow(InvalidOperationException);
	});

	it("should throw ResourceAlreadyExistsException if new slug is not unique", async () => {
		const firstPostType = makePostType();
		firstPostType.reslug("testing");
		await repository.create(firstPostType);

		const secondPostType = makePostType();
		await repository.create(secondPostType);

		await expect(
			sut.run(secondPostType.id, { slug: "testing" }),
		).rejects.toThrow(ResourceAlreadyExistsException);
	});

	it("should return early if new slug is same as current slug", async () => {
		const postType = makePostType();
		await repository.create(postType);
		const uniquenessSpy = spyOn(uniquenessChecker, "run");

		await sut.run(postType.slug, { slug: postType.slug });

		expect(uniquenessSpy).not.toHaveBeenCalled();
	});
});
