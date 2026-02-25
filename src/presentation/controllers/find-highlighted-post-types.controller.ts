import { PostType } from "@/domain";
import { UnpackedPostTypeDTO } from "@/domain/dtos";
import {
	makeCountPostTypesUseCase,
	makeFindHighlightedPostTypesUseCase,
} from "@/infra/factories/application/use-cases";
import { EntitySource } from "@caffeine/entity/symbols";
import { PaginationDTO } from "@caffeine/models/dtos/api";
import Elysia from "elysia";
import { FindManyPostTypesResponseDTO } from "../dtos/find-many-post-types-response.dto";

const FIND_HIGHLIGHTED_POST_TYPES =
	`${PostType[EntitySource]}:find-highlighted-post-types` as const;
const COUNT_HIGHLIGHETD_POST_TYPES =
	`${PostType[EntitySource]}:count-highlighted-post-types` as const;

export const FindHighlightedPostTypeController = new Elysia()
	.decorate(FIND_HIGHLIGHTED_POST_TYPES, makeFindHighlightedPostTypesUseCase())
	.decorate(COUNT_HIGHLIGHETD_POST_TYPES, makeCountPostTypesUseCase())
	.get(
		"/highlights",
		async ({
			query,
			[FIND_HIGHLIGHTED_POST_TYPES]: findManyPostTypes,
			[COUNT_HIGHLIGHETD_POST_TYPES]: countPostTypes,
			set,
			status,
		}) => {
			const { count, totalPages } = await countPostTypes!.run("HIGHLIGHTS");

			set.headers["X-Total-Count"] = String(count);
			set.headers["X-Total-Pages"] = String(totalPages);

			return status(200, findManyPostTypes!.run(query.page) as never);
		},
		{
			query: PaginationDTO,
			detail: {
				summary: "List Post Types by Highlight",
				description: "Retrieves a paginated list of post types.",
			},
			response: { 200: FindManyPostTypesResponseDTO },
		},
	);
