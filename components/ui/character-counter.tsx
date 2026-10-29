import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  value: string;
  limit: number;
}

export function CharacterCounter({ value, limit }: CharacterCounterProps) {
  const exceedsLimit = value.length > limit;

  return (
    <p
      className={cn(
        "mt-1 text-right text-xs text-muted-foreground",
        exceedsLimit && "font-semibold text-destructive"
      )}
      aria-live="polite"
    >
      {value.length}/{limit}
      {exceedsLimit && " — supera el límite permitido"}
    </p>
  );
}
