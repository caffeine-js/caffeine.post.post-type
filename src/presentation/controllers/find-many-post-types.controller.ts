import { PostType } from "@/domain";
import {
	makeCountPostTypesUseCase,
	makeFindManyPostTypesUseCase,
} from "@/infra/factories/application/use-cases";
import { EntitySource } from "@caffeine/entity/symbols";
import { PaginationDTO } from "@caffeine/models/dtos/api";
import Elysia from "elysia";
import { FindManyPostTypesResponseDTO } from "../dtos/find-many-post-types-response.dto";

const FIND_MANY_POST_TYPES =
	`${PostType[EntitySource]}:find-many-post-types` as const;
const COUNT_POST_TYPES = `${PostType[EntitySource]}:count-post-types` as const;

export const FindManyPostTypeController = new Elysia()
	.decorate(FIND_MANY_POST_TYPES, makeFindManyPostTypesUseCase())
	.decorate(COUNT_POST_TYPES, makeCountPostTypesUseCase())
	.get(
		"/",
		async ({
			query,
			[FIND_MANY_POST_TYPES]: findManyPostTypes,
			[COUNT_POST_TYPES]: countPostTypes,
			set,
			status,
		}) => {
			const { count, totalPages } = await countPostTypes!.run();

			set.headers["X-Total-Count"] = String(count);
			set.headers["X-Total-Pages"] = String(totalPages);

			return status(200, findManyPostTypes!.run(query.page) as never);
		},
		{
			query: PaginationDTO,
			detail: {
				summary: "List Post Types",
				description: "Retrieves a paginated list of post types.",
			},
			response: { 200: FindManyPostTypesResponseDTO },
		},
	);
