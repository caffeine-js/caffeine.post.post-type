import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { UpdatePostTypeDTO } from "../dtos/update-post-type.dto";
import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@caffeine/errors/application";
import { slugify } from "@caffeine/models/helpers";
import { BuildPostType } from "@/domain/services/build-post-type.service";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";

export class UpdatePostTypeBySlugUseCase {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public async run(
		slug: string,
		{ isHighlighted, name }: UpdatePostTypeDTO,
	): Promise<IUnmountedPostType> {
		const _targetPostType = await this.repository.findBySlug(slug);

		if (!_targetPostType)
			throw new ResourceNotFoundException("post@post-type:slug");

		if (name || isHighlighted)
			_targetPostType.updatedAt = new Date().toISOString();

		if (name) {
			const slug = slugify(name);

			const hasPostTypeWithSameName = await this.repository.findBySlug(slug);

			if (hasPostTypeWithSameName)
				throw new ResourceAlreadyExistsException("post@post-type:slug");

			_targetPostType.name = name;
			_targetPostType.slug = slug;
		}

		_targetPostType.isHighlighted =
			isHighlighted ?? _targetPostType.isHighlighted;

		const targetPostType = BuildPostType.run(_targetPostType);

		await this.repository.update(targetPostType);

		return _targetPostType;
	}
}
