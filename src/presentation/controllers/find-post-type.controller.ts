import { UnpackedPostTypeDTO } from "@/domain/dtos";
import { makeFindPostTypeUseCase } from "@/infra/factories/application/use-cases";
import { IdOrSlugDTO } from "@caffeine/presentation/dtos";
import Elysia from "elysia";
import { PostTypeRepositoryPlugin } from "../plugins";
import type { IControllersWithoutAuth } from "./types/controllers-without-auth.interface";

export function FindPostTypeController({
    repository,
}: IControllersWithoutAuth) {
    return new Elysia()
        .use(PostTypeRepositoryPlugin(repository))
        .derive({ as: "local" }, ({ postTypeRepository }) => ({
            findPostType: makeFindPostTypeUseCase(postTypeRepository),
        }))
        .get(
            "/:id-or-slug",
            async ({ params, findPostType, status }) =>
                status(
                    200,
                    (await findPostType.run(params["id-or-slug"])) as never,
                ),
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
}
