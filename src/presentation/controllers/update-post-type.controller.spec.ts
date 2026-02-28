import { describe, it, beforeEach, expect } from "bun:test";
import { bootstrap } from "../dev/bootstrap";
import { t } from "@caffeine/models";
import { faker } from "@faker-js/faker";
import { Schema } from "@caffeine/schema";
import { treaty } from "@elysiajs/eden";
import { slugify } from "@caffeine/entity/helpers";

const PostTypeDTO = t.Object({
    name: t.String({ description: "testing post type features" }),
});

const PostTypeSchema = Schema.make(PostTypeDTO);

type App = Awaited<ReturnType<typeof bootstrap>>;

describe("UpdatePostTypeController", () => {
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

    it("should update the name of a post type", async () => {
        const options = await authenticate();
        const created = await createPostType(options);
        const newName = faker.book.title();

        const { status, data } = await postType(created.slug).patch(
            { name: newName },
            options,
        );

        expect(status).toBe(200);
        expect(data?.name).toBe(newName);
        expect(data?.slug).toBe(created.slug);
    });

    it("should update the name and slug together when update-slug is true", async () => {
        const options = await authenticate();
        const created = await createPostType(options);
        const newName = faker.book.title();

        const { status, data } = await postType(created.slug).patch(
            { name: newName },
            { ...options, query: { "update-slug": true } },
        );

        expect(status).toBe(200);
        expect(data?.name).toBe(newName);
        expect(data?.slug).toBe(slugify(newName));
    });

    it("should update only the slug", async () => {
        const options = await authenticate();
        const created = await createPostType(options);
        const newSlug = "custom-slug";

        const { status, data } = await postType(created.slug).patch(
            { slug: newSlug },
            options,
        );

        expect(status).toBe(200);
        expect(data?.slug).toBe(newSlug);
        expect(data?.name).toBe(created.name);
    });

    it("should toggle isHighlighted", async () => {
        const options = await authenticate();
        const created = await createPostType(options);

        expect(created.isHighlighted).toBe(false);

        const { status, data } = await postType(created.slug).patch(
            { isHighlighted: true },
            options,
        );

        expect(status).toBe(200);
        expect(data?.isHighlighted).toBe(true);
    });

    it("should update a post type by id", async () => {
        const options = await authenticate();
        const created = await createPostType(options);
        const newName = faker.book.title();

        const { status, data } = await postType(created.id).patch(
            { name: newName },
            options,
        );

        expect(status).toBe(200);
        expect(data?.name).toBe(newName);
    });

    it("should reject unauthenticated requests", async () => {
        const options = await authenticate();
        const created = await createPostType(options);

        const { status } = await postType(created.slug).patch({
            name: "new-name",
        });

        expect(status).not.toBe(200);
    });

    it("should reject an empty body", async () => {
        const options = await authenticate();
        const created = await createPostType(options);

        const { status } = await postType(created.slug).patch(
            {} as never,
            options,
        );

        expect(status).toBe(422);
    });

    it("should fail when updating a non-existent post type", async () => {
        const options = await authenticate();

        const { status } = await postType("non-existent-slug").patch(
            { name: "whatever" },
            options,
        );

        expect(status).not.toBe(200);
    });

    it("should reject setting slug and update-slug at the same time", async () => {
        const options = await authenticate();
        const created = await createPostType(options);

        const { status } = await postType(created.slug).patch(
            { name: "new-name", slug: "new-slug" },
            { ...options, query: { "update-slug": true } },
        );

        expect(status).not.toBe(200);
    });

    it("should reject a duplicate slug", async () => {
        const options = await authenticate();
        const first = await createPostType(options);
        const second = await createPostType(options);

        const { status } = await postType(second.slug).patch(
            { slug: first.slug },
            options,
        );

        expect(status).not.toBe(200);
    });
});
