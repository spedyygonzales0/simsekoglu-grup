"use client";

import Image from "next/image";
import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient, getSupabaseConfigWarning } from "@/lib/supabase/client";

interface MediaUploaderProps {
  entitySlug: string;
  value: string[];
  onChange: (urls: string[]) => void;
  folderPrefix?: "fleet" | "construction" | "architecture";
  title?: string;
}

const ACCEPTED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_FILE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extensionFromFile(file: File): string {
  const nameParts = file.name.split(".");
  const ext = nameParts.length > 1 ? nameParts.pop() : "";
  return ext ? `.${sanitizeSegment(ext)}` : ".jpg";
}

export function MediaUploader({
  entitySlug,
  value,
  onChange,
  folderPrefix = "fleet",
  title = "Gorselleri Yukle"
}: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const warningMessage = getSupabaseConfigWarning();
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET?.trim() || "media";

  const fileNames = useMemo(() => pendingFiles.map((file) => file.name), [pendingFiles]);

  const validateFiles = (files: File[]): File[] => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!ACCEPTED_MIME.includes(file.type)) {
        errors.push(`${file.name}: desteklenmeyen dosya turu`);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        errors.push(`${file.name}: ${MAX_SIZE_MB}MB siniri asildi`);
        return;
      }
      valid.push(file);
    });

    if (errors.length) {
      setMessage(errors.join(" | "));
    } else {
      setMessage(valid.length ? `${valid.length} dosya secildi.` : "");
    }

    return valid;
  };

  const handleFileSelection = (files: File[]) => {
    const valid = validateFiles(files);
    setPendingFiles(valid);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(Array.from(event.target.files || []));
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFileSelection(Array.from(event.dataTransfer.files || []));
  };

  const uploadFiles = async () => {
    if (warningMessage) {
      setMessage(warningMessage);
      return;
    }
    if (!pendingFiles.length) {
      setMessage("Lutfen once gorsel secin.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase baglantisi kurulamadi.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setMessage("Gorseller yukleniyor...");
      const safeSlug = sanitizeSegment(entitySlug) || "genel-medya";
      const uploadedUrls: string[] = [];

      for (let index = 0; index < pendingFiles.length; index += 1) {
        const file = pendingFiles[index];
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extensionFromFile(file)}`;
        const storagePath = `${folderPrefix}/${safeSlug}/${fileName}`;

        const { error } = await supabase.storage.from(bucketName).upload(storagePath, file, { upsert: true });
        if (error) throw error;

        const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
        if (data?.publicUrl) uploadedUrls.push(data.publicUrl);

        const nextPercent = Math.round(((index + 1) / pendingFiles.length) * 100);
        setUploadProgress(nextPercent);
      }

      const merged = Array.from(new Set([...(value || []), ...uploadedUrls].filter(Boolean)));
      onChange(merged);
      setSelectedForDelete([]);
      setPendingFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessage(`${uploadedUrls.length} gorsel yuklendi.`);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Yukleme sirasinda hata olustu.";
      setMessage(text);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (url: string) => {
    onChange((value || []).filter((item) => item !== url));
    setSelectedForDelete((prev) => prev.filter((item) => item !== url));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const current = [...(value || [])];
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= current.length) return;
    [current[index], current[target]] = [current[target], current[index]];
    onChange(current);
  };

  const toggleSelection = (url: string) => {
    setSelectedForDelete((prev) => (prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]));
  };

  const removeSelectedImages = () => {
    if (!selectedForDelete.length) return;
    onChange((value || []).filter((item) => !selectedForDelete.includes(item)));
    setSelectedForDelete([]);
  };

  const reverseOrder = () => {
    onChange([...(value || [])].reverse());
  };

  const clearAll = () => {
    onChange([]);
    setSelectedForDelete([]);
  };

  return (
    <div className="space-y-4 rounded-xl border border-navy-900/10 bg-white p-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed p-5 text-center transition ${
          isDragOver ? "border-gold-500 bg-gold-50" : "border-navy-900/20 bg-cloud-50"
        }`}
      >
        <p className="text-sm font-semibold text-navy-900">{title}</p>
        <p className="mt-1 text-xs text-navy-900/65">Desteklenen formatlar: JPG, JPEG, PNG, WEBP</p>
        <p className="text-xs text-navy-900/65">Maksimum dosya boyutu: {MAX_SIZE_MB}MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {warningMessage ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">{warningMessage}</p>
      ) : null}

      {fileNames.length ? (
        <p className="text-xs text-navy-900/70">Secilen dosyalar: {fileNames.join(", ")}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={uploadFiles}
          disabled={uploading || !pendingFiles.length || Boolean(warningMessage)}
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {uploading ? "Yukleniyor..." : "Gorselleri Yukle"}
        </button>
        {uploading ? (
          <div className="w-full max-w-xs rounded-lg border border-gold-300/40 bg-gold-50 p-2">
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-navy-900/75">
              <span>Yukleme</span>
              <span>%{uploadProgress}</span>
            </div>
            <div className="h-3 rounded-full bg-cloud-100">
              <div className="h-3 rounded-full bg-gold-500 transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : null}
      </div>

      {message ? <p className="text-xs font-medium text-navy-900/80">{message}</p> : null}

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.1em] text-navy-900/60">Yuklenen Gorseller</p>
        {(value || []).length ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={removeSelectedImages}
              disabled={!selectedForDelete.length}
              className="rounded border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Secilenleri Sil ({selectedForDelete.length})
            </button>
            <button
              type="button"
              onClick={reverseOrder}
              className="rounded border border-navy-900/20 px-2.5 py-1 text-xs font-semibold text-navy-900"
            >
              Sirayi Ters Cevir
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-600"
            >
              Tumunu Temizle
            </button>
          </div>
        ) : null}
        {(value || []).length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {value.map((url, index) => (
              <div key={`${url}-${index}`} className="rounded-lg border border-navy-900/10 bg-cloud-50 p-2">
                <label className="mb-2 flex items-center gap-2 text-[11px] font-medium text-navy-900/70">
                  <input
                    type="checkbox"
                    checked={selectedForDelete.includes(url)}
                    onChange={() => toggleSelection(url)}
                  />
                  Sec
                </label>
                <div className="relative h-24 overflow-hidden rounded-md border border-navy-900/10 bg-white">
                  <Image src={url} alt={`Gorsel ${index + 1}`} fill sizes="240px" className="object-contain" />
                </div>
                <p className="mt-2 truncate text-[11px] text-navy-900/70">{url}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, "left")}
                    className="rounded border border-navy-900/20 px-2 py-1 text-xs text-navy-900"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, "right")}
                    className="rounded border border-navy-900/20 px-2 py-1 text-xs text-navy-900"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-navy-900/60">Henuz yuklenen gorsel yok.</p>
        )}
      </div>
    </div>
  );
}
