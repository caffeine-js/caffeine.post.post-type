import { beforeEach, describe, expect, it } from "vitest";
import { PostTypeRepository } from "./post-type-repository";
import { PostType } from "@/domain/post-type";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";
import { Schema } from "@caffeine/schema";
import { t } from "@caffeine/models";

describe("PostTypeRepository", () => {
	let repository: PostTypeRepository;
	const validSchemaString = Schema.make(
		t.Object({ content: t.String() }),
	).toString();

	beforeEach(() => {
		repository = new PostTypeRepository();
	});

	const makePostType = (
		overrides: Partial<Parameters<typeof PostType.make>[0]> = {},
	) => {
		return PostType.make({
			name: "Test Post Type",
			schema: validSchemaString,
			isHighlighted: false,
			...overrides,
		});
	};

	it("should create a post type", async () => {
		const postType = makePostType();
		await repository.create(postType);

		expect(repository.items).toHaveLength(1);
		expect(repository.items[0]).toBe(postType);
	});

	it("should update an existing post type", async () => {
		const postType = makePostType({ name: "Old Name" });
		await repository.create(postType);

		postType.rename("New Name");
		await repository.update(postType);

		expect(repository.items[0]?.name).toBe("New Name");
	});

	it("should not update if post type does not exist", async () => {
		const postType = makePostType();
		// Not creating it in repository

		await repository.update(postType);
		expect(repository.items).toHaveLength(0);
	});

	it("should delete a post type", async () => {
		const postType = makePostType();
		await repository.create(postType);
		expect(repository.items).toHaveLength(1);

		await repository.delete(postType);
		expect(repository.items).toHaveLength(0);
	});

	it("should not delete if post type does not exist", async () => {
		const postType = makePostType();
		// Not creating it in repository

		await repository.delete(postType);
		expect(repository.items).toHaveLength(0);
	});

	it("should find a post type by id", async () => {
		const postType = makePostType();
		await repository.create(postType);

		const found = await repository.findById(postType.id);
		expect(found).toBe(postType);
	});

	it("should return null if post type is not found by id", async () => {
		const found = await repository.findById("non-existent-id");
		expect(found).toBeNull();
	});

	it("should find a post type by slug", async () => {
		const postType = makePostType({ slug: "custom-slug" });
		await repository.create(postType);

		const found = await repository.findBySlug("custom-slug");
		expect(found).toBe(postType);
	});

	it("should return null if post type is not found by slug", async () => {
		const found = await repository.findBySlug("non-existent-slug");
		expect(found).toBeNull();
	});

	it("should find many post types with pagination", async () => {
		const total = MAX_ITEMS_PER_QUERY + 5;
		for (let i = 0; i < total; i++) {
			await repository.create(makePostType({ name: `Name ${i}` }));
		}

		const firstPage = await repository.findMany(1);
		expect(firstPage).toHaveLength(MAX_ITEMS_PER_QUERY);

		const secondPage = await repository.findMany(2);
		expect(secondPage).toHaveLength(5);
	});

	it("should find many post types by ids", async () => {
		const p1 = makePostType();
		const p2 = makePostType();
		const p3 = makePostType();

		await repository.create(p1);
		await repository.create(p2);
		await repository.create(p3);

		const found = await repository.findManyByIds([p1.id, p3.id]);
		expect(found).toHaveLength(2);
		expect(found).toContain(p1);
		expect(found).toContain(p3);
	});

	it("should find highlighted post types with pagination", async () => {
		const totalHighlights = MAX_ITEMS_PER_QUERY + 2;

		for (let i = 0; i < totalHighlights; i++) {
			await repository.create(
				makePostType({ name: `H ${i}`, isHighlighted: true }),
			);
		}

		await repository.create(
			makePostType({ name: "Not Highlighted", isHighlighted: false }),
		);

		const firstPage = await repository.findHighlights(1);
		expect(firstPage).toHaveLength(MAX_ITEMS_PER_QUERY);
		expect(firstPage.every((p) => p.isHighlighted)).toBe(true);

		const secondPage = await repository.findHighlights(2);
		expect(secondPage).toHaveLength(2);
	});

	it("should count all post types", async () => {
		await repository.create(makePostType());
		await repository.create(makePostType());

		const count = await repository.count();
		expect(count).toBe(2);
	});

	it("should count highlighted post types", async () => {
		await repository.create(makePostType({ isHighlighted: true }));
		await repository.create(makePostType({ isHighlighted: true }));
		await repository.create(makePostType({ isHighlighted: false }));

		const count = await repository.countHighlights();
		expect(count).toBe(2);
	});
});
