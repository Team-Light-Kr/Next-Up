"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  aspect?: "square" | "cover" | "avatar";
  helpText?: string;
  maxDimension?: number;
}

export default function ImageUploadInput({
  label,
  value,
  onChange,
  aspect = "square",
  helpText,
  maxDimension = 800,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize image with canvas to keep size optimized
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          onChange(compressedDataUrl);
        } else {
          onChange(event.target?.result as string);
        }
        setIsProcessing(false);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected if needed
    e.target.value = "";
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] font-medium text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>이미지 삭제</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative group rounded-xl border border-slate-200 bg-slate-50 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors ${
            aspect === "cover"
              ? "h-36 sm:h-44 w-full"
              : aspect === "avatar"
              ? "w-24 h-24 rounded-full"
              : "w-24 h-24 sm:w-28 sm:h-28"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className={`w-full h-full object-cover ${
              aspect === "avatar" ? "rounded-full" : ""
            }`}
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
            <Upload className="w-4 h-4" />
            <span>파일 변경</span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-colors flex flex-col items-center justify-center p-4 cursor-pointer text-center ${
            aspect === "cover" ? "h-32 sm:h-36 w-full" : "w-full max-w-xs py-5"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-500 mb-2">
            {isProcessing ? (
              <span className="text-xs">처리중</span>
            ) : (
              <Upload className="w-4.5 h-4.5 text-blue-600" />
            )}
          </div>
          <span className="text-xs font-semibold text-slate-700">
            클릭하여 이미지 파일 선택
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            PNG, JPG, WEBP 지원
          </span>
        </div>
      )}

      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}
    </div>
  );
}
