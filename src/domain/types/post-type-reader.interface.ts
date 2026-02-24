import type {
	ICanReadId,
	ICanReadSlug,
} from "@caffeine/domain/types/repositories";
import type { IPostType } from "./post-type.interface";
import type { UnpackedPostTypeSchema } from "@/domain/schemas";

export interface IPostTypeReader
	extends ICanReadId<UnpackedPostTypeSchema, IPostType>,
		ICanReadSlug<UnpackedPostTypeSchema, IPostType> {
	findMany(page: number): Promise<IPostType[]>;
	findManyByIds(ids: string[]): Promise<IPostType[]>;
	findHighlights(): Promise<IPostType[]>;
	count(): Promise<number>;
}
