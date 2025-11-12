import type { History, EBook, User } from "./services/types";

export {};

declare global {
  interface Window {
    dbAPI: {
      updateReadingStatus: ({bookId: string, userId: string, page: number}) => Promise<{ success: boolean; message: string}>;
      addUser: (user: {
        uid: string;
        username: string;
        passwordHash: string;
        isVerified: boolean;
        temporaryPass: string | null;
        temporaryPassExpirationDate: string | null;
      }) => Promise<void>;
      loaded: boolean;
      // ping: () => Promise<any>;

      verifyUser: (
        username: string,
        password: string
      ) => Promise<
        | { success: true; user: { uid: string; username: string; isVerified: boolean } }
        | { success: false; message: string }
      >;

      loginUser: (
        username: string,
        passwordHash: string
      ) => Promise<
        | { success: true; user: User;}
        | { success: false; message: string }
      >;

      uploadEbook: (ebookData: EbookUploadDTO) => Promise<
        { success: true; ebook: EBook } | 
        { success: false; message: string }
      >;
      
      getEbooks: () => Promise<EBook[]>;
      copyFileToAppData: (sourcePath: string, destinationFilename: string) => Promise<{ success: boolean; destinationPath?: string; error?: string }>;
      removeEbook: (bookId: string) => Promise<{ success: boolean; message: string }>;
      showFileDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      logoutUser: () => Promise<{ success: boolean }>;
      getCurrentUser: () => Promise<User | null>;
      getUsers?: () => Promise<User[]>;
      addBook?: (book: EBook) => Promise<void>;
      updateEbook: (book: Ebook) => Promise<{ success: true; ebook: Ebook } | { success: false; message: string}> 
      addCollection?: (collection: History) => Promise<void>;

      updateUsername: (uid: string, newUsername: string) => Promise<{ success: boolean; message?: string }>;
      requestPasswordReset: (username: string) => Promise<{ success: boolean; message?: string }>;
      deactivateAccount: (uid: string) => Promise<{ success: boolean; message?: string }>;
      changePassword: (uid: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
    };
  }
}
interface EbookUploadDTO {
  title: string;
  author: string;
  publisher: string;
  doi?: string;
  filePath: string; // Change from File to string path
  fileName: string;
  fileSize: number;
}