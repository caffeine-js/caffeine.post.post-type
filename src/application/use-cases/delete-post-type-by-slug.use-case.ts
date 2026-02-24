import type { IPostTypeWriter } from "@/domain/types";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { FindPostTypeUseCase } from "./find-post-type.use-case";
import { PostType } from "@/domain";
import { EntitySource } from "@caffeine/entity/symbols";

export class DeletePostTypeBySlugUseCase {
	public constructor(
		private readonly writer: IPostTypeWriter,
		private readonly findPostType: FindPostTypeUseCase,
	) {}

	public async run(value: string) {
		const targetPostType = await this.findPostType.run(value);

		if (!targetPostType)
			throw new ResourceNotFoundException(PostType[EntitySource]);

		await this.writer.delete(targetPostType);
	}
}
