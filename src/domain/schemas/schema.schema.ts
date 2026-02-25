import { Schema } from "@caffeine/schema";
import { SchemaDTO } from "../dtos/schema.dto";
import type { t } from "@caffeine/models";

export const SchemaSchema: Schema<t.TString> = Schema.make(SchemaDTO);
