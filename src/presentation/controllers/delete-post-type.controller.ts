import { PostType } from "@/domain";
import { makeDeletePostTypeUseCase } from "@/infra/factories/application/use-cases";
import { CaffeineAuth } from "@caffeine/auth/plugins/guards";
import { EntitySource } from "@caffeine/entity/symbols";
import { IdOrSlugDTO } from "@caffeine/presentation/dtos";
import { Elysia } from "elysia";
import { PostTypeRepositoryPlugin } from "../plugins";
import type { IControllersWithAuth } from "./types/controllers-with-auth.interface";
import { t } from "@caffeine/models";

export function DeletePostTypeController({
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
            deletePostType: makeDeletePostTypeUseCase(postTypeRepository),
        }))
        .delete(
            "/:id-or-slug",
            async ({ params, deletePostType, set }) => {
                await deletePostType.run(params["id-or-slug"]);
                set.status = 204;
                return;
            },
            {
                params: IdOrSlugDTO,
                detail: {
                    summary: "Delete Post Type",
                    description:
                        "Deletes a post type identified by its slug or id.",
                },
                response: { 204: t.Undefined() },
            },
        );
}
