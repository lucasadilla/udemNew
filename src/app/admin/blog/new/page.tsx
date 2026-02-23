import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PostEditor } from "@/components/post-editor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-slate-800">Nouvel article</h1>
      <PostEditor />
    </main>
  );
}
