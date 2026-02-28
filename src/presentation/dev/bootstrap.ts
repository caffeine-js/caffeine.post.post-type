import Elysia from "elysia";
import { GetAccessController } from "@caffeine/auth/plugins/controllers";
import CaffeineAuthTags from "@caffeine/auth/plugins/tags";
import PostTypeTags from "../tags";
import { CaffeineErrorHandler } from "@caffeine/api-error-handler";
import { CaffeineResponseMapper } from "@caffeine/api-response-mapper";
import { CaffeineApiDocs } from "@caffeine/api-docs";
import { makePostTypeRepository } from "@/infra/factories/repositories";
import { PostTypeRoutes } from "../routes";
import { CaffeineEnv } from "@caffeine/env";
import { AuthEnvDependenciesDTO } from "@caffeine/auth/dtos";
import { PostTypeDependenciesDTO } from "@/infra/dependencies";
import { CaffeinePostAdapter } from "@caffeine-adapters/post/plugins";
import { CaffeineCache } from "@caffeine/cache";
import { CacheEnvDependenciesDTO } from "@caffeine/cache/dtos";
import { PostTypeRepositoryPlugin } from "../plugins";
import type { IPostTypeRepository } from "@/domain/types";
import { UnknownException } from "@caffeine/errors";

export async function bootstrap(open: boolean = false) {
    const app = new Elysia({ name: "@caffeine" })
        .use(
            CaffeineEnv(
                CacheEnvDependenciesDTO,
                AuthEnvDependenciesDTO,
                PostTypeDependenciesDTO,
            ),
        )
        .use(CaffeineErrorHandler)
        .use(CaffeineResponseMapper)
        .use((app) => {
            const { CACHE_PROVIDER, REDIS_URL } = app.decorator.env;

            return app.use(CaffeineCache({ CACHE_PROVIDER, REDIS_URL }));
        });

    const { env } = app.decorator;
    const {
        AUTH_EMAIL,
        AUTH_PASSWORD,
        JWT_SECRET,
        DATABASE_URL,
        DATABASE_PROVIDER,
        PORT,
        NODE_ENV,
        CACHE_PROVIDER,
        REDIS_URL,
    } = env;

    let postTypeRepository: IPostTypeRepository;

    if (DATABASE_URL && DATABASE_PROVIDER === "PRISMA") {
        const postAdapter = await CaffeinePostAdapter(DATABASE_URL);

        app.use(postAdapter).use((app) => {
            const { postPrismaClient: prismaClient, cache } = app.decorator;

            postTypeRepository = makePostTypeRepository({
                cache,
                prismaClient,
                target: DATABASE_PROVIDER,
            });

            return app.use(PostTypeRepositoryPlugin(postTypeRepository));
        });
    } else {
        app.use((app) => {
            const { cache } = app.decorator;

            postTypeRepository = makePostTypeRepository({
                cache,
                target: "MEMORY",
            });

            return app.use(PostTypeRepositoryPlugin(postTypeRepository));
        });
    }

    if (!postTypeRepository!) throw new UnknownException();

    return app
        .use(
            GetAccessController({
                AUTH_EMAIL,
                AUTH_PASSWORD,
                JWT_SECRET,
                CACHE_PROVIDER,
                REDIS_URL,
            }),
        )
        .use((app) => {
            const { env } = app.decorator;
            const { CACHE_PROVIDER, JWT_SECRET, REDIS_URL } = env;
            return app.use(
                PostTypeRoutes({
                    cacheProvider: CACHE_PROVIDER,
                    jwtSecret: JWT_SECRET,
                    repository: postTypeRepository,
                    redisUrl: REDIS_URL,
                }),
            );
        })
        .use(
            CaffeineApiDocs(
                NODE_ENV === "DEVELOPMENT",
                `http://localhost:${PORT}`,
                {
                    info: {
                        title: "Caffeine",
                        version: "1.0",
                        contact: {
                            email: "alanreisanjo@gmail.com",
                            name: "Alan Reis",
                            url: "https://hoyasumii.dev",
                        },
                        description:
                            "A RESTful API for managing Post Types within the Caffeine CMS platform. This microservice is responsible for creating, retrieving, updating, and deleting Post Types, handling global uniqueness through slugs, schema management for diverse content structures, and toggleable highlight states.",
                    },
                    tags: [CaffeineAuthTags, PostTypeTags],
                },
            ),
        )
        .use((app) => {
            if (open) {
                app.listen(app.decorator.env.PORT, () => {
                    console.log(
                        `🦊 Server is running at: http://localhost:${app.decorator.env.PORT}`,
                    );
                });
            }

            return app;
        });
}
