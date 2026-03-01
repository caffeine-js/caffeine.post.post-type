import { Schema } from "@caffeine/schema";
import { UpdatePostTypeDTO } from "../dtos/update-post-type.dto";

export const UpdatePostTypeSchema: Schema<typeof UpdatePostTypeDTO> =
    Schema.make(UpdatePostTypeDTO);
