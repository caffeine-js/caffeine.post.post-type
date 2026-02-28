import type { IPostTypeRepository } from "@/domain/types";

export interface IControllersWithoutAuth {
    repository: IPostTypeRepository;
}
