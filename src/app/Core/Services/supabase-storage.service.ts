import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface UploadResult {
  url: string;
  name: string;
}

const BUCKET = 'ticket-attachments';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Android WebView sometimes returns empty MIME type; validate by extension as fallback
const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'];

@Injectable({ providedIn: 'root' })
export class SupabaseStorageService {
  constructor(private supabase: SupabaseService) {}

  validate(file: File): string | null {
    if (file.size > MAX_BYTES) return `El archivo supera el límite de 5 MB.`;
    const ext = (file.name.split('.').pop() ?? '').toLowerCase();
    const typeOk = ALLOWED_TYPES.includes(file.type) || (file.type === '' && ALLOWED_EXTS.includes(ext));
    if (!typeOk) return `Tipo de archivo no permitido. Usa imágenes, PDF o Word.`;
    return null;
  }

  async upload(ticketId: string, file: File): Promise<UploadResult> {
    const ext = file.name.split('.').pop() ?? 'bin';
    const path = `${ticketId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await this.supabase.client.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(error.message);

    const { data } = this.supabase.client.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return { url: data.publicUrl, name: file.name };
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
