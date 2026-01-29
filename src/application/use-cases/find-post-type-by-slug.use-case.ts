import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";

export class FindPostTypeBySlugUseCase {
	public constructor(private readonly repository: IPostTypeRepository) {}

	// public aysnc run(slug: string): Promise<IUnmountedPostType | null> {

	// }
}
