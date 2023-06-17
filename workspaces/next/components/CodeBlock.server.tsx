import hljs from "highlight.js";
// import "highlight.js/styles/github.css"; // Import your preferred style
import "highlight.js/styles/night-owl.css";
import { useEffect, useRef } from "react";

type CodeBlockProps = {
  code: string;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef && codeRef.current) {
      hljs.highlightBlock(codeRef.current);
    }
  }, []);

  return (
    <pre className="m-1">
      <code ref={codeRef}>{code}</code>
    </pre>
  );
};
