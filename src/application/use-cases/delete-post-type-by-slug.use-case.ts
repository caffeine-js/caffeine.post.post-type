import { BuildPostType } from "@/domain/services/build-post-type.service";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class DeletePostTypeBySlugUseCase {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public async run(slug: string): Promise<void> {
		const _targetPostType = await this.repository.findBySlug(slug);

		if (!_targetPostType) throw new ResourceNotFoundException("post@post-type");

		const targetPostType = BuildPostType.run(_targetPostType);

		await this.repository.delete(targetPostType);
	}
}
