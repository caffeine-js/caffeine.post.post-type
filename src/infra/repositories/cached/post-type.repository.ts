import type { IPostType } from "@/domain/types/post-type.interface";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { CaffeineCacheInstance } from "@caffeine/cache";
import { CachedPostTypeMapper } from "./cached-post-type-mapper";
import { CACHE_EXPIRATION_TIME } from "@caffeine/constants";
import { Mapper } from "@caffeine/entity";
import { PostType } from "@/domain";
import { EntitySource } from "@caffeine/entity/symbols";
import { SafeCache } from "@caffeine/cache/decorators";

export class PostTypeRepository implements IPostTypeRepository {
    private readonly cacheExpirationTime: number = CACHE_EXPIRATION_TIME.SAFE;

    constructor(
        private readonly repository: IPostTypeRepository,
        private readonly cache: CaffeineCacheInstance,
    ) {}

    async create(postType: IPostType): Promise<void> {
        await this.repository.create(postType);
        await Promise.all([
            this.cachePostType(postType),
            this.invalidateListCache(),
        ]);
    }

    @SafeCache(PostType[EntitySource])
    async delete(postType: IPostType): Promise<void> {
        await this.repository.delete(postType);

        await Promise.all([
            this.cache.del(`${PostType[EntitySource]}::$${postType.id}`),
            this.cache.del(`${PostType[EntitySource]}::${postType.slug}`),
            this.invalidateListCache(),
        ]);
    }

    @SafeCache(PostType[EntitySource])
    async findById(id: string): Promise<IPostType | null> {
        const storedPostType = await this.cache.get(
            `${PostType[EntitySource]}::$${id}`,
        );

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

    @SafeCache(PostType[EntitySource])
    async findBySlug(slug: string): Promise<IPostType | null> {
        const storedId = await this.cache.get(
            `${PostType[EntitySource]}::${slug}`,
        );

        if (storedId) {
            const postType = await this.findById(storedId);

            if (postType && postType.slug === slug) return postType;

            await this.cache.del(`${PostType[EntitySource]}::${slug}`);
        }

        const targetPostType = await this.repository.findBySlug(slug);

        if (!targetPostType) return null;

        await this.cachePostType(targetPostType);

        return targetPostType;
    }

    @SafeCache(PostType[EntitySource])
    async findMany(page: number): Promise<IPostType[]> {
        const key = `${PostType[EntitySource]}:page::${page}`;
        const storedIds = await this.cache.get(key);

        if (storedIds) {
            try {
                const ids: string[] = JSON.parse(storedIds);
                return await this.findManyByIds(ids);
            } catch {
                await this.cache.del(key);
            }
        }

        const targetPostTypes = await this.repository.findMany(page);

        await Promise.all([
            ...targetPostTypes.map((postType) => this.cachePostType(postType)),
            this.cache.set(
                key,
                JSON.stringify(targetPostTypes.map((postType) => postType.id)),
                "EX",
                this.cacheExpirationTime,
            ),
        ]);

        return targetPostTypes;
    }

    @SafeCache(PostType[EntitySource])
    async findHighlights(page: number): Promise<IPostType[]> {
        const key = `${PostType[EntitySource]}:highlights:page::${page}`;
        const storedIds = await this.cache.get(key);

        if (storedIds) {
            try {
                const ids: string[] = JSON.parse(storedIds);
                return await this.findManyByIds(ids);
            } catch {
                await this.cache.del(key);
            }
        }

        const targetPostTypes = await this.repository.findHighlights(page);

        await Promise.all([
            ...targetPostTypes.map((postType) => this.cachePostType(postType)),
            this.cache.set(
                key,
                JSON.stringify(targetPostTypes.map((postType) => postType.id)),
                "EX",
                this.cacheExpirationTime,
            ),
        ]);

        return targetPostTypes;
    }

    @SafeCache(PostType[EntitySource])
    async findManyByIds(ids: string[]): Promise<IPostType[]> {
        if (ids.length === 0) return [];

        const keys = ids.map((id) => `${PostType[EntitySource]}::$${id}`);
        const cachedValues = await this.cache.mget(...keys);

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
            const fetchedPostTypes =
                await this.repository.findManyByIds(missedIds);

            await Promise.all(
                fetchedPostTypes.filter(Boolean).map(async (pt) => {
                    await this.cachePostType(pt);
                    postTypesMap.set(pt.id, pt);
                }),
            );
        }

        return ids
            .map((id) => postTypesMap.get(id))
            .filter(
                (postType): postType is IPostType => postType !== undefined,
            );
    }

    @SafeCache(PostType[EntitySource])
    async update(postType: IPostType): Promise<void> {
        const _cachedPostType = await this.cache.get(
            `${PostType[EntitySource]}::$${postType.id}`,
        );

        if (_cachedPostType) {
            const cachedPostType: IPostType = CachedPostTypeMapper.run(
                `${PostType[EntitySource]}::$${postType.id}`,
                _cachedPostType,
            );

            await Promise.all([
                this.cache.del(
                    `${PostType[EntitySource]}::$${cachedPostType.id}`,
                ),
                this.cache.del(
                    `${PostType[EntitySource]}::${cachedPostType.slug}`,
                ),
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

    @SafeCache(PostType[EntitySource])
    private async cachePostType(postType: IPostType): Promise<void> {
        const unpacked = Mapper.toDTO(postType);

        await Promise.all([
            this.cache.set(
                `${PostType[EntitySource]}::$${postType.id}`,
                JSON.stringify(unpacked),
                "EX",
                this.cacheExpirationTime,
            ),
            this.cache.set(
                `${PostType[EntitySource]}::${postType.slug}`,
                postType.id,
                "EX",
                this.cacheExpirationTime,
            ),
        ]);
    }

    @SafeCache(PostType[EntitySource])
    private async invalidateListCache(): Promise<void> {
        const patterns = [
            `${PostType[EntitySource]}:page:*`,
            `${PostType[EntitySource]}:highlights:page:*`,
        ];

        for (const pattern of patterns) {
            let cursor = "0";
            do {
                const [newCursor, keys] = await this.cache.scan(
                    cursor,
                    "MATCH",
                    pattern,
                    "COUNT",
                    100,
                );

                cursor = newCursor;

                if (keys.length > 0) {
                    await this.cache.del(...keys);
                }
            } while (cursor !== "0");
        }
    }
}
