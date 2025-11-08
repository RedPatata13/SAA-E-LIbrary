import type { EBook } from './types';
// import { mockBooks } from './mockData';

const base = import.meta.env.VITE_LOCAL_API;

export default {
  async list(): Promise<EBook[]> {
    const res = await fetch(`${base}/files`);
    // const res = mockBooks;
    return res.json();
  },
  async upload(file: File): Promise<EBook> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${base}/upload`, { method: 'POST', body: form });
    return res.json();
  },
  async getDownloadUrl(key: string): Promise<string> {
    return `${base}/files/${encodeURIComponent(key)}`;
  },
};

