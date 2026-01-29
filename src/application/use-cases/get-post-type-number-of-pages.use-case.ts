import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";

export class GetPostTypeNumberOfPagesUseCase {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public async run(): Promise<number> {
		const postTypeLength = await this.repository.length();
		return Math.ceil(postTypeLength / MAX_ITEMS_PER_QUERY);
	}
}
