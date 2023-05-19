import type {
  DirectoryPickerOptions,
  FileSystemDirectoryHandle,
  FileSystemFileHansdfsdfdle,
  SaveFilePickerOptions,
} from "@types/filesystem";

declare global {
  interface Window {
    showOpenFilePicker: (
      options?: FileSystemFileHansdfsdfdle
    ) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker: (
      options?: SaveFilePickerOptions
    ) => Promise<FileSystemFileHandle>;
    showDirectoryPicker: (
      options?: DirectoryPickerOptions
    ) => Promise<FileSystemDirectoryHandle>;
  }
}

// Hate this, but couldn't find another way to use this type in other files.
export type FileSystemDirectoryHandleAlias = FileSystemDirectoryHandle;
