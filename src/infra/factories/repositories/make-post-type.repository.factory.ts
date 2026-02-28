import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import { PostTypeRepository as PrismaPostTypeRepository } from "@/infra/repositories/prisma";
import { PostTypeRepository as CachedPostTypeRepository } from "@/infra/repositories/cached";
import type { RepositoryProviderDTO } from "./dtos";
import { PostTypeRepository as TestPostTypeRepository } from "@/infra/repositories/test";
import type { PrismaClient } from "@caffeine-adapters/post";
import { ResourceNotFoundException } from "@caffeine/errors/infra";
import { PostType } from "@/domain";
import { EntitySource } from "@caffeine/entity/symbols";
import type { CaffeineCacheInstance } from "@caffeine/cache";

type MakePostTypeRepositoryArgs = {
    target?: RepositoryProviderDTO;
    cache: CaffeineCacheInstance;
    prismaClient?: PrismaClient;
};

export function makePostTypeRepository({
    cache,
    prismaClient,
    target,
}: MakePostTypeRepositoryArgs): IPostTypeRepository {
    if (target?.includes("PRISMA") && !prismaClient)
        throw new ResourceNotFoundException(PostType[EntitySource]);

    const repository: IPostTypeRepository =
        target === "PRISMA" && prismaClient
            ? new PrismaPostTypeRepository(prismaClient)
            : new TestPostTypeRepository();

    return new CachedPostTypeRepository(repository, cache);
}
