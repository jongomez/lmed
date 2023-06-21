import { MainContext } from "@/components/MainProvider.client";
import {
  KeyboardShortcutAction,
  MainStateDispatch,
  SiteTheme,
} from "@/types/MainTypes";
import { useContext, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeysEvent } from "react-hotkeys-hook/dist/types";
import { Socket, io } from "socket.io-client";
import { WEBSOCKET_SERVER_PORT } from "../../../../shared/constants";
import { keyboardShortcutsHandler } from "../keyboardShortcutUtils";
import { defaultLayout, getLayoutFromLocalStorage } from "../layoutUtils";

type UseThemeReturnType = {
  siteTheme: SiteTheme;
  toggleSiteTheme: () => void;
};

export const useTheme = (): UseThemeReturnType => {
  const context = useContext(MainContext);

  if (context === undefined) {
    throw new Error("useToggleSiteTheme must be used within a MainProvider");
  }

  return {
    siteTheme: context.siteTheme,
    toggleSiteTheme: context.toggleSiteTheme,
  };
};

export const useFileEditorRef = (): UseThemeReturnType => {
  const context = useContext(MainContext);

  if (context === undefined) {
    throw new Error("useToggleSiteTheme must be used within a MainProvider");
  }

  return {
    siteTheme: context.siteTheme,
    toggleSiteTheme: context.toggleSiteTheme,
  };
};

export const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to the websocket server.
    const ioSocket = io(`http://localhost:${WEBSOCKET_SERVER_PORT}`);
    setSocket(ioSocket);

    return () => {
      ioSocket.disconnect();
    };
  }, []);

  return socket;
};

export const useStateFromLocalStorage = (
  mainStateDispatch: MainStateDispatch
) => {
  useEffect(() => {
    const localStorageLayout = getLayoutFromLocalStorage();

    mainStateDispatch({
      type: "SET_STATE_FROM_LOCAL_STORAGE",
      payload: { layout: localStorageLayout || defaultLayout },
    });
  }, [mainStateDispatch]);
};

export const useKeyboardShortcuts = (
  keyboardShortcuts: Record<KeyboardShortcutAction, string>,
  mainStateDispatch: MainStateDispatch
) => {
  useHotkeys(
    Object.values(keyboardShortcuts), // The shortcut keys to press are the values of keyboardShortcuts.
    (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
      // Every time a valid keyboard shortcut is pressed, this is called.
      keyboardShortcutsHandler(
        hotkeysEvent,
        keyboardShortcuts,
        mainStateDispatch
      );
    },
    [keyboardShortcuts]
  );
};
