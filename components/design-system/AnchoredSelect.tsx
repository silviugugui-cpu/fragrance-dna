"use client";

import { useEffect, useId, useRef, useState } from "react";

type Option = { value: string; label: string };

export default function AnchoredSelect({ id, label, value, options, onChange, className = "" }: {
  id?: string; label: string; value: string; options: Option[];
  onChange: (value: string) => void; className?: string;
}) {
  const generatedId = useId();
  const listId = `${id ?? generatedId}-options`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);
  const choose = (index: number) => {
    if (!options[index]) return;
    onChange(options[index].value);
    setOpen(false);
    button.current?.focus();
  };
  const move = (index: number) => {
    const next = Math.max(0, Math.min(index, options.length - 1));
    setActive(next);
    setOpen(true);
    requestAnimationFrame(() => document.getElementById(`${listId}-${next}`)?.scrollIntoView({ block: "nearest" }));
  };
  return (
    <div ref={container} className={`relative ${open ? "z-50" : ""} ${className}`}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <button ref={button} id={id} type="button" role="combobox" aria-label={label}
        aria-expanded={open} aria-controls={listId} aria-haspopup="listbox"
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-current bg-[rgb(var(--public-surface-channels,25,20,16))] px-3 py-2.5 text-left text-sm text-[color:var(--public-ink-primary,#f1e3c4)]"
        onClick={() => { setActive(Math.max(0, options.findIndex((option) => option.value === value))); setOpen(!open); }}
        onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
          else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            move(open ? active + (event.key === "ArrowDown" ? 1 : -1) : Math.max(0, options.findIndex((option) => option.value === value)));
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault(); move(event.key === "Home" ? 0 : options.length - 1);
          } else if (open && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault(); choose(active);
          } else if (event.key.length === 1 && event.key !== " ") {
            const index = options.findIndex((option, index) => index > active && option.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()));
            const fallback = options.findIndex((option) => option.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()));
            if (index >= 0 || fallback >= 0) { event.preventDefault(); move(index >= 0 ? index : fallback); }
          }
        }}>
        <span>{options.find((option) => option.value === value)?.label}</span><span aria-hidden="true">v</span>
      </button>
      {open && <ul id={listId} role="listbox" aria-label={label}
        className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-current bg-[rgb(var(--public-surface-channels,25,20,16))] p-1 shadow-xl">
        {options.map((option, index) => <li key={option.value} id={`${listId}-${index}`} role="option"
          aria-selected={value === option.value} onMouseDown={(event) => event.preventDefault()}
          onClick={() => choose(index)}
          className={`cursor-pointer rounded-lg px-3 py-2 text-sm text-[color:var(--public-ink-primary,#f1e3c4)] hover:bg-white/10 ${active === index ? "bg-white/10" : ""}`}>
          {option.label}
        </li>)}
      </ul>}
    </div>
  );
}
