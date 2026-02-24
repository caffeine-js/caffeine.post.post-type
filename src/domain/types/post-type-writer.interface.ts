import type { IPostType } from "./post-type.interface";

export interface IPostTypeWriter {
	create(postType: IPostType): Promise<void>;
	update(postType: IPostType): Promise<void>;
	update(postType: IPostType): Promise<void>;
}
