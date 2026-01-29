import type { PostType } from "@/domain/post-type";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";
import { redis } from "bun";

export class PostTypeRepository implements IPostTypeRepository {
	private postTypeCacheExpirationTime: number = 60 * 60;

	constructor(private readonly repository: IPostTypeRepository) {}

	create(postType: PostType): Promise<void> {
		return this.repository.create(postType);
	}

	async findById(id: string): Promise<IUnmountedPostType | null> {
		const storedPostType = await redis.get(`post@post-type::$${id}`);

		if (storedPostType)
			return storedPostType === null ? null : JSON.parse(storedPostType);

		const targetPostType = await this.repository.findById(id);

		await redis.set(
			`post@post-type::$${id}`,
			JSON.stringify(targetPostType),
			"EX",
			this.postTypeCacheExpirationTime,
		);

		return targetPostType;
	}

	async findBySlug(slug: string): Promise<IUnmountedPostType | null> {
		const storedPostType = await redis.get(`post@post-type::${slug}`);

		if (storedPostType)
			return storedPostType === null ? null : JSON.parse(storedPostType);

		const targetPostType = await this.repository.findBySlug(slug);

		await redis.set(
			`post@post-type::${slug}`,
			JSON.stringify(targetPostType),
			"EX",
			this.postTypeCacheExpirationTime,
		);

		return targetPostType;
	}

	async findMany(page: number): Promise<IUnmountedPostType[]> {
		const storedPostType = await redis.get(`post@post-type:page::${page}`);

		if (storedPostType) return JSON.parse(storedPostType);

		const targetPostType = await this.repository.findMany(page);

		await redis.set(
			`post@post-type:page::${page}`,
			JSON.stringify(targetPostType),
			"EX",
			this.postTypeCacheExpirationTime,
		);

		return targetPostType;
	}

	update(postType: PostType): Promise<void> {
		return this.update(postType);
	}

	async getHighlights(): Promise<IUnmountedPostType[]> {
		const storedPostTypeHighlights = await redis.get(
			`post@post-type:highlights`,
		);

		if (storedPostTypeHighlights) return JSON.parse(storedPostTypeHighlights);

		const postTypeHighlights = await this.repository.getHighlights();

		await redis.set(
			`post@post-type:highlights`,
			JSON.stringify(postTypeHighlights),
			"EX",
			this.postTypeCacheExpirationTime,
		);

		return postTypeHighlights;
	}

	delete(postType: PostType): Promise<void> {
		return this.repository.delete(postType);
	}

	async length(): Promise<number> {
		const storedPostTypeAmount = await redis.get(`post@post-type:count`);

		if (storedPostTypeAmount) return parseInt(storedPostTypeAmount);

		const postTypeAmount = await this.repository.length();

		await redis.set(
			`post@post-type:count`,
			`${postTypeAmount}`,
			"EX",
			this.postTypeCacheExpirationTime,
		);

		return postTypeAmount;
	}
}
