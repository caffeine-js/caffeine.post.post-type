import type { PostType } from "@/domain/post-type";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";

export class PostTypeRepository implements IPostTypeRepository {
	public items: PostType[] = [];

	async create(postType: PostType): Promise<void> {
		this.items.push(postType);
	}

	async findById(id: string): Promise<IUnmountedPostType | null> {
		const item = this.items.find((i) => i.id === id);
		if (!item) return null;
		return item.unpack();
	}

	async findManyById(...ids: string[]): Promise<IUnmountedPostType[]> {
		return this.items.filter((i) => ids.includes(i.id)).map((i) => i.unpack());
	}

	async findBySlug(slug: string): Promise<IUnmountedPostType | null> {
		const item = this.items.find((i) => i.slug === slug);
		if (!item) return null;
		return item.unpack();
	}

	async findMany(page: number): Promise<IUnmountedPostType[]> {
		const offset = 10;
		const start = (page - 1) * offset;
		const end = start + offset;
		return this.items.slice(start, end).map((i) => i.unpack());
	}

	async update(postType: PostType): Promise<void> {
		const index = this.items.findIndex((i) => i.id === postType.id);
		if (index === -1) return;
		this.items[index] = postType;
	}

	async getHighlights(): Promise<IUnmountedPostType[]> {
		return this.items.filter((i) => i.isHighlighted).map((i) => i.unpack());
	}

	async delete(postType: PostType): Promise<void> {
		const index = this.items.findIndex((i) => i.id === postType.id);
		if (index !== -1) {
			this.items.splice(index, 1);
		}
	}

	async length(): Promise<number> {
		return this.items.length;
	}
}
