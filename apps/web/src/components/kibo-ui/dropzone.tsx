import * as React from "react";
import { cn } from "@/lib/utils";
import { UploadCloud } from "lucide-react";

export interface DropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileDrop?: (files: FileList) => void;
  acceptedTypes?: string;
  label?: string;
  sublabel?: string;
}

export const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  (
    {
      className,
      onFileDrop,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
      acceptedTypes = ".pdf,.jpg,.png,.csv",
      label = "Drop inspection documents or DLD files here",
      sublabel = "Supports PDF, CSV, PNG up to 20MB",
      children,
      ...props
    },
    ref
  ) => {
    const [isDragOver, setIsDragOver] = React.useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files && onFileDrop) {
        onFileDrop(e.dataTransfer.files);
      }
    };

    return (
      <div
        ref={ref}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer select-none",
          isDragOver
            ? "border-brand bg-brand-soft/40 shadow-subtle"
            : "border-border bg-surface hover:border-brand/50 hover:bg-surface-subtle",
          className
        )}
        {...props}
      >
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <UploadCloud className="size-6" />
        </div>
        <h4 className="font-semibold text-sm text-ink">{label}</h4>
        <p className="mt-1 text-xs text-muted">{sublabel}</p>
        {children}
      </div>
    );
  }
);
Dropzone.displayName = "Dropzone";
