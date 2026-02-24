import type { Schema } from "@caffeine/schema";
import type { SchemaDTO } from "../dtos/schema.dto";

export interface IRawPostType {
	readonly name: string;
	readonly slug: string;
	readonly schema: Schema<typeof SchemaDTO>;
	readonly isHighlighted: boolean;
}
