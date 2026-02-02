import { describe, it, expect, beforeEach } from "vitest";
import { PostTypeRepository } from "./post-type-repository";
import { PostType } from "@/domain/post-type";
import { generateUUID, slugify } from "@caffeine/models/helpers";
import { Schema, t } from "@caffeine/models";

describe("PostTypeRepository", () => {
	let sut: PostTypeRepository;

	beforeEach(() => {
		sut = new PostTypeRepository();
	});

	const createPostType = (name = "Test", isHighlighted = false) => {
		return PostType.make(
			{
				name,
				slug: slugify(name),
				isHighlighted,
			},
			Schema.make(t.Object({ type: t.String() })),
			{
				id: generateUUID(),
				createdAt: new Date().toISOString(),
			},
		);
	};

	it("should be able to create a post type", async () => {
		const postType = createPostType();
		await sut.create(postType);
		expect(sut.items).toHaveLength(1);
		expect(sut.items[0]).toEqual(postType);
	});

	it("should be able to find by id", async () => {
		const postType = createPostType();
		await sut.create(postType);
		const found = await sut.findById(postType.id);
		expect(found).toBeTruthy();
		expect(found?.id).toBe(postType.id);
		expect(found?.schema).toEqual(postType.schema.toString());
	});

	it("should return null if id not found", async () => {
		const found = await sut.findById("non-existent");
		expect(found).toBeNull();
	});

	it("should be able to find many by id", async () => {
		const pt1 = createPostType("1");
		const pt2 = createPostType("2");
		await sut.create(pt1);
		await sut.create(pt2);

		const found = await sut.findManyById(pt1.id, pt2.id);
		expect(found).toHaveLength(2);
	});

	it("should be able to find by slugify", async () => {
		const postType = createPostType("Unique Name");
		await sut.create(postType);
		const found = await sut.findBySlug(slugify("Unique Name"));
		expect(found).toBeTruthy();
		expect(found?.id).toBe(postType.id);
	});

	it("should return null if slugify not found", async () => {
		const found = await sut.findBySlug(slugify("Non Existent"));
		expect(found).toBeNull();
	});

	it("should be able to find many with pagination", async () => {
		for (let i = 1; i <= 22; i++) {
			await sut.create(createPostType(`t ${i}`));
		}

		// Page 1, Offset 10 -> items 0-9
		const page1 = await sut.findMany(1);
		expect(page1).toHaveLength(10);
		expect(page1[0]?.name).toBe("t 1");

		// Page 3, Offset 10 -> items 20-21 (2 items)
		const page3 = await sut.findMany(3);
		expect(page3).toHaveLength(2);
		expect(page3[0]?.name).toBe("t 21");
	});

	it("should be able to update a post type", async () => {
		const postType = createPostType("Original");
		await sut.create(postType);

		// Mutate safely? PostType logic might require immutability or specific methods,
		// but since we passed entityProps, we can try to recreate or just modify prop if accessible.
		// PostType has public `name`.
		postType.name = "Updated";

		await sut.update(postType);

		const found = await sut.findById(postType.id);
		expect(found?.name).toBe("Updated");
	});

	it("should gracefully handle updating non-existent post type", async () => {
		const postType = createPostType();
		await sut.update(postType);
		const found = await sut.findById(postType.id);
		expect(found).toBeNull();
	});

	it("should be able to get highlights", async () => {
		const h1 = createPostType("H1", true);
		const n1 = createPostType("N1", false);
		const h2 = createPostType("H2", true);

		await sut.create(h1);
		await sut.create(n1);
		await sut.create(h2);

		const highlights = await sut.getHighlights();
		expect(highlights).toHaveLength(2);
		expect(highlights.map((h) => h.id)).toContain(h1.id);
		expect(highlights.map((h) => h.id)).toContain(h2.id);
		expect(highlights.map((h) => h.id)).not.toContain(n1.id);
	});

	it("should be able to get length", async () => {
		await sut.create(createPostType("1"));
		await sut.create(createPostType("2"));

		const length = await sut.length();
		expect(length).toBe(2);
	});

	it("should be able to delete a post type", async () => {
		const postType = createPostType();
		await sut.create(postType);
		await sut.delete(postType);
		const found = await sut.findById(postType.id);
		expect(found).toBeNull();
		expect(sut.items).toHaveLength(0);
	});

	it("should gracefully handle deleting non-existent post type", async () => {
		const postType = createPostType();
		// Not added to repo
		await sut.delete(postType);
		expect(sut.items).toHaveLength(0);
	});
});
