import type { EBook } from './types';

const base = import.meta.env.VITE_AWS_API;

export default {
  async list(): Promise<EBook[]> {
    const res = await fetch(`${base}/files`);
    return res.json();
  },
  async upload(file: File): Promise<EBook> {
    const presign = await fetch(`${base}/presign-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, type: file.type }),
    });
    const { url, fields, key } = await presign.json();

    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, v as string));
    form.append('file', file);

    await fetch(url, { method: 'POST', body: form });
    return { id: key, title: file.name, size: file.size };
  },
  async getDownloadUrl(key: string): Promise<string> {
    const res = await fetch(`${base}/presign-get?key=${encodeURIComponent(key)}`);
    const { url } = await res.json();
    return url;
  },
};

