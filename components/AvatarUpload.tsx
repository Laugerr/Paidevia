"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadAvatarAction } from "@/lib/actions/profile";

type Props = {
  size: number;
  currentImage: string | null;
  fallback: string;
  pencilSize?: number;
};

export default function AvatarUpload({ size, currentImage, fallback, pencilSize = 11 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const iconSize = Math.round(size * 0.27);
  const badgeSize = Math.round(size * 0.27);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }

    // Convert to base64 on the client, then call the server action with the string
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);

      startTransition(async () => {
        try {
          const result = await uploadAvatarAction(dataUrl);
          if (result?.error) {
            setError(result.error);
            setPreview(null);
          } else {
            router.refresh();
          }
        } catch {
          setError("Upload failed. Try a smaller image.");
          setPreview(null);
        }
      });
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  const src = preview ?? currentImage;

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Avatar */}
      {src ? (
        <img
          src={src}
          alt="avatar"
          referrerPolicy="no-referrer"
          style={{
            width: size, height: size, borderRadius: "50%",
            objectFit: "cover", border: "3px solid var(--border)",
            opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s",
          }}
        />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: Math.round(size * 0.36), fontWeight: 800, color: "#fff",
          border: "3px solid var(--border)",
          opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s",
        }}>
          {fallback}
        </div>
      )}

      {/* Pencil badge */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        title="Change avatar"
        style={{
          position: "absolute", bottom: 2, right: 2,
          width: badgeSize, height: badgeSize, borderRadius: "50%",
          background: isPending ? "var(--subtle)" : "var(--accent)",
          border: "2px solid var(--card)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: isPending ? "not-allowed" : "pointer",
          padding: 0,
        }}
      >
        {isPending ? (
          <svg viewBox="0 0 24 24" width={pencilSize} height={pencilSize} fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width={pencilSize} height={pencilSize} fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        )}
      </button>

      {/* Error tooltip */}
      {error && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: "50%",
          transform: "translateX(-50%)",
          background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: 8, padding: "6px 10px",
          fontSize: 11, color: "var(--red)",
          whiteSpace: "nowrap", zIndex: 10,
        }}>
          {error}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
