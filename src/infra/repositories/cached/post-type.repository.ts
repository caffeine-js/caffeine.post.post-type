import type { IPostType } from "@/domain/types/post-type.interface";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import { redis } from "@caffeine/redis-drive";
import { CachedPostTypeMapper } from "./cached-post-type-mapper";
import { CACHE_EXPIRATION_TIME } from "@caffeine/constants";
import { Mapper } from "@caffeine/entity";
import { PostType } from "@/domain";
import { EntitySource } from "@caffeine/entity/symbols";

export class PostTypeRepository implements IPostTypeRepository {
	private cacheExpirationTime: number = CACHE_EXPIRATION_TIME.SAFE;

	constructor(private readonly repository: IPostTypeRepository) {}

	async create(postType: IPostType): Promise<void> {
		await this.repository.create(postType);
		await Promise.all([
			this.cachePostType(postType),
			this.invalidateListCache(),
		]);
	}

	async delete(postType: IPostType): Promise<void> {
		await this.repository.delete(postType);

		await Promise.all([
			redis.del(`${PostType[EntitySource]}::$${postType.id}`),
			redis.del(`${PostType[EntitySource]}::${postType.slug}`),
			this.invalidateListCache(),
		]);
	}

	async findById(id: string): Promise<IPostType | null> {
		const storedPostType = await redis.get(`${PostType[EntitySource]}::$${id}`);

		if (storedPostType)
			return CachedPostTypeMapper.run(
				`${PostType[EntitySource]}::$${id}`,
				storedPostType,
			);

		const targetPostType = await this.repository.findById(id);

		if (!targetPostType) return null;

		await this.cachePostType(targetPostType);

		return targetPostType;
	}

	async findBySlug(slug: string): Promise<IPostType | null> {
		const storedId = await redis.get(`${PostType[EntitySource]}::${slug}`);

		if (storedId) {
			const postType = await this.findById(storedId);

			if (postType && postType.slug === slug) return postType;

			await redis.del(`${PostType[EntitySource]}::${slug}`);
		}

		const targetPostType = await this.repository.findBySlug(slug);

		if (!targetPostType) return null;

		await this.cachePostType(targetPostType);

		return targetPostType;
	}

	async findMany(page: number): Promise<IPostType[]> {
		const key = `${PostType[EntitySource]}:page::${page}`;
		const storedIds = await redis.get(key);

		if (storedIds) {
			try {
				const ids: string[] = JSON.parse(storedIds);
				return await this.findManyByIds(ids);
			} catch {
				await redis.del(key);
			}
		}

		const targetPostTypes = await this.repository.findMany(page);

		await Promise.all([
			...targetPostTypes.map((postType) => this.cachePostType(postType)),
			redis.set(
				key,
				JSON.stringify(targetPostTypes.map((postType) => postType.id)),
				"EX",
				this.cacheExpirationTime,
			),
		]);

		return targetPostTypes;
	}

	async findHighlights(page: number): Promise<IPostType[]> {
		const key = `${PostType[EntitySource]}:highlights:page::${page}`;
		const storedIds = await redis.get(key);

		if (storedIds) {
			try {
				const ids: string[] = JSON.parse(storedIds);
				return await this.findManyByIds(ids);
			} catch {
				await redis.del(key);
			}
		}

		const targetPostTypes = await this.repository.findHighlights(page);

		await Promise.all([
			...targetPostTypes.map((postType) => this.cachePostType(postType)),
			redis.set(
				key,
				JSON.stringify(targetPostTypes.map((postType) => postType.id)),
				"EX",
				this.cacheExpirationTime,
			),
		]);

		return targetPostTypes;
	}

	async findManyByIds(ids: string[]): Promise<IPostType[]> {
		if (ids.length === 0) return [];

		const keys = ids.map((id) => `${PostType[EntitySource]}::$${id}`);
		const cachedValues = await redis.mget(...keys);

		const postTypesMap = new Map<string, IPostType>();
		const missedIds: string[] = [];

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			if (!id) continue;

			const cached = cachedValues[i];

			if (cached) {
				try {
					const postType = CachedPostTypeMapper.run(
						`${PostType[EntitySource]}::$${id}`,
						cached,
					);
					postTypesMap.set(id, postType);
				} catch {
					missedIds.push(id);
				}
			} else {
				missedIds.push(id);
			}
		}

		if (missedIds.length > 0) {
			const fetchedPostTypes = await this.repository.findManyByIds(missedIds);

			await Promise.all(
				fetchedPostTypes.filter(Boolean).map(async (pt) => {
					await this.cachePostType(pt);
					postTypesMap.set(pt.id, pt);
				}),
			);
		}

		return ids
			.map((id) => postTypesMap.get(id))
			.filter((postType): postType is IPostType => postType !== undefined);
	}

	async update(postType: IPostType): Promise<void> {
		const _cachedPostType = await redis.get(
			`${PostType[EntitySource]}::$${postType.id}`,
		);

		if (_cachedPostType) {
			const cachedPostType: IPostType = CachedPostTypeMapper.run(
				`${PostType[EntitySource]}::$${postType.id}`,
				_cachedPostType,
			);

			await Promise.all([
				redis.del(`${PostType[EntitySource]}::$${cachedPostType.id}`),
				redis.del(`${PostType[EntitySource]}::${cachedPostType.slug}`),
			]);
		}

		await this.repository.update(postType);

		await Promise.all([
			this.cachePostType(postType),
			this.invalidateListCache(),
		]);
	}

	count(): Promise<number> {
		return this.repository.count();
	}

	countHighlights(): Promise<number> {
		return this.repository.countHighlights();
	}

	private async cachePostType(postType: IPostType): Promise<void> {
		const unpacked = Mapper.toDTO(postType);

		await Promise.all([
			redis.set(
				`${PostType[EntitySource]}::$${postType.id}`,
				JSON.stringify(unpacked),
				"EX",
				this.cacheExpirationTime,
			),
			redis.set(
				`${PostType[EntitySource]}::${postType.slug}`,
				postType.id,
				"EX",
				this.cacheExpirationTime,
			),
		]);
	}

	private async invalidateListCache(): Promise<void> {
		const patterns = [
			`${PostType[EntitySource]}:page:*`,
			`${PostType[EntitySource]}:highlights:page:*`,
		];

		for (const pattern of patterns) {
			let cursor = "0";
			do {
				const [newCursor, keys] = await redis.scan(
					cursor,
					"MATCH",
					pattern,
					"COUNT",
					100,
				);

				cursor = newCursor;

				if (keys.length > 0) {
					await redis.del(...keys);
				}
			} while (cursor !== "0");
		}
	}
}
