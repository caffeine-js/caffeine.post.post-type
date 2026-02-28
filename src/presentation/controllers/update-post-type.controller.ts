import { UpdatePostTypeDTO } from "@/application/dtos/update-post-type.dto";
import { CaffeineAuth } from "@caffeine/auth/plugins/guards";
import Elysia from "elysia";
import { UpdatePostTypeQueryParamsDTO } from "../dtos/update-post-type-query-params.dto";
import { IdOrSlugDTO } from "@caffeine/presentation/dtos";
import { makeUpdatePostTypeUseCase } from "@/infra/factories/application/use-cases";
import { EntitySource } from "@caffeine/entity/symbols";
import { PostType } from "@/domain";
import { UnpackedPostTypeDTO } from "@/domain/dtos";
import { PostTypeRepositoryPlugin } from "../plugins";
import type { IControllersWithAuth } from "./types/controllers-with-auth.interface";

export function UpdatePostTypeController({
    cacheProvider,
    jwtSecret,
    redisUrl,
    repository,
}: IControllersWithAuth) {
    return new Elysia()
        .use(
            CaffeineAuth({
                layerName: PostType[EntitySource],
                jwtSecret,
                cacheProvider,
                redisUrl,
            }),
        )
        .use(PostTypeRepositoryPlugin(repository))
        .derive({ as: "local" }, ({ postTypeRepository }) => ({
            updatePostType: makeUpdatePostTypeUseCase(postTypeRepository),
        }))
        .patch(
            "/:id-or-slug",
            async ({ params, body, updatePostType, status, query }) =>
                status(
                    200,
                    (await updatePostType.run(
                        params["id-or-slug"],
                        body,
                        query["update-slug"],
                    )) as never,
                ),
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
}
