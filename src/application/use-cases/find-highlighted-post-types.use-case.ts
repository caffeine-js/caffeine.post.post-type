import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";

export class FindHighlightedPostTypesUseCase {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public run(): Promise<IUnmountedPostType[]> {
		return this.repository.getHighlights();
	}
}
