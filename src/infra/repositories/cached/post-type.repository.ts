import type { PostType } from "@/domain/post-type";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";
import { redis } from "@caffeine/redis-drive";

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

		if (!targetPostType) return null;

		await redis.set(
			`post@post-type::$${id}`,
			JSON.stringify(targetPostType),
			"EX",
			this.postTypeCacheExpirationTime,
		);
		await redis.set(
			`post@post-type::${targetPostType?.slug}`,
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

		if (!targetPostType) return null;

		await redis.set(
			`post@post-type::${slug}`,
			JSON.stringify(targetPostType),
			"EX",
			this.postTypeCacheExpirationTime,
		);
		await redis.set(
			`post@post-type::$${targetPostType?.id}`,
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

	async update(postType: PostType): Promise<void> {
		const _cachedPostType = await redis.get(`post@post-type::$${postType.id}`);

		if (_cachedPostType) {
			const cachedPostType: IUnmountedPostType = JSON.parse(_cachedPostType);

			await redis.del(`post@post-type::$${cachedPostType.id}`);
			await redis.del(`post@post-type::${cachedPostType.slug}`);
		}

		await this.repository.update(postType);

		await redis.set(
			`post@post-type::${postType.slug}`,
			JSON.stringify(postType.unpack()),
			"EX",
			this.postTypeCacheExpirationTime,
		);

		await redis.set(
			`post@post-type::$${postType.id}`,
			JSON.stringify(postType.unpack()),
			"EX",
			this.postTypeCacheExpirationTime,
		);
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

	async delete(postType: PostType): Promise<void> {
		await redis.del(`post@post-type::$${postType.id}`);
		await redis.del(`post@post-type::${postType.slug}`);

		await this.repository.delete(postType);
	}

	length(): Promise<number> {
		return this.repository.length();
	}
}
