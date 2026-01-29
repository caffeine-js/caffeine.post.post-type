import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { CreatePostTypeDTO } from "../dtos/create-post-type.dto";
import { PostType } from "@/domain/post-type";
import { PostTypeUniquenessChecker } from "@/domain/services/post-type-uniqueness-checker.service";
import { slugify } from "@caffeine/models/helpers";
import { ResourceAlreadyExistsException } from "@caffeine/errors/application";
import { PostTypeSchemaFactory } from "@/domain/factories/post-type-schema.factory";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";

export class CreatePostTypeUseCase {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public async run({
		name,
		schema: _schema,
	}: CreatePostTypeDTO): Promise<IUnmountedPostType> {
		const uniquenessCheckerService = new PostTypeUniquenessChecker(
			this.repository,
		);

		const slug = slugify(name);

		if (await uniquenessCheckerService.run(slug))
			throw new ResourceAlreadyExistsException("post@post-type");

		const schema = PostTypeSchemaFactory.make(_schema);

		const newPostType = PostType.make({ name, slug }, schema);

		await this.repository.create(newPostType);

		return newPostType.unpack();
	}
}
