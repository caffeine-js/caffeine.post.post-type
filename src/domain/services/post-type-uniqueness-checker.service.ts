import type { IPostTypeRepository } from "../types/post-type-repository.interface";

export class PostTypeUniquenessChecker {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public async run(slug: string): Promise<boolean> {
		return !!(await this.repository.findBySlug(slug));
	}
}
