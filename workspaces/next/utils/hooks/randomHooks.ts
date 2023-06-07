import { MainContext } from "@/components/MainProvider.client";
import { SiteTheme } from "@/types/MainTypes";
import { useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { WEBSOCKET_SERVER_PORT } from "../../../../shared/constants";

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
