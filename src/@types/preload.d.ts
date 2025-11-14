export {};

declare global {
  interface Window {
    electronAPI: {
      updateReadingHistory: (data: {
        userId: string;
        bookId: string;
        pageNumber: number;
        totalPages: number;
        title: string;
        author: string;
        publisher: string;
      }) => Promise<any>;
    };
  }
}
