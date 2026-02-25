import Elysia from "elysia";
import { CreatePostTypeController } from "./controllers/create-post-type.controller";
import { DeletePostTypeController } from "./controllers/delete-post-type.controller";
import { FindManyPostTypeController } from "./controllers/find-many-post-types.controller";
import { UpdatePostTypeController } from "./controllers/update-post-type.controller";
import { FindPostTypeController } from "./controllers/find-post-type.controller";
import { FindHighlightedPostTypeController } from "./controllers/find-highlighted-post-types.controller";

export const PostTypeRoutes = new Elysia({
	prefix: "/post-type",
	detail: {
		tags: ["Post Type"],
	},
})
	.use(CreatePostTypeController)
	.use(DeletePostTypeController)
	.use(FindPostTypeController)
	.use(FindManyPostTypeController)
	.use(FindHighlightedPostTypeController)
	.use(UpdatePostTypeController);

export type PostTypeRoutes = typeof PostTypeRoutes;
