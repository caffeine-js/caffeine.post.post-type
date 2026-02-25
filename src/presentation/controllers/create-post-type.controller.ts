import { CreatePostTypeDTO } from "@/application/dtos/create-post-type.dto";
import { PostType } from "@/domain";
import { UnpackedPostTypeDTO } from "@/domain/dtos";
import { makeCreatePostTypeUseCase } from "@/infra/factories/application/use-cases";
import { CaffeineAuth } from "@caffeine/auth/plugins/guards";
import { EntitySource } from "@caffeine/entity/symbols";
import { Elysia } from "elysia";

const CREATE_POST_TYPE = `${PostType[EntitySource]}:create-post-type` as const;

export const CreatePostTypeController = new Elysia()
	.use(CaffeineAuth({ layerName: PostType[EntitySource] }))
	.decorate(CREATE_POST_TYPE, makeCreatePostTypeUseCase())
	.post(
		"/",
		async ({ body, [CREATE_POST_TYPE]: service, status }) => {
			const response = await service!.run(body);

			return status(201, response as never);
		},
		{
			body: CreatePostTypeDTO,
			response: { 201: UnpackedPostTypeDTO },
			detail: {
				summary: "Create Post Type",
				description: "Creates a new post type with the provided details.",
			},
		},
	);
