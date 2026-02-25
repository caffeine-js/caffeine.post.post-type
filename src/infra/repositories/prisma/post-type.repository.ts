import { PostType } from "@/domain/post-type";
import type { IPostType } from "@/domain/types";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import { prisma } from "@caffeine-packages/post.db.prisma-drive";
import { SafePrisma } from "@caffeine-packages/post.db.prisma-drive/decorators";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";
import { Mapper } from "@caffeine/entity";
import { EntitySource } from "@caffeine/entity/symbols";
import { PrismaPostTypeMapper } from "./prisma-post-type-mapper";

export class PostTypeRepository implements IPostTypeRepository {
	@SafePrisma(PostType[EntitySource])
	async create(data: IPostType): Promise<void> {
		await prisma.postType.create({
			data: Mapper.toDTO(data),
		});
	}

	@SafePrisma(PostType[EntitySource])
	async update(_data: IPostType): Promise<void> {
		const { id, ...data } = Mapper.toDTO(_data);

		await prisma.postType.update({
			where: { id },
			data,
		});
	}

	@SafePrisma(PostType[EntitySource])
	async delete(postType: IPostType): Promise<void> {
		await prisma.postType.delete({ where: { id: postType.id } });
	}

	@SafePrisma(PostType[EntitySource])
	async findById(id: string): Promise<IPostType | null> {
		const targetPostType = await prisma.postType.findFirst({ where: { id } });

		if (!targetPostType) return null;

		return PrismaPostTypeMapper.run(targetPostType);
	}

	@SafePrisma(PostType[EntitySource])
	async findBySlug(slug: string): Promise<IPostType | null> {
		const targetPostType = await prisma.postType.findFirst({ where: { slug } });

		if (!targetPostType) return null;

		return PrismaPostTypeMapper.run(targetPostType);
	}

	@SafePrisma(PostType[EntitySource])
	async findMany(page: number): Promise<IPostType[]> {
		return (
			await prisma.postType.findMany({
				skip: MAX_ITEMS_PER_QUERY * (page - 1),
				take: MAX_ITEMS_PER_QUERY,
			})
		).map((item) => PrismaPostTypeMapper.run(item));
	}

	@SafePrisma(PostType[EntitySource])
	async findManyByIds(ids: string[]): Promise<IPostType[]> {
		return (
			await prisma.postType.findMany({
				where: { id: { in: ids } },
			})
		).map((item) => PrismaPostTypeMapper.run(item));
	}

	@SafePrisma(PostType[EntitySource])
	async findHighlights(page: number): Promise<IPostType[]> {
		return (
			await prisma.postType.findMany({
				where: { isHighlighted: true },
				skip: MAX_ITEMS_PER_QUERY * (page - 1),
				take: MAX_ITEMS_PER_QUERY,
			})
		).map((item) => PrismaPostTypeMapper.run(item));
	}

	@SafePrisma(PostType[EntitySource])
	count(): Promise<number> {
		return prisma.postType.count();
	}

	@SafePrisma(PostType[EntitySource])
	countHighlights(): Promise<number> {
		return prisma.postType.count({ where: { isHighlighted: true } });
	}
}
