// TODO:
/*
async function selectPromptSuggestion(
  context: CompletionContext
): Promise<CompletionResult | null> {
  // Send the line of code before the cursor to OpenAI API
  const lineBeforeCursor = context.state.doc.lineAt(context.pos).text;
  const completions = await sendHttpRequestToOpenAI(lineBeforeCursor);

  // Check if there are any completions
  if (completions.length === 0) {
    return null;
  }

  // Format completions for CodeMirror
  const formattedCompletions: Completion[] = completions.map((completion) => ({
    label: completion,
    apply: completion, // Replace the text with completion text
  }));

  return {
    from: context.pos - lineBeforeCursor.length,
    to: context.pos,
    options: formattedCompletions,
  };
}

// You then need to add this to the codemirror extensions prop:
    extensions={[..., autocomplete({override: selectPromptSuggestion})],

*/
