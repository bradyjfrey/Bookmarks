"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import * as m from "@/lib/mutations";
import { findBookmarkByUrl } from "@/lib/queries";
import { fetchMetadata } from "@/lib/metadata";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const on = (fd: FormData, k: string) => fd.get(k) === "on";
const revalidateAll = () => revalidatePath("/", "layout");

export async function createBookmarkAction(formData: FormData) {
  await requireUser();
  const url = str(formData, "url");
  if (!url) return;
  if (!on(formData, "force") && findBookmarkByUrl(url)) {
    const params = new URLSearchParams({ url });
    for (const k of ["title", "description", "tags"] as const) {
      const v = str(formData, k);
      if (v) params.set(k, v);
    }
    if (on(formData, "private")) params.set("private", "1");
    if (on(formData, "starred")) params.set("starred", "1");
    redirect(`/add?${params}`);
  }
  let title: string | null = str(formData, "title") || null;
  let description: string | null = str(formData, "description") || null;
  if (!title || !description) {
    const meta = await fetchMetadata(url);
    title = title || meta.title;
    description = description || meta.description;
  }
  m.createBookmark({
    url,
    title,
    description,
    tags: m.parseTags(str(formData, "tags")),
    private: on(formData, "private"),
    starred: on(formData, "starred"),
  });
  revalidateAll();
  redirect(/^https?:\/\//i.test(url) ? url : "/");
}

export async function updateBookmarkAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  m.updateBookmark(id, {
    url: str(formData, "url"),
    title: str(formData, "title") || null,
    description: str(formData, "description") || null,
    tags: m.parseTags(str(formData, "tags")),
    private: on(formData, "private"),
    starred: on(formData, "starred"),
  });
  revalidateAll();
  redirect(`/b/${id}`);
}

export async function toggleStarAction(formData: FormData) {
  await requireUser();
  m.toggleStarred(Number(formData.get("id")));
  revalidateAll();
}

export async function togglePrivateAction(formData: FormData) {
  await requireUser();
  m.togglePrivate(Number(formData.get("id")));
  revalidateAll();
}

export async function deleteBookmarkAction(formData: FormData) {
  await requireUser();
  m.softDelete(Number(formData.get("id")));
  revalidateAll();
}

export async function restoreBookmarkAction(formData: FormData) {
  await requireUser();
  m.restore(Number(formData.get("id")));
  revalidateAll();
}

export async function purgeBookmarkAction(formData: FormData) {
  await requireUser();
  m.purge(Number(formData.get("id")));
  revalidateAll();
}

export async function importAction(formData: FormData) {
  await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  let items: unknown;
  try {
    items = JSON.parse(await file.text());
  } catch {
    return;
  }
  if (!Array.isArray(items)) return;
  m.importItems(items as Record<string, unknown>[]);
  revalidateAll();
  redirect("/");
}

export async function emptyTrashAction() {
  await requireUser();
  m.emptyTrash();
  revalidateAll();
  redirect("/trash");
}
