import { PostType } from "@/domain";
import type { IPostType, IUnpackedPostType } from "@/domain/types";
import { Mapper } from "@caffeine/entity";
import { InvalidPropertyException } from "@caffeine/errors/domain";
import { UnexpectedCacheValueException } from "@caffeine/errors/infra";

export const CachedPostTypeMapper = {
	run(key: string, _data: string | IUnpackedPostType): IPostType {
		const data: IUnpackedPostType =
			typeof _data === "string" ? JSON.parse(_data) : _data;

		try {
			return Mapper.toDomain(data, PostType.make) as IPostType;
		} catch (err: unknown) {
			if (err instanceof InvalidPropertyException)
				throw new UnexpectedCacheValueException(
					key,
					`${err.source}::${err.property}`,
					err.message,
				);

			throw err;
		}
	},
} as const;
