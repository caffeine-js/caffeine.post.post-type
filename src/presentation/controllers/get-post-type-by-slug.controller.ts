import { makeFindPostTypeBySlugUseCase } from "@/infra/factories/application/find-post-type-by-slug.use-case.factory";
import { SlugObjectDTO } from "@caffeine/models/dtos";
import Elysia from "elysia";

export const GetPostTypeBySlugController = new Elysia()
	.decorate("service", makeFindPostTypeBySlugUseCase())
	.get(
		"/by-slug/:slug",
		({ params: { slug }, service }) => {
			return service.run(slug);
		},
		{
			params: SlugObjectDTO,
			detail: {
				summary: "Find Post Type by Slug",
				tags: ["Post Types"],
				description:
					"Retrieves the details of a specific post type identified by its unique slug.",
			},
		},
	);
