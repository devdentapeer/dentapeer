"use client";
import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadForm({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Dosya başarıyla yüklendi!");
        onUploadComplete?.(data.url);
        setUploadProgress(100);
      } else {
        throw new Error(data.error || "Yükleme başarısız!");
      }
    } catch (error) {
      toast.error(error.message || "Sunucu hatası!");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div
        onClick={handleButtonClick}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-gray-200",
          "hover:border-primary hover:bg-primary/5"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <FileIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">{file.name}</span>
              <span className="text-xs text-gray-400">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-500">
              Dosyayı sürükleyip bırakın veya tıklayarak seçin
            </p>
            <p className="text-xs text-gray-400">
              Tüm dosya formatları desteklenir
            </p>
          </div>
        )}
      </div>

      {file && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <div className="flex items-center space-x-2">
              <span className="animate-spin">⏳</span>
              <span>Yükleniyor... {uploadProgress}%</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Dosyayı Yükle</span>
            </div>
          )}
        </Button>
      )}
    </div>
  );
}
