import { describe, it, beforeEach, expect } from "bun:test";
import { bootstrap } from "../dev/bootstrap";
import { t } from "@caffeine/models";
import { faker } from "@faker-js/faker";
import { Schema } from "@caffeine/schema";
import { treaty } from "@elysiajs/eden";

const PostTypeDTO = t.Object({
    name: t.String({ description: "testing post type features" }),
});

const PostTypeSchema = Schema.make(PostTypeDTO);

type App = Awaited<ReturnType<typeof bootstrap>>;

describe("FindPostTypeController", () => {
    let server: App;
    let api: ReturnType<typeof treaty<App>>;
    let env: App["decorator"]["env"];

    beforeEach(async () => {
        server = await bootstrap();
        await (
            server.decorator.cache as unknown as {
                flushall: () => Promise<void>;
            }
        ).flushall();
        api = treaty<typeof server>(server);
        env = server.decorator.env;
    });

    async function authenticate() {
        const { AUTH_EMAIL: email, AUTH_PASSWORD: password } = env;
        const auth = await api.auth.login.post({ email, password });
        const cookies = auth.response.headers.getSetCookie();
        return { headers: { cookie: cookies.join("; ") } };
    }

    async function createPostType(
        options: Awaited<ReturnType<typeof authenticate>>,
    ) {
        const name = faker.book.title();
        const { data } = await api["post-types"].post(
            { name, schema: PostTypeSchema.toString() },
            options,
        );
        return data!;
    }

    function postType(idOrSlug: string) {
        return api["post-types"]({ "id-or-slug": idOrSlug });
    }

    it("should find a post type by slug", async () => {
        const options = await authenticate();
        const created = await createPostType(options);

        const { status, data } = await postType(created.slug).get();

        expect(status).toBe(200);
        expect(data?.slug).toBe(created.slug);
        expect(data?.name).toBe(created.name);
    });

    it("should find a post type by id", async () => {
        const options = await authenticate();
        const created = await createPostType(options);

        const { status, data } = await postType(created.id).get();

        expect(status).toBe(200);
        expect(data?.id).toBe(created.id);
    });

    it("should return the full post type payload", async () => {
        const options = await authenticate();
        const created = await createPostType(options);

        const { data } = await postType(created.slug).get();

        expect(data).toMatchObject({
            name: created.name,
            slug: created.slug,
            schema: created.schema,
            isHighlighted: false,
        });
        expect(data?.id).toBeDefined();
        expect(data?.createdAt).toBeDefined();
    });

    it("should not require authentication", async () => {
        const options = await authenticate();
        const created = await createPostType(options);

        const { status } = await postType(created.slug).get();
        expect(status).toBe(200);
    });

    it("should return an error for a non-existent slug", async () => {
        const { status } = await postType("non-existent-slug").get();

        expect(status).not.toBe(200);
    });

    it("should return an error for a non-existent id", async () => {
        const { status } = await postType(
            "550e8400-e29b-41d4-a716-446655440000",
        ).get();

        expect(status).not.toBe(200);
    });
});
