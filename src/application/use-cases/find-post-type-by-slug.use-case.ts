import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class FindPostTypeBySlugUseCase {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public async run(slug: string): Promise<IUnmountedPostType> {
		slug = slug.trim();

		const targetPostType = await this.repository.findBySlug(slug);

		if (!targetPostType)
			throw new ResourceNotFoundException(
				"post@post-type",
				`PostType with slug as ${slug} Was Not Found.`,
			);

		return targetPostType;
	}
}
