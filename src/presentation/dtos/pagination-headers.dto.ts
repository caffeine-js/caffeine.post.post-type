import { t } from "@caffeine/models";

export const PaginationHeadersDTO = t.Object({
    "X-Total-Count": t.String(),
    "X-Total-Pages": t.String(),
});

export type PaginationHeadersDTO = t.Static<typeof PaginationHeadersDTO>;
