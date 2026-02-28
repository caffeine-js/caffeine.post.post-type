import type { CacheProviderDTO } from "@caffeine/cache/dtos";
import type { SimpleUrlDTO } from "@caffeine/models/dtos/primitives";
import type { IControllersWithoutAuth } from "./controllers-without-auth.interface";

export interface IControllersWithAuth extends IControllersWithoutAuth {
    jwtSecret: string;
    cacheProvider: CacheProviderDTO;
    redisUrl?: SimpleUrlDTO;
}
