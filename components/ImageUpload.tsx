"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImageIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The trigger button that opens the Cloudinary upload modal.
 * Place this in your action bar.
 */
export function ImageUploadButton({
  onChange,
  disabled,
}: {
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        maxFiles: 1,
        resourceType: "image",
        sources: ["local", "url", "camera"],
        clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif"],
      }}
      onSuccess={(result) => {
        if (typeof result.info === "object" && "secure_url" in result.info) {
          onChange(result.info.secure_url as string);
        }
      }}
    >
      {({ open }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => open()}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground"
        >
          <ImageIcon className="h-4 w-4" />
          Photo
        </Button>
      )}
    </CldUploadWidget>
  );
}

/**
 * Preview thumbnail with a remove button. Render this above the action bar
 * whenever there's an uploaded URL.
 */
export function ImagePreview({
  value,
  onRemove,
  disabled,
}: {
  value: string;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative inline-block mt-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={value}
        alt="Upload preview"
        className="max-h-48 rounded-lg border border-border object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="absolute -top-2 -right-2 rounded-full bg-black/80 hover:bg-black text-white p-1 disabled:opacity-50"
        aria-label="Remove image"
      >
        <XIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
