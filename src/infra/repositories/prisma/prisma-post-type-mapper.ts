import { PostType } from "@/domain";
import type { IPostType, IUnpackedPostType } from "@/domain/types";
import { parsePrismaDateTimeToISOString } from "@caffeine-packages/post.db.prisma-drive/helpers";
import { Mapper } from "@caffeine/entity";

type PostTypePrismaDefaultOutput = Omit<
	IUnpackedPostType,
	"createdAt" | "updatedAt"
> & {
	id: string;
	createdAt: Date;
	updatedAt: Date | null;
};

export const PrismaPostTypeMapper = {
	run: (content: PostTypePrismaDefaultOutput): IPostType => {
		const data: IUnpackedPostType = parsePrismaDateTimeToISOString(content);

		return Mapper.toDomain(data, PostType.make) as IPostType;
	},
} as const;
