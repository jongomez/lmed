import { P } from "../base/Typography.server";

type TerminalNotAvailableProps = {
  isSocketConnected: boolean;
  isDevelopment: boolean;
  isTerminalActive: boolean;
  isTerminalMode: boolean;
};

export const TerminalNotAvailable = ({
  isTerminalActive,
  isSocketConnected,
  isDevelopment,
  isTerminalMode,
}: TerminalNotAvailableProps) => {
  if (!isTerminalActive) {
    return null;
  }

  return (
    <div className="flex justify-center items-center flex-col">
      <P>Could not load terminal :(</P>
      {!isDevelopment && <P>Terminal is only available locally.</P>}

      {!isTerminalMode && (
        <P>
          Be sure to use &quot;yarn dev-terminal&quot; instead of &quot;yarn
          dev&quot;
        </P>
      )}

      {!isSocketConnected && (
        <P>Also be sure to install node-pty (optional dependency)</P>
      )}
    </div>
  );
};
