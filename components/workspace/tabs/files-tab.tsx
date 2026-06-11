"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buildFileTree } from "@/lib/project/files";
import { actionUpdateProjectFile } from "@/app/actions/files";
import type { BusinessResult, ProjectFile } from "@/types";
import JSZip from "jszip";

interface FilesTabProps {
  result: BusinessResult;
  projectId: string;
}

function FileIcon({ name }: { name: string }) {
  if (name.endsWith(".tsx") || name.endsWith(".ts")) return <span style={{ color: "hsl(213 94% 62%)", fontSize: "11px", fontWeight: 700 }}>TS</span>;
  if (name.endsWith(".md")) return <span style={{ color: "hsl(38 90% 55%)", fontSize: "11px", fontWeight: 700 }}>MD</span>;
  if (name.endsWith(".json")) return <span style={{ color: "hsl(151 60% 48%)", fontSize: "11px", fontWeight: 700 }}>JSON</span>;
  if (name.endsWith(".css")) return <span style={{ color: "hsl(280 70% 62%)", fontSize: "11px", fontWeight: 700 }}>CSS</span>;
  return <span style={{ color: "hsl(220 9% 40%)", fontSize: "11px", fontWeight: 700 }}>FILE</span>;
}

function FileEditor({
  file,
  projectId,
  onClose,
  onSaved,
}: {
  file: ProjectFile;
  projectId: string;
  onClose: () => void;
  onSaved: (path: string, content: string) => void;
}) {
  const [content, setContent] = useState(file.content);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const router = useRouter();
  const isDirty = content !== file.content;

  function handleDownload() {
    const ext = file.name.includes(".") ? "" : ".txt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name + ext;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    navigator.clipboard.writeText(content);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await actionUpdateProjectFile(projectId, file.path, content);
      if (result.success) {
        setSaveStatus("saved");
        onSaved(file.path, content);
        router.refresh();
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    });
  }

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl"
      style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 7%)", height: "100%", minHeight: 400 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ borderBottom: "1px solid hsl(220 13% 13%)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono" style={{ color: "hsl(220 9% 38%)" }}>{file.folder}/</span>
          <span className="text-xs font-mono font-semibold" style={{ color: "hsl(213 94% 65%)" }}>{file.name}</span>
          {isDirty && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(38 90% 55% / 0.1)", color: "hsl(38 90% 65%)", fontSize: "10px" }}
            >
              unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopy}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 48%)" }}
          >
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 48%)" }}
          >
            Download
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isPending}
            className="text-xs px-3 py-1 rounded font-semibold transition-colors"
            style={{
              backgroundColor: isDirty && !isPending ? "hsl(213 94% 62%)" : "hsl(220 13% 15%)",
              color: isDirty && !isPending ? "hsl(220 13% 8%)" : "hsl(220 9% 35%)",
              cursor: isDirty && !isPending ? "pointer" : "default",
            }}
          >
            {isPending ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "Error" : "Save"}
          </button>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded"
            style={{ backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 38%)" }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Editable content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-transparent resize-none outline-none px-4 py-4 text-xs leading-relaxed font-mono"
        style={{
          color: "hsl(220 9% 72%)",
          caretColor: "hsl(213 94% 62%)",
          minHeight: 0,
        }}
        spellCheck={false}
      />
    </div>
  );
}

export function FilesTab({ result, projectId }: FilesTabProps) {
  const [files, setFiles] = useState<ProjectFile[]>(result.projectFiles ?? []);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["research", "product", "website", "marketing"]),
  );

  function handleSaved(path: string, content: string) {
    setFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, content } : f)),
    );
    setSelectedFile((prev) =>
      prev && prev.path === path ? { ...prev, content } : prev,
    );
  }

  if (files.length === 0) {
    return (
      <div
        className="rounded-xl p-10 text-center"
        style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 9%)" }}
      >
        <p className="text-2xl mb-3">📁</p>
        <p className="text-sm font-medium mb-1" style={{ color: "hsl(220 9% 60%)" }}>No project files</p>
        <p className="text-xs" style={{ color: "hsl(220 9% 38%)" }}>
          This project was generated before the file system was added. New projects include 15+ organized files.
        </p>
      </div>
    );
  }

  const tree = buildFileTree(files);

  function toggleFolder(name: string) {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      const key = name.toLowerCase();
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  async function downloadAll() {
    const zip = new JSZip();
    for (const file of files) {
      // Strip leading slash so zip paths are relative: "website/app/page.tsx"
      const zipPath = file.path.replace(/^\//, "");
      zip.file(zipPath, file.content);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-${result.product.name.toLowerCase().replace(/\s+/g, "-")}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "hsl(220 9% 88%)" }}>Project Files</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 42%)" }}>
            {files.length} files across {tree.length} folders · click any file to edit
          </p>
        </div>
        <button
          onClick={downloadAll}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "hsl(213 94% 62% / 0.1)",
            border: "1px solid hsl(213 94% 62% / 0.2)",
            color: "hsl(213 94% 65%)",
          }}
        >
          Export ZIP →
        </button>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: selectedFile ? "220px 1fr" : "1fr" }}
      >
        {/* File tree */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 9%)" }}
        >
          {tree.map((folder) => {
            const folderKey = folder.name.toLowerCase();
            const isExpanded = expandedFolders.has(folderKey);

            return (
              <div key={folder.name}>
                <button
                  onClick={() => toggleFolder(folder.name)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                  style={{ borderBottom: "1px solid hsl(220 13% 13%)" }}
                >
                  <svg
                    width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                    style={{
                      color: "hsl(220 9% 35%)",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.15s",
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  <span className="text-sm">{folder.icon}</span>
                  <span className="text-xs font-semibold flex-1" style={{ color: "hsl(220 9% 65%)" }}>{folder.name}</span>
                  <span className="text-xs" style={{ color: "hsl(220 9% 32%)" }}>{folder.files.length}</span>
                </button>

                {isExpanded && folder.files.map((file) => {
                  const isSelected = selectedFile?.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(isSelected ? null : file)}
                      className="w-full flex items-center gap-2.5 pl-8 pr-3 py-1.5 text-left transition-colors"
                      style={{
                        backgroundColor: isSelected ? "hsl(213 94% 62% / 0.08)" : "transparent",
                        borderBottom: "1px solid hsl(220 13% 11%)",
                      }}
                    >
                      <div className="w-8 shrink-0 flex items-center">
                        <FileIcon name={file.name} />
                      </div>
                      <span
                        className="text-xs font-mono truncate flex-1"
                        style={{ color: isSelected ? "hsl(213 94% 65%)" : "hsl(220 9% 55%)" }}
                      >
                        {file.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Editor */}
        {selectedFile && (
          <FileEditor
            file={selectedFile}
            projectId={projectId}
            onClose={() => setSelectedFile(null)}
            onSaved={handleSaved}
          />
        )}
      </div>
    </div>
  );
}
