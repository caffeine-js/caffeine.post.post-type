import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";

export class FindManyPostTypesUseCase {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public run(page: number): Promise<IUnmountedPostType[]> {
		return this.repository.findMany(page);
	}
}
