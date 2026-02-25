import { PostType } from "@/domain";
import { UnpackedPostTypeDTO } from "@/domain/dtos";
import { makeDeletePostTypeUseCase } from "@/infra/factories/application/use-cases";
import { CaffeineAuth } from "@caffeine/auth/plugins/guards";
import { EntitySource } from "@caffeine/entity/symbols";
import { IdOrSlugDTO } from "@caffeine/presentation";
import { Elysia } from "elysia";

const DELETE_POST_TYPE = `${PostType[EntitySource]}:delete-post-type` as const;

export const DeletePostTypeController = new Elysia()
	.use(CaffeineAuth({ layerName: PostType[EntitySource] }))
	.decorate(DELETE_POST_TYPE, makeDeletePostTypeUseCase())
	.delete(
		"/:id-or-slug",
		({ params, [DELETE_POST_TYPE]: service, status }) =>
			status(200, service!.run(params["id-or-slug"]) as never),
		{
			params: IdOrSlugDTO,
			detail: {
				summary: "Delete Post Type",
				description: "Deletes a post type identified by its slug or id.",
			},
			response: { 200: UnpackedPostTypeDTO },
		},
	);
