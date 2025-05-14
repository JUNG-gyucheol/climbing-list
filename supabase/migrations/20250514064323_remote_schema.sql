alter table "public"."climbing" disable row level security;

alter table "public"."climbing_branch" add column "insta_url" character varying;

CREATE UNIQUE INDEX climbing_branch_insta_url_key ON public.climbing_branch USING btree (insta_url);

alter table "public"."climbing_branch" add constraint "climbing_branch_insta_url_key" UNIQUE using index "climbing_branch_insta_url_key";


