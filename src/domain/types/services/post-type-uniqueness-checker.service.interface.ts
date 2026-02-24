import type { SlugUniquenessCheckerService } from "@caffeine/domain/services";
import type { UnpackedPostTypeSchema } from "@/domain/schemas";
import type { IPostType } from "../post-type.interface";

export type IPostTypeUniquenessCheckerService = SlugUniquenessCheckerService<
	UnpackedPostTypeSchema,
	IPostType
>;
