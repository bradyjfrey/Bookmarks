"use client";
import { useMemo, useRef, useState } from "react";

/**
 * Tag entry with autocomplete against existing tags. Submits the selected tags
 * as a space-joined hidden input named `tags`, so the server action reads them
 * unchanged.
 */
export function TagInput({
  allTags,
  defaultTags = [],
  name = "tags",
}: {
  allTags: string[];
  defaultTags?: string[];
  name?: string;
}) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return allTags.filter((t) => t.toLowerCase().includes(q) && !tags.includes(t)).slice(0, 8);
  }, [input, allTags, tags]);

  function add(tag: string) {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setInput("");
    setOpen(false);
    setActive(0);
    inputRef.current?.focus();
  }
  const remove = (t: string) => setTags(tags.filter((x) => x !== t));

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      if (!input.trim() && e.key !== "Enter") return;
      e.preventDefault();
      if (open && suggestions[active]) add(suggestions[active]);
      else if (input.trim()) add(input);
    } else if (e.key === "Backspace" && !input && tags.length) {
      remove(tags[tags.length - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={tags.join(" ")} />
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-surface border border-border rounded-md focus-within:border-accent">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-ink bg-border">
            {t}
            <button type="button" onClick={() => remove(t)} className="text-ink-faint hover:text-ink" aria-label={`Remove ${t}`}>
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => input && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={tags.length ? "" : "Add a tag…"}
          className="flex-1 min-w-[8rem] bg-transparent text-sm text-ink outline-none px-1 py-0.5"
          autoComplete="off"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-md border border-border bg-surface shadow-lg py-1">
          {suggestions.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(s)}
                className={
                  "w-full text-left px-3 py-1.5 text-sm " +
                  (i === active ? "bg-accent-soft text-accent" : "text-ink hover:bg-border-soft")
                }
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
