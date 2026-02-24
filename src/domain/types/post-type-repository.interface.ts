import type { IPostTypeReader } from "./post-type-reader.interface";
import type { IPostTypeWriter } from "./post-type-writer.interface";

export interface IPostTypeRepository extends IPostTypeWriter, IPostTypeReader {}
