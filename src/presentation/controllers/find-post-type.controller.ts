import { PostType } from "@/domain";
import { UnpackedPostTypeDTO } from "@/domain/dtos";
import { makeFindPostTypeUseCase } from "@/infra/factories/application/use-cases";
import { EntitySource } from "@caffeine/entity/symbols";
import { IdOrSlugDTO } from "@caffeine/presentation";
import Elysia from "elysia";

const FIND_POST_TYPE = `${PostType[EntitySource]}:find-post-type` as const;

export const FindPostTypeController = new Elysia()
	.decorate(FIND_POST_TYPE, makeFindPostTypeUseCase())
	.get(
		"/:id-or-slug",
		({ params, [FIND_POST_TYPE]: service, status }) =>
			status(200, service!.run(params["id-or-slug"]) as never),
		{
			params: IdOrSlugDTO,
			detail: {
				summary: "Find Post Type",
				description:
					"Retrieves the details of a specific post type identified by its unique ID or slug.",
			},
			response: { 200: UnpackedPostTypeDTO },
		},
	);
