import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FieldOption = { value: string; label: string };

type FieldSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FieldOption[];
  placeholder?: string;
  /** Extra classes for the closed box. */
  className?: string;
  /** Compact variant used by the inline filters. */
  size?: "default" | "sm";
  "aria-label"?: string;
};

/**
 * A select whose open panel follows the interface.
 *
 * A native `<select>` paints its option list with operating-system chrome —
 * square corners, the OS highlight colour, its own spacing — and no CSS
 * reaches inside it. This wraps the Radix listbox instead, which draws the
 * panel as ordinary markup, and keeps the closed box identical to `.field` so
 * a row mixing inputs and selects still lines up.
 *
 * Radix reserves the empty string as "no value", so an empty `value` becomes
 * the placeholder rather than an option.
 */
export function FieldSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  size = "default",
  "aria-label": ariaLabel,
}: FieldSelectProps) {
  const selectable = options.filter(option => option.value !== "");
  const fallback = options.find(option => option.value === "")?.label;

  return (
    <Select value={value === "" ? undefined : value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "field flex w-full items-center justify-between gap-2 text-left whitespace-normal",
          "data-[placeholder]:text-[#9aa8b1]",
          "focus-visible:border-[#8fa8ba] focus-visible:ring-[3px] focus-visible:ring-[#8fa8ba]/22",
          size === "sm" ? "h-9 px-3 py-1 text-xs" : "h-12",
          className
        )}
      >
        <SelectValue placeholder={placeholder ?? fallback} />
      </SelectTrigger>

      <SelectContent
        className={cn(
          "max-h-72 rounded-[0.9rem] border-[#e7dde1] bg-white p-1.5 text-[#051a2a]",
          "shadow-[0_18px_48px_rgba(50,19,39,0.16)]"
        )}
      >
        {selectable.map(option => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn(
              "rounded-lg px-2.5 py-2 text-sm",
              "focus:bg-[#f3e9ef] focus:text-[#602249]",
              "data-[state=checked]:bg-[#602249] data-[state=checked]:text-white"
            )}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
