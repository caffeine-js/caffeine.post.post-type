import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class FindPostTypeByIdUseCase {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public async run(id: string): Promise<IUnmountedPostType> {
		id = id.trim();

		const targetPostType = await this.repository.findById(id);

		if (!targetPostType)
			throw new ResourceNotFoundException(
				"post@post-type",
				`PostType with id as ${id} Was Not Found.`,
			);

		return targetPostType;
	}
}
