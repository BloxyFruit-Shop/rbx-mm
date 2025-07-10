import { toast } from "sonner";
import { useUploadThing } from "~/lib/uploadthing";

type Input = Parameters<typeof useUploadThing>;

const useUploadThingInputProps = (...args: Input) => {
  const $ut = useUploadThing(...args);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const result = await $ut.startUpload(selectedFiles);

    console.log("uploaded files", result);
  };

  return {
    inputProps: {
      onChange,
      accept: "image/jpeg,image/png,image/webp",
    },
    isUploading: $ut.isUploading,
  };
};

function UploadSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="white"
      className="inline transition-opacity size-8 group-hover:opacity-80"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function LoadSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="white"
      className="size-6 animate-spin opacity-80"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

interface UploadButtonProps {
  onComplete: () => void;
}

export default function UploadButton({ onComplete }: UploadButtonProps) {
  const { inputProps, isUploading } = useUploadThingInputProps("itemImageUpload", {
    onUploadError: (e) => {
      const errorMessage = e.message == "Invalid config: InvalidFileType" ? "Select a valid Markdown file." : e.message; // Hardcoded for now. Research and improve this.
      toast.error("Upload failed. " + errorMessage);
    },
    onUploadBegin: () => {
      toast.loading("File uploading, please wait...", {
        id: "loading-toast",
      });
    },
    onClientUploadComplete: () => {
      toast.dismiss("loading-toast");
      toast.success("File uploaded successfully!");
      onComplete();
    },
  });

  return (
    <div className="flex items-center justify-center gap-2">
      <label
        htmlFor="upload-button"
        className={
          "flex w-full flex-col items-center gap-2 rounded-lg border border-slate-200/40 bg-slate-400/10 p-8 transition-colors duration-200 hover:bg-slate-200/10 " +
          (isUploading ? "cursor-progress" : "group cursor-pointer")
        }
      >
        {isUploading ? <LoadSvg /> : <UploadSvg />}
        <span className="text-sm text-slate-300">Select a markdown file</span>
      </label>
      <input
        {...inputProps}
        id="upload-button"
        type="file"
        className="sr-only"
      />
    </div>
  );
}
