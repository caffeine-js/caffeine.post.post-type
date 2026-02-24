import type { IPostType, IPostTypeRepository } from "@/domain/types";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";

export class PostTypeRepository implements IPostTypeRepository {
	items: IPostType[] = [];

	async create(postType: IPostType): Promise<void> {
		this.items.push(postType);
	}

	async update(postType: IPostType): Promise<void> {
		const index = this.items.findIndex((item) => item.id === postType.id);

		if (index !== -1) {
			this.items[index] = postType;
		}
	}

	async delete(postType: IPostType): Promise<void> {
		const index = this.items.findIndex((item) => item.id === postType.id);

		if (index !== -1) {
			this.items.splice(index, 1);
		}
	}

	async findById(id: string): Promise<IPostType | null> {
		const result = this.items.find((item) => item.id === id);

		return result ?? null;
	}

	async findBySlug(slug: string): Promise<IPostType | null> {
		const result = this.items.find((item) => item.slug === slug);

		return result ?? null;
	}

	async findMany(page: number): Promise<IPostType[]> {
		const take = MAX_ITEMS_PER_QUERY;
		const start = (page - 1) * take;

		return this.items.slice(start, start + take);
	}

	async findManyByIds(ids: string[]): Promise<IPostType[]> {
		return this.items.filter((item) => ids.includes(item.id));
	}

	async findHighlights(page: number): Promise<IPostType[]> {
		const take = MAX_ITEMS_PER_QUERY;
		const start = (page - 1) * take;

		return this.items
			.filter((item) => item.isHighlighted)
			.slice(start, start + take);
	}

	async count(): Promise<number> {
		return this.items.length;
	}

	async countHighlights(): Promise<number> {
		return this.items.filter((item) => item.isHighlighted).length;
	}
}
