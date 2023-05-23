// Creating an "in-memory" file. This file won't exist on the disk until it's saved.

import type { FileNode } from "@/types/MainTypes";

export const createEmptyFileInMemory = (
  id: number,
  fileName = "New File"
): FileNode => {
  const emptyFile: FileNode = {
    id,
    name: fileName,
    type: "file",
    selected: true,
    file: new File([""], fileName, {
      type: "text/plain",
    }),
  };

  return emptyFile;
};
