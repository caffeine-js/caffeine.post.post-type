import type { IRawEntity } from "@caffeine/entity/types";
import type { IConstructorPostType } from "./constructor-post-type.interface";

export interface IUnpackedPostType extends IConstructorPostType, IRawEntity {}
