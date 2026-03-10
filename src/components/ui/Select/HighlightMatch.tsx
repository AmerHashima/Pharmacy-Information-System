interface HighlightMatchProps {
  text: string;
  query: string;
  isSelected: boolean;
}

/**
 * Renders `text` with the first occurrence of `query` wrapped in a <mark>
 * that receives a colour hint based on whether the option is currently selected.
 */
export function HighlightMatch({
  text,
  query,
  isSelected,
}: HighlightMatchProps) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <mark
        className={`font-semibold bg-transparent ${
          isSelected ? "text-white" : "text-blue-600"
        }`}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
