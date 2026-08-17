import { useTranslation } from "../hooks/useTranslation"

export function IframeView({ name, url }: { name: string; url: string }) {
  const { t } = useTranslation()

  if (!url.trim()) {
    return (
      <div
        className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm"
        style={{ borderColor: "var(--seam)", color: "var(--ash-dim)" }}
      >
        {t("iframe.noUrl")}
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--seam)", background: "#000" }}
    >
      <iframe
        src={url}
        title={name}
        className="block w-full border-0"
        style={{ height: "calc(100svh - 220px)", minHeight: 420 }}
        allow="autoplay; fullscreen; camera; microphone"
      />
    </div>
  )
}
