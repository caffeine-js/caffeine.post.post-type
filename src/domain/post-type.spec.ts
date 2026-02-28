import { describe, expect, it } from "bun:test";
import { PostType } from "./post-type";
import { makeEntity } from "@caffeine/entity/factories";
import { t } from "@caffeine/models";
import { Schema } from "@caffeine/schema";

describe("PostType Entity", () => {
	const validSchemaString = Schema.make(
		t.Object({ content: t.String({ minLength: 1 }) }),
	).toString();

	describe("make()", () => {
		it("should create a valid instance with all attributes", () => {
			const postType = PostType.make({
				name: "Article",
				schema: validSchemaString,
				isHighlighted: true,
			});

			expect(postType).toBeInstanceOf(PostType);
			expect(postType.name).toBe("Article");
			expect(postType.slug).toBe("article");
			expect(postType.schema).toBeInstanceOf(Schema);
			expect(postType.schema.toString()).toBe(validSchemaString);
			expect(postType.isHighlighted).toBe(true);
		});

		it("should fall back to name for slug if slug is not provided", () => {
			const postType = PostType.make({
				name: "news-update",
				schema: validSchemaString,
				isHighlighted: false,
			});

			expect(postType.slug).toBe("news-update");
		});

		it("should accept custom entity properties", () => {
			const entityProps = makeEntity();

			const postType = PostType.make(
				{
					name: "page",
					schema: validSchemaString,
				},
				entityProps,
			);

			expect(postType.id).toBe(entityProps.id);
			expect(postType.isHighlighted).toBe(false);
		});
	});

	describe("mutations", () => {
		it("should rename the post type", () => {
			const postType = PostType.make({
				name: "old-name",
				slug: "slug",
				schema: validSchemaString,
				isHighlighted: false,
			});

			postType.rename("new-name");
			expect(postType.name).toBe("new-name");
		});

		it("should update the slug", () => {
			const postType = PostType.make({
				name: "name",
				slug: "old-slug",
				schema: validSchemaString,
				isHighlighted: false,
			});

			postType.reslug("new-slug");
			expect(postType.slug).toBe("new-slug");
		});

		it("should update the highlight status", () => {
			const postType = PostType.make({
				name: "name",
				slug: "slug",
				schema: validSchemaString,
				isHighlighted: false,
			});

			expect(postType.isHighlighted).toBe(false);

			postType.setHighlightTo(true);
			expect(postType.isHighlighted).toBe(true);

			postType.setHighlightTo(false);
			expect(postType.isHighlighted).toBe(false);
		});
	});
});
