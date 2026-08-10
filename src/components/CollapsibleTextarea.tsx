import { useEffect, useState } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  guide?: string;
  storageKey?: string;
}

const STORAGE_PREFIX = "dreamsapi:textarea-collapsed:";

function readSavedCollapsed(storageKey: string | undefined, hasValue: boolean) {
  if (!storageKey || typeof window === "undefined") return hasValue;
  const saved = window.localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
  if (saved === "true") return true;
  if (saved === "false") return false;
  return hasValue;
}

export default function CollapsibleTextarea({ label, value, onChange, placeholder, guide, storageKey }: Props) {
  const textLength = value.trim().length;
  const [collapsed, setCollapsed] = useState(() => readSavedCollapsed(storageKey, textLength > 0));
  const preview = textLength ? value.replace(/\s+/g, " ").trim().slice(0, 180) : "아직 붙여넣은 내용이 없습니다.";

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    window.localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, String(collapsed));
  }, [collapsed, storageKey]);

  useEffect(() => {
    if (!storageKey && textLength > 0) setCollapsed(true);
  }, [storageKey, textLength]);

  return (
    <section className={collapsed ? "collapsible-field collapsed" : "collapsible-field"}>
      <div className="collapsible-field-head">
        <div>
          <label>{label}</label>
          {guide && <p className="textarea-guide">{guide}</p>}
        </div>
        <button type="button" className="ghost compact-toggle" onClick={() => setCollapsed((next) => !next)}>
          {collapsed ? "펼치기" : "숨기기"}
        </button>
      </div>

      {collapsed ? (
        <button type="button" className="collapsed-preview" onClick={() => setCollapsed(false)}>
          <strong>{label} · {textLength.toLocaleString("ko-KR")}자</strong>
          <span>{preview}{textLength > 180 ? "…" : ""}</span>
        </button>
      ) : (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      )}
    </section>
  );
}
