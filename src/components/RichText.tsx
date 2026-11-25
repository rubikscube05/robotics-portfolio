import { Fragment } from "react";

const TOKEN = /\[ADD:[^\]]*\]/g;

export function isPlaceholder(value: string): boolean {
  return /\[ADD:[^\]]*\]/.test(value);
}

/** Text with every [ADD: …] token removed and spacing tidied. */
export function cleanText(value: string): string {
  return value.replace(TOKEN, "").replace(/\s{2,}/g, " ").trim();
}

/**
 * Renders content text. Unfinished `[ADD: …]` notes stay in the data file
 * (see CONTENT_TODO.md) but are hidden from visitors. Run the dev server
 * with ?todo in the URL to see them highlighted.
 */
export function RichText({ text }: { text: string }) {
  const showTodo =
    import.meta.env.DEV && typeof window !== "undefined" && window.location.search.includes("todo");

  if (!showTodo) return <>{cleanText(text)}</>;

  const parts = text.split(/(\[ADD:[^\]]*\])/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("[ADD:") ? (
          <mark className="todo" key={index}>
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
