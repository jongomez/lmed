import {
  DirectoryPickerOptions,
  FileSystemDirectoryHandle,
  FileSystemFileHandle,
  OpenFilePickerOptions,
  SaveFilePickerOptions,
} from "@types/filesystem";

declare global {
  interface Window {
    showOpenFilePicker: (
      options?: OpenFilePickerOptions
    ) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker: (
      options?: SaveFilePickerOptions
    ) => Promise<FileSystemFileHandle>;
    showDirectoryPicker: (
      options?: DirectoryPickerOptions
    ) => Promise<FileSystemDirectoryHandle>;
  }
}
