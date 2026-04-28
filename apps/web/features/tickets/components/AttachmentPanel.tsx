'use client';

import { useRef } from 'react';
import { Paperclip, Trash2, Upload } from 'lucide-react';
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '../hooks/useAttachments';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  ticketId: string;
}

export function AttachmentPanel({ ticketId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: attachments = [], isLoading } = useAttachments(ticketId);
  const { mutate: upload, isPending: isUploading } = useUploadAttachment(ticketId);
  const { mutate: remove } = useDeleteAttachment(ticketId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">
            Attachments
            {attachments.length > 0 && (
              <span className="ml-1.5 font-normal text-gray-400">{attachments.length}</span>
            )}
          </h2>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        >
          <Upload className="h-3 w-3" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip"
        />
      </div>

      {isLoading ? (
        <p className="text-sm italic text-gray-400">Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <p className="text-sm italic text-gray-400">No attachments yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {attachments.map((att) => (
            <li key={att.id} className="group flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <a
                href={`${API_URL}${att.url}`}
                download={att.filename}
                className="min-w-0 flex-1 truncate text-sm text-blue-600 hover:underline"
              >
                {att.filename}
              </a>
              <span className="shrink-0 text-xs text-gray-400">{formatBytes(att.size)}</span>
              <button
                onClick={() => remove(att.id)}
                aria-label="Delete attachment"
                className="shrink-0 text-gray-300 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
