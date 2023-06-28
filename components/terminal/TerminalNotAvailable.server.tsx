import { A } from "../base/Links.server";
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

      {isDevelopment && !isTerminalMode && (
        <>
          <P>
            Be sure to run &quot;yarn dev-terminal&quot; instead of &quot;yarn
            dev&quot;
          </P>
        </>
      )}

      {isDevelopment && !isSocketConnected && (
        <>
          <P>
            The terminal dependencies can be installed with &quot;yarn
            terminal-install&quot;
          </P>
          <P>
            You may also need to{" "}
            <A
              href="https://github.com/microsoft/node-pty#dependencies"
              target="_blank"
              className="underline"
            >
              install node-pty&apos;s dependencies.
            </A>
          </P>
        </>
      )}
    </div>
  );
};
