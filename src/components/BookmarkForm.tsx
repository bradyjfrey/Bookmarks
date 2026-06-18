import Link from "next/link";
import { Trash } from "./icons";
import { TagInput } from "./TagInput";

const inputCls = "w-full bg-surface border border-border rounded-md px-3 text-sm text-ink focus-accent";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink mb-1.5">
        {label}
        {hint && <span className="text-ink-faint font-normal"> · {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Switch({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative inline-block w-9 h-5 rounded-full bg-border peer-checked:bg-cubs transition-colors">
        <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-4" />
      </span>
      <span className="text-sm text-ink">{label}</span>
    </label>
  );
}

export type FormDefaults = {
  url?: string;
  title?: string | null;
  description?: string | null;
  tags?: string;
  private?: boolean;
  starred?: boolean;
};

export function BookmarkForm({
  action,
  deleteAction,
  defaults = {},
  submitLabel,
  id,
  allTags = [],
}: {
  action: (formData: FormData) => void | Promise<void>;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  defaults?: FormDefaults;
  submitLabel: string;
  id?: number;
  allTags?: string[];
}) {
  return (
    <div className="max-w-2xl space-y-5">
      <form id="bm-form" action={action} className="space-y-5">
        {id != null && <input type="hidden" name="id" value={id} />}
        <Field label="URL">
          <input name="url" type="url" required defaultValue={defaults.url} placeholder="https://…" className={`${inputCls} h-10`} />
        </Field>
        <Field label="Title" hint="leave blank to auto-fetch">
          <input name="title" defaultValue={defaults.title ?? ""} className={`${inputCls} h-10`} />
        </Field>
        <Field label="Description" hint="optional">
          <textarea name="description" rows={3} defaultValue={defaults.description ?? ""} className={`${inputCls} py-2`} />
        </Field>
        <Field label="Tags" hint="type to autocomplete existing tags">
          <TagInput allTags={allTags} defaultTags={defaults.tags ? defaults.tags.split(/\s+/).filter(Boolean) : []} />
        </Field>
        <div className="flex items-center gap-6 pt-1">
          <Switch name="private" label="Private" defaultChecked={defaults.private} />
          <Switch name="starred" label="Star" defaultChecked={defaults.starred} />
        </div>
      </form>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button type="submit" form="bm-form" className="h-9 px-4 rounded-md bg-cubs text-white text-sm font-medium hover:bg-cubs-dark">
            {submitLabel}
          </button>
          <Link href={id != null ? `/b/${id}` : "/"} className="h-9 px-4 inline-flex items-center rounded-md border border-border text-sm font-medium text-ink hover:bg-border-soft">
            Cancel
          </Link>
        </div>
        {deleteAction && id != null && (
          <form action={deleteAction}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-red-700 text-white text-sm font-medium hover:bg-red-800">
              <Trash className="w-4 h-4" />
              Delete
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
