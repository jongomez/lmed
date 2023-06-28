import Home from "@/app/page";
import { MainProvider } from "@/components/MainProvider.client";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom";

import { fireEvent, render, waitFor } from "@testing-library/react";

type MockFilePickingResult = {
  file: File;
  fileHandle: FileSystemFileHandle;
};

const mockFilePicking = (
  fileContents: string,
  filename: string
): MockFilePickingResult => {
  const fileBlob = new Blob([fileContents], { type: "text/plain" });
  const file = new File([fileBlob], filename);
  file.text = () => Promise.resolve(fileContents);

  const fileHandle = {
    kind: "file",
    getFile: () => {
      return Promise.resolve(file);
    },
  } as FileSystemFileHandle;

  window.showOpenFilePicker = (): Promise<[FileSystemFileHandle]> => {
    return Promise.resolve([fileHandle]);
  };

  return { file, fileHandle };
};

describe.only("open file", () => {
  it("should open a file", async () => {
    const fileContents = "Hello World!";
    const filename = "test.txt";

    mockFilePicking(fileContents, filename);

    const { getByTestId } = render(
      <MainProvider>
        <Home />
      </MainProvider>
    );

    const mainHeader = getByTestId("main-header");
    expect(mainHeader).toBeInTheDocument();

    const mainMenuButton = getByTestId("main-menu");

    // Simulate a click on the main menu.
    fireEvent.click(mainMenuButton);

    const openFileOption = getByTestId("open-file");

    // Simulate a click on the open file option.
    fireEvent.click(openFileOption);

    // Wait for mockDispatch to be called with the expected action.
    await waitFor(() => {
      // Check if a new tab has been created and is being displayed with the correct content.
      const tabs = screen.getAllByRole("file-tab");

      expect(tabs.length).toBe(2);
      expect(tabs[1].textContent).toBe(filename);
    });
  });
});
