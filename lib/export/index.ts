// Asset export system.
// MD and JSON work now. PDF and DOCX are stubbed for future implementation.
// AI INTEGRATION POINT: PDF via @react-pdf/renderer or puppeteer; DOCX via docx library.

import type { GeneratedAsset, ExportFormat } from "@/lib/assets/types";

export interface ExportResult {
  content: string;
  mimeType: string;
  filename: string;
  supported: boolean;
}

export function exportAsset(asset: GeneratedAsset, format: ExportFormat): ExportResult {
  const slug = asset.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  switch (format) {
    case "markdown":
      return {
        content: asset.content,
        mimeType: "text/markdown",
        filename: `${slug}.md`,
        supported: true,
      };

    case "json":
      return {
        content: JSON.stringify(
          {
            id: asset.id,
            name: asset.name,
            type: asset.type,
            category: asset.category,
            description: asset.description,
            wordCount: asset.wordCount,
            estimatedPages: asset.estimatedPages,
            content: asset.content,
            exportedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
        mimeType: "application/json",
        filename: `${slug}.json`,
        supported: true,
      };

    case "pdf":
      // AI INTEGRATION POINT: Generate PDF server-side via puppeteer or react-pdf
      return {
        content: "",
        mimeType: "application/pdf",
        filename: `${slug}.pdf`,
        supported: false,
      };

    case "docx":
      // AI INTEGRATION POINT: Generate DOCX via the 'docx' npm package
      return {
        content: "",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename: `${slug}.docx`,
        supported: false,
      };
  }
}

// Client-side trigger — call this in a client component to download the file.
export function triggerDownload(result: ExportResult): void {
  if (!result.supported || typeof window === "undefined") return;
  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
