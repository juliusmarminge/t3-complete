import { Controller } from "react-hook-form";
import { z } from "zod";

import { PostCategory } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { Button } from "~/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/dialog";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";
import { Textarea } from "~/ui/text-area";
import { api, type RouterOutputs } from "~/utils/api";
import { useZodForm } from "~/utils/zod-form";

// This schema is reused on the backend
export const postCreateSchema = z.object({
  title: z.string().min(3).max(20),
  body: z.string().min(20),
  category: z.nativeEnum(PostCategory),
});

function CreatePostForm() {
  const { data: session } = useSession();

  const utils = api.useContext();
  const createPost = api.post.create.useMutation({
    onSettled: async () => {
      await utils.post.invalidate();
    },
  });

  const methods = useZodForm({
    schema: postCreateSchema,
  });

  const onSubmit = methods.handleSubmit(
    (data) => {
      createPost.mutate(data);
    },
    (e) => {
      console.log("Whoops... something went wrong!");
      console.error(e);
    },
  );

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <form action="" className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="space-y-1">
          <Label htmlFor="name">Title</Label>
          <Input
            id="name"
            className="bg-slate-800"
            {...methods.register("title")}
          />
          <p className="font-medium text-red-500">
            {methods.formState.errors?.title?.message}
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="text">Body</Label>
          <Textarea
            id="text"
            className="bg-slate-800"
            {...methods.register("body")}
          />
          <p className="font-medium text-red-500">
            {methods.formState.errors?.body?.message}
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="pet">Category</Label>
          <Controller
            control={methods.control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="bg-slate-800">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PostCategory).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <p className="font-medium text-red-500">
            {methods.formState.errors?.category?.message}
          </p>
        </div>
        <Button type="submit" disabled={!session}>
          {!session
            ? "Sign in to Post"
            : createPost.isLoading
            ? "Loading..."
            : "Post"}
        </Button>
        <p className="font-medium text-red-500">{createPost.error?.message}</p>
      </form>
    </div>
  );
}

function PostCard(props: { post: RouterOutputs["post"]["getAll"][number] }) {
  const { data: session } = useSession();
  const { post } = props;
  const utils = api.useContext();
  const deletePost = api.post.delete.useMutation({
    onSettled: async () => {
      await utils.post.invalidate();
    },
  });
  return (
    <div className="flex flex-row rounded-lg bg-white/10 p-4 transition-all hover:scale-[101%]">
      <Avatar className="mr-2 self-center">
        <AvatarImage src={post.author.image} alt="@shadcn" />
        <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <h2 className="text-2xl font-bold">{post.title}</h2>
        <p className="mt-2 text-sm">{post.body}</p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this post? This action cannot be
            reverted.
          </DialogDescription>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="destructive"
                disabled={!session}
                onClick={() => deletePost.mutate({ id: post.id })}
              >
                Delete
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PostPage() {
  const { data: posts } = api.post.getAll.useQuery();

  return (
    <main className="container mx-auto py-16">
      <CreatePostForm />
      <div className="mx-auto mt-4 flex max-w-xl flex-col gap-4">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
