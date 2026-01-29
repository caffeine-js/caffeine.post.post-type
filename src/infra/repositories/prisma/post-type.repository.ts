import type { PostType } from "@/domain/post-type";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@/domain/types/unmounted-post-type.interface";
import { prismaErrorManager, prisma } from "@caffeine/prisma-drive";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/prisma-drive/constants";
import {
	parseIsoDateTimeToPrismaDateTime,
	parsePrismaDateTimeToISOString,
} from "@caffeine/prisma-drive/helpers";

export class PostTypeRepository implements IPostTypeRepository {
	async create(postType: PostType): Promise<void> {
		const {
			createdAt: _createdAt,
			updatedAt: _,
			schema: _schema,
			...properties
		} = postType;

		const createdAt = new Date(_createdAt);
		const schema = _schema.toString();

		try {
			await prisma.postType.create({
				data: { createdAt, schema, ...properties },
			});
		} catch (err: unknown) {
			prismaErrorManager("post@post-type", err);
		}
	}

	async findById(id: string): Promise<IUnmountedPostType | null> {
		const targetPostType = await prisma.postType.findFirst({ where: { id } });

		if (!targetPostType) return null;

		return parsePrismaDateTimeToISOString(targetPostType);
	}

	async findBySlug(slug: string): Promise<IUnmountedPostType | null> {
		const targetPostType = await prisma.postType.findFirst({ where: { slug } });

		if (!targetPostType) return null;

		return parsePrismaDateTimeToISOString(targetPostType);
	}

	async findMany(page: number): Promise<IUnmountedPostType[]> {
		return (
			await prisma.postType.findMany({
				skip: MAX_ITEMS_PER_QUERY * page,
				take: MAX_ITEMS_PER_QUERY,
			})
		).map((item) => parsePrismaDateTimeToISOString(item));
	}

	async update(postType: PostType): Promise<void> {
		const { schema: _schema, ...propeties } = postType;
		const schema = _schema.toString();

		const targetPostType = parseIsoDateTimeToPrismaDateTime({
			...propeties,
			schema,
		});

		try {
			await prisma.postType.update({
				where: { id: postType.id },
				data: targetPostType,
			});
		} catch (err: unknown) {
			prismaErrorManager("post@post-type", err);
		}
	}

	async delete(postType: PostType): Promise<void> {
		try {
			await prisma.postType.delete({ where: { id: postType.id } });
		} catch (err: unknown) {
			prismaErrorManager("post@post-type", err);
		}
	}

	async getHighlights(): Promise<IUnmountedPostType[]> {
		const highlightedPostTypes = await prisma.postType.findMany({
			where: { isHighlighted: true },
		});

		return highlightedPostTypes.map((item) =>
			parsePrismaDateTimeToISOString(item),
		);
	}

	length(): Promise<number> {
		return prisma.postType.count();
	}
}
