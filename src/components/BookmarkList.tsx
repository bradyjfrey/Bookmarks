import type { ListRow } from "@/lib/queries";
import { BookmarkRow } from "./BookmarkRow";

export function BookmarkList({
  rows,
  canEdit,
  empty = "Nothing here yet.",
}: {
  rows: ListRow[];
  canEdit: boolean;
  empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="px-4 sm:px-6 lg:px-8 py-16 text-center text-sm text-ink-faint">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {rows.map((b) => (
        <BookmarkRow key={b.id} b={b} canEdit={canEdit} />
      ))}
    </ul>
  );
}
