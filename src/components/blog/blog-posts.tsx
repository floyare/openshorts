import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Container from "../container";
import { MultiSelect } from "../ui/multi-select";
import { cn } from "@/lib/utils";
import { Search, Tags } from "lucide-react";

type BlogPostsProps = {
    posts: any[]
}

const getSlug = (path: string) => path.split("/").at(-1)!.replace(".mdx", "");

const BlogPosts = (props: BlogPostsProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const allTags = useMemo(
        () =>
            Array.from(
                new Set(
                    props.posts
                        .map((post: any) => post.frontmatter.tags)
                        .flat()
                )
            ),
        [props.posts]
    );

    const filteredPosts = useMemo(() => {
        return props.posts
            .filter((post: any) => {
                const matchesPhrase =
                    post.frontmatter.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    post.frontmatter.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                const matchesTags =
                    selectedTags.length === 0 ||
                    selectedTags.every((tag) =>
                        post.frontmatter.tags.includes(tag)
                    );
                return matchesPhrase && matchesTags;
            })
            .sort(
                (a: any, b: any) =>
                    new Date(b.frontmatter.pubDate as string).getTime() -
                    new Date(a.frontmatter.pubDate as string).getTime()
            );
    }, [props.posts, searchQuery, selectedTags]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
    };

    return (
        <>
            <Container className="flex flex-row flex-wrap items-start md:items-center gap-4 p-4 my-2 w-full sticky lg:top-34 top-24 z-100 backdrop-blur-2xl">
                <label>
                    <p className="flex items-center gap-1 mb-1"><Search size={20} /> Search</p>
                    <Input
                        className="bg-white max-w-xs"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </label>
                <label>
                    <p className="flex items-center gap-1 mb-1"><Tags size={20} /> Tags</p>
                    <div className="w-full">
                        <MultiSelect
                            options={allTags.map((tag) => ({ label: tag, value: tag }))}
                            value={selectedTags}
                            onValueChange={setSelectedTags}
                            placeholder="Select tags..."
                            className="min-w-[200px] bg-white hover:bg-neutral-50 border-primary-800"
                        />
                    </div>
                </label>
            </Container>
            <div className="flex flex-wrap justify-center gap-2 p-4">
                {filteredPosts.length === 0 && (
                    <div className="text-neutral-500 py-8">No posts found.</div>
                )}
                {filteredPosts.map((post: any, index: number) => {
                    const isFirst = index === 0
                    return (
                        <a
                            key={post.file}
                            href={"/blog/" + getSlug(post.file)}
                            className={cn("flex items-center relative md:min-w-xl min-w-full bg-neutral-50 border-1 border-neutral-400 dark:bg-neutral-900 px-8 py-6 rounded-md no-underline gap-8 hover:border-primary-500 transition-colors", isFirst ? "border-primary-400" : "")}
                        >
                            {isFirst && <div className="absolute -top-4 -right-4 bg-primary-500 font-bold px-6 py-2 text-white rounded-full z-10">NEW</div>}
                            <div className="flex flex-col gap-3">
                                <p className="text-neutral-500 dark:text-neutral-600">
                                    {format(
                                        post.frontmatter.pubDate,
                                        "dd.MM.yyyy"
                                    )}
                                </p>
                                <div className="space-y-2">
                                    <b className="flex items-center gap-2 text-xl font-extrabold tracking-tight max-w-md text-balance break-words">
                                        {post.frontmatter.title}{" "}
                                    </b>
                                    <p className="max-w-md text-balance break-words">
                                        {post.frontmatter.description}
                                    </p>
                                </div>
                                <ul className="flex items-center gap-2 flex-wrap max-w-md">
                                    {post.frontmatter.tags.map((tag: string) => (
                                        <li key={tag}>
                                            <div
                                                className={`rounded-full px-3 text-sm py-1 ${selectedTags.includes(tag)
                                                    ? "bg-primary-500 text-white"
                                                    : "bg-secondary-600 text-white"
                                                    }`}
                                            >
                                                {tag}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <img
                                className="relative lg:block hidden w-3xs z-0 ml-auto"
                                src={post.frontmatter.image}
                                alt={post.frontmatter.title}
                            />
                        </a>
                    )
                })}
            </div>
        </>
    );
};

export default BlogPosts;