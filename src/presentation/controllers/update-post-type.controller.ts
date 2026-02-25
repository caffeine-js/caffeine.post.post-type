import { UpdatePostTypeDTO } from "@/application/dtos/update-post-type.dto";
import { CaffeineAuth } from "@caffeine/auth/plugins/guards";
import Elysia from "elysia";
import { UpdatePostTypeQueryParamsDTO } from "../dtos/update-post-type-query-params.dto";
import { IdOrSlugDTO } from "@caffeine/presentation";
import { makeUpdatePostTypeUseCase } from "@/infra/factories/application/use-cases";
import { EntitySource } from "@caffeine/entity/symbols";
import { PostType } from "@/domain";
import { UnpackedPostTypeDTO } from "@/domain/dtos";

const UPDATE_POST_TYPE = `${PostType[EntitySource]}:update-post-type` as const;

export const UpdatePostTypeController = new Elysia()
	.use(CaffeineAuth({ layerName: PostType[EntitySource] }))
	.decorate(UPDATE_POST_TYPE, makeUpdatePostTypeUseCase())
	.patch(
		"/:id-or-slug",
		({ params, body, [UPDATE_POST_TYPE]: service, status }) =>
			status(200, service!.run(params["id-or-slug"], body) as never),
		{
			params: IdOrSlugDTO,
			query: UpdatePostTypeQueryParamsDTO,
			body: UpdatePostTypeDTO,
			detail: {
				summary: "Update Post Type",
				description:
					"Updates an existing post type identified by its slug or id.",
			},
			response: { 200: UnpackedPostTypeDTO },
		},
	);
