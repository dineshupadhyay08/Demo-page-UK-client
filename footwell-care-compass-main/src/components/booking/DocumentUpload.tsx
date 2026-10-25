import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { ActionButton } from "@/components/shared/ActionButton";

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

const ACCEPTED_DOCUMENT_TYPES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  jpg: ["image/jpeg", "image/jpg"],
  jpeg: ["image/jpeg", "image/jpg"],
  png: ["image/png"],
};

type DocumentUploadProps = {
  documents: File[];
  onChange: (documents: File[]) => void;
};

function getDocumentType(file: File) {
  return file.name.split(".").pop()?.toUpperCase() ?? "Document";
}

function getDocumentSize(size: number) {
  return size < 1024 * 1024
    ? `${Math.round(size / 1024)} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUpload({ documents, onChange }: DocumentUploadProps) {
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addDocuments = (files: FileList | File[]) => {
    const validDocuments: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (
        !extension ||
        !ACCEPTED_DOCUMENT_TYPES[extension] ||
        (file.type && !ACCEPTED_DOCUMENT_TYPES[extension].includes(file.type))
      ) {
        errors.push(`${file.name}: PDF, JPG, JPEG and PNG files are supported.`);
      } else if (file.size > MAX_DOCUMENT_SIZE) {
        errors.push(`${file.name}: files must be 10 MB or smaller.`);
      } else {
        validDocuments.push(file);
      }
    });

    if (validDocuments.length) onChange([...documents, ...validDocuments]);
    setError(errors.join(" "));
  };

  return (
    <section className="rounded-xl border p-4" aria-labelledby="supporting-documents-heading">
      <h3 id="supporting-documents-heading" className="text-sm font-semibold">
        Supporting Documents
      </h3>
      <p id="supporting-documents-help" className="mt-1 text-sm text-muted-foreground">
        Upload any relevant medical documents to help your podiatrist prepare for your appointment.
        This is optional.
      </p>
      <div
        className={`mt-3 rounded-xl border border-dashed p-4 text-center transition-colors ${isDragging ? "border-accent bg-secondary" : "border-border"}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addDocuments(event.dataTransfer.files);
        }}
        aria-describedby="supporting-documents-help"
      >
        <Upload className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium">Drag and drop documents here</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, JPG, JPEG or PNG · up to 10 MB per file
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="sr-only"
          aria-describedby="supporting-documents-help"
          onChange={(event) => {
            if (event.target.files) addDocuments(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        <ActionButton
          type="button"
          variant="outline"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
        >
          Choose Files
        </ActionButton>
      </div>
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {documents.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Selected documents">
          {documents.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="flex items-center gap-3 rounded-lg bg-secondary p-3 text-sm"
            >
              <FileText className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 break-all">
                <span className="block font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {getDocumentType(file)} · {getDocumentSize(file.size)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onChange(documents.filter((_, itemIndex) => itemIndex !== index))}
                className="min-h-11 rounded-full px-3 text-sm font-medium text-heading hover:bg-background"
                aria-label={`Remove ${file.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
