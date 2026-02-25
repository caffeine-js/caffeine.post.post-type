import type { IPostTypeWriter } from "@/domain/types";
import type { FindPostTypeUseCase } from "./find-post-type.use-case";

export class DeletePostTypeUseCase {
	public constructor(
		private readonly writer: IPostTypeWriter,
		private readonly findPostType: FindPostTypeUseCase,
	) {}

	public async run(value: string) {
		const targetPostType = await this.findPostType.run(value);

		await this.writer.delete(targetPostType);

		return targetPostType;
	}
}
