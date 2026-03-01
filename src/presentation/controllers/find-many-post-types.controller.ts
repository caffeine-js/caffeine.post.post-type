import { makeFindManyPostTypesUseCase } from "@/infra/factories/application/use-cases";
import { PaginationDTO } from "@caffeine/models/dtos/api";
import Elysia from "elysia";
import { FindManyPostTypesResponseDTO } from "../dtos/find-many-post-types-response.dto";
import { PostTypeRepositoryPlugin } from "../plugins";
import type { IControllersWithoutAuth } from "./types/controllers-without-auth.interface";

export function FindManyPostTypesController({
    repository,
}: IControllersWithoutAuth) {
    return new Elysia()
        .use(PostTypeRepositoryPlugin(repository))
        .derive({ as: "local" }, ({ postTypeRepository }) => ({
            findManyPostTypes: makeFindManyPostTypesUseCase(postTypeRepository),
        }))
        .get(
            "/",
            async ({ query, findManyPostTypes, set, status }) => {
                const { count, totalPages, value } =
                    await findManyPostTypes.run(query.page);

                set.headers["X-Total-Count"] = String(count);
                set.headers["X-Total-Pages"] = String(totalPages);

                return status(200, value as never);
            },
            {
                query: PaginationDTO,
                detail: {
                    summary: "List Post Types",
                    description: "Retrieves a paginated list of post types.",
                },
                response: {
                    200: FindManyPostTypesResponseDTO,
                },
            },
        );
}
