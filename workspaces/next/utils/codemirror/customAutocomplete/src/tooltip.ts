import { EditorState, StateField } from "@codemirror/state";
import {
  EditorView,
  Rect,
  TooltipView,
  ViewUpdate,
  logException,
} from "@codemirror/view";
import {
  Completion,
  CompletionInfo,
  Option,
  closeCompletionEffect,
} from "./completion";
import { CompletionConfig, completionConfig } from "./config";
import { CompletionState } from "./state";

type OptionContentSource = (
  completion: Completion,
  state: EditorState,
  match: readonly number[]
) => Node | null;

function optionContent(
  config: Required<CompletionConfig>
): OptionContentSource[] {
  let content = config.addToOptions.slice() as {
    render: OptionContentSource;
    position: number;
  }[];
  if (config.icons)
    content.push({
      render(completion: Completion) {
        let icon = document.createElement("div");
        icon.classList.add("cm-completionIcon");
        if (completion.type)
          icon.classList.add(
            ...completion.type
              .split(/\s+/g)
              .map((cls) => "cm-completionIcon-" + cls)
          );
        icon.setAttribute("aria-hidden", "true");
        return icon;
      },
      position: 20,
    });

  // This was modified to allow multi line labels on the completion list.
  content.push(
    {
      // This `render` function takes three parameters:
      // `completion` - the actual auto-completion data,
      // `_s` - the EditorState, and
      // `match` - an array of numbers indicating parts of the completion that match the user's input.
      render(
        completion: Completion,
        _s: EditorState,
        match: readonly number[]
      ) {
        // A div container for the label of the completion is created.
        let labelContainer = document.createElement("div");
        labelContainer.className = "cm-completionLabelContainer";

        // The label is the complete text for the completion. This can have multiple lines.
        let { label } = completion;

        // The label can have multiple lines. If it does, separate them.
        let lines = label.split("\n");

        // For each line of the label, create a div with 1 or more child spans.
        // The different spans represent the matched and unmatched parts of the text (aka label).
        lines.forEach((line: string) => {
          let labelElt = document.createElement("div");
          labelElt.className = "cm-completionLabel";

          // Handle empty lines and lines with spaces at the beginning.
          // "\u00A0" is a non-breaking space. I tried using "&nbsp;" but createTextNode literally printed "&nbsp;".
          if (line.trim().length === 0) {
            line = "\u00A0";
          } else if (line[0] === " ") {
            const leadingSpacesCount = line.search(/\S|$/);
            line = "\u00A0".repeat(leadingSpacesCount) + line.trim();
          }

          let off = 0;
          for (let j = 1; j < match.length; ) {
            let from = match[j++],
              to = match[j++];

            if (from > off)
              labelElt.appendChild(
                document.createTextNode(line.slice(off, from))
              );

            let span = labelElt.appendChild(document.createElement("span"));
            span.appendChild(document.createTextNode(line.slice(from, to)));
            span.className = "cm-completionMatchedText";
            off = to;
          }

          if (off < line.length)
            labelElt.appendChild(document.createTextNode(line.slice(off)));

          labelContainer.appendChild(labelElt);
        });

        return labelContainer;
      },
      // The position of this element in the `content` array is defined as 50.
      position: 50,
    },
    {
      render(completion: Completion) {
        if (!completion.detail) return null;
        let detailElt = document.createElement("span");
        detailElt.className = "cm-completionDetail";
        detailElt.textContent = completion.detail;
        return detailElt;
      },
      position: 80,
    }
  );
  return content.sort((a, b) => a.position - b.position).map((a) => a.render);
}

function rangeAroundSelected(total: number, selected: number, max: number) {
  if (total <= max) return { from: 0, to: total };
  if (selected < 0) selected = 0;
  if (selected <= total >> 1) {
    let off = Math.floor(selected / max);
    return { from: off * max, to: (off + 1) * max };
  }
  let off = Math.floor((total - selected) / max);
  return { from: total - (off + 1) * max, to: total - off * max };
}

class CompletionTooltip {
  dom: HTMLElement;
  info: HTMLElement | null = null;
  infoDestroy: (() => void) | null = null;
  list: HTMLElement;
  placeInfoReq = {
    read: () => this.measureInfo(),
    write: (pos: { style?: string; class?: string } | null) =>
      this.placeInfo(pos),
    key: this,
  };
  range: { from: number; to: number };
  space: Rect | null = null;
  optionContent: OptionContentSource[];
  tooltipClass: (state: EditorState) => string;
  currentClass = "";
  optionClass: (option: Completion) => string;

  constructor(
    readonly view: EditorView,
    readonly stateField: StateField<CompletionState>,
    readonly applyCompletion: (view: EditorView, option: Option) => void
  ) {
    let cState = view.state.field(stateField);
    let { options, selected } = cState.open!;
    let config = view.state.facet(completionConfig);
    this.optionContent = optionContent(config);
    this.optionClass = config.optionClass;
    this.tooltipClass = config.tooltipClass;

    this.range = rangeAroundSelected(
      options.length,
      selected,
      config.maxRenderedOptions
    );

    this.dom = document.createElement("div");
    this.dom.className = "cm-tooltip-autocomplete";
    this.updateTooltipClass(view.state);
    this.dom.addEventListener("mousedown", (e: MouseEvent) => {
      for (
        let dom = e.target as HTMLElement | null, match;
        dom && dom != this.dom;
        dom = dom.parentNode as HTMLElement
      ) {
        if (
          dom.nodeName == "LI" &&
          (match = /-(\d+)$/.exec(dom.id)) &&
          +match[1] < options.length
        ) {
          this.applyCompletion(view, options[+match[1]]);
          e.preventDefault();
          return;
        }
      }
    });
    this.dom.addEventListener("focusout", (e: FocusEvent) => {
      let state = view.state.field(this.stateField, false);
      if (
        state &&
        state.tooltip &&
        view.state.facet(completionConfig).closeOnBlur &&
        e.relatedTarget != view.contentDOM
      )
        view.dispatch({ effects: closeCompletionEffect.of(null) });
    });
    this.list = this.dom.appendChild(
      this.createListBox(options, cState.id, this.range)
    );
    this.list.addEventListener("scroll", () => {
      if (this.info) this.view.requestMeasure(this.placeInfoReq);
    });
  }

  mount() {
    this.updateSel();
  }

  update(update: ViewUpdate) {
    let cState = update.state.field(this.stateField);
    let prevState = update.startState.field(this.stateField);
    this.updateTooltipClass(update.state);
    if (cState != prevState) {
      this.updateSel();
      if (cState.open?.disabled != prevState.open?.disabled)
        this.dom.classList.toggle(
          "cm-tooltip-autocomplete-disabled",
          !!cState.open?.disabled
        );
    }
  }

  updateTooltipClass(state: EditorState) {
    let cls = this.tooltipClass(state);
    if (cls != this.currentClass) {
      for (let c of this.currentClass.split(" "))
        if (c) this.dom.classList.remove(c);
      for (let c of cls.split(" ")) if (c) this.dom.classList.add(c);
      this.currentClass = cls;
    }
  }

  positioned(space: Rect) {
    this.space = space;
    if (this.info) this.view.requestMeasure(this.placeInfoReq);
  }

  updateSel() {
    let cState = this.view.state.field(this.stateField),
      open = cState.open!;
    if (
      (open.selected > -1 && open.selected < this.range.from) ||
      open.selected >= this.range.to
    ) {
      this.range = rangeAroundSelected(
        open.options.length,
        open.selected,
        this.view.state.facet(completionConfig).maxRenderedOptions
      );
      this.list.remove();
      this.list = this.dom.appendChild(
        this.createListBox(open.options, cState.id, this.range)
      );
      this.list.addEventListener("scroll", () => {
        if (this.info) this.view.requestMeasure(this.placeInfoReq);
      });
    }
    if (this.updateSelectedOption(open.selected)) {
      this.destroyInfo();
      let { completion } = open.options[open.selected];
      let { info } = completion;
      if (!info) return;
      let infoResult =
        typeof info === "string"
          ? document.createTextNode(info)
          : info(completion);
      if (!infoResult) return;
      if ("then" in infoResult) {
        infoResult
          .then((obj) => {
            if (obj && this.view.state.field(this.stateField, false) == cState)
              this.addInfoPane(obj, completion);
          })
          .catch((e) => logException(this.view.state, e, "completion info"));
      } else {
        this.addInfoPane(infoResult, completion);
      }
    }
  }

  addInfoPane(content: NonNullable<CompletionInfo>, completion: Completion) {
    this.destroyInfo();
    let wrap = (this.info = document.createElement("div"));
    wrap.className = "cm-tooltip cm-completionInfo";
    if ((content as Node).nodeType != null) {
      wrap.appendChild(content as Node);
      this.infoDestroy = null;
    } else {
      let { dom, destroy } = content as { dom: Node; destroy?(): void };
      wrap.appendChild(dom);
      this.infoDestroy = destroy || null;
    }
    this.dom.appendChild(wrap);
    this.view.requestMeasure(this.placeInfoReq);
  }

  updateSelectedOption(selected: number) {
    let set: null | HTMLElement = null;
    for (
      let opt = this.list.firstChild as HTMLElement | null, i = this.range.from;
      opt;
      opt = opt.nextSibling as HTMLElement | null, i++
    ) {
      if (opt.nodeName != "LI" || !opt.id) {
        i--; // A section header
      } else if (i == selected) {
        if (!opt.hasAttribute("aria-selected")) {
          opt.setAttribute("aria-selected", "true");
          set = opt;
        }
      } else {
        if (opt.hasAttribute("aria-selected"))
          opt.removeAttribute("aria-selected");
      }
    }
    if (set) scrollIntoView(this.list, set);
    return set;
  }

  measureInfo() {
    let sel = this.dom.querySelector("[aria-selected]") as HTMLElement | null;
    if (!sel || !this.info) return null;
    let listRect = this.dom.getBoundingClientRect();
    let infoRect = this.info!.getBoundingClientRect();
    let selRect = sel.getBoundingClientRect();
    let space = this.space;
    if (!space) {
      let win = this.dom.ownerDocument.defaultView || window;
      space = {
        left: 0,
        top: 0,
        right: win.innerWidth,
        bottom: win.innerHeight,
      };
    }
    if (
      selRect.top > Math.min(space.bottom, listRect.bottom) - 10 ||
      selRect.bottom < Math.max(space.top, listRect.top) + 10
    )
      return null;
    return this.view.state
      .facet(completionConfig)
      .positionInfo(this.view, listRect, selRect, infoRect, space);
  }

  placeInfo(pos: { style?: string; class?: string } | null) {
    if (this.info) {
      if (pos) {
        if (pos.style) this.info.style.cssText = pos.style;
        this.info.className =
          "cm-tooltip cm-completionInfo " + (pos.class || "");
      } else {
        this.info.style.cssText = "top: -1e6px";
      }
    }
  }

  createListBox(
    options: readonly Option[],
    id: string,
    range: { from: number; to: number }
  ) {
    const ul = document.createElement("ul");
    ul.id = id;
    ul.setAttribute("role", "listbox");
    ul.setAttribute("aria-expanded", "true");
    ul.setAttribute("aria-label", this.view.state.phrase("Completions"));
    let curSection: string | null = null;
    for (let i = range.from; i < range.to; i++) {
      let { completion, match } = options[i],
        { section } = completion;
      if (section) {
        let name = typeof section == "string" ? section : section.name;
        if (name != curSection && (i > range.from || range.from == 0)) {
          curSection = name;
          if (typeof section != "string" && section.header) {
            ul.appendChild(section.header(section));
          } else {
            let header = ul.appendChild(
              document.createElement("completion-section")
            );
            header.textContent = name;
          }
        }
      }
      const li = ul.appendChild(document.createElement("li"));
      li.id = id + "-" + i;
      li.setAttribute("role", "option");
      let cls = this.optionClass(completion);
      if (cls) li.className = cls;
      for (let source of this.optionContent) {
        let node = source(completion, this.view.state, match);
        if (node) li.appendChild(node);
      }
    }
    if (range.from) ul.classList.add("cm-completionListIncompleteTop");
    if (range.to < options.length)
      ul.classList.add("cm-completionListIncompleteBottom");
    return ul;
  }

  destroyInfo() {
    if (this.info) {
      if (this.infoDestroy) this.infoDestroy();
      this.info.remove();
      this.info = null;
    }
  }

  destroy() {
    this.destroyInfo();
  }
}

// We allocate a new function instance every time the completion
// changes to force redrawing/repositioning of the tooltip
export function completionTooltip(
  stateField: StateField<CompletionState>,
  applyCompletion: (view: EditorView, option: Option) => void
) {
  return (view: EditorView): TooltipView =>
    new CompletionTooltip(view, stateField, applyCompletion);
}

function scrollIntoView(container: HTMLElement, element: HTMLElement) {
  let parent = container.getBoundingClientRect();
  let self = element.getBoundingClientRect();
  if (self.top < parent.top) container.scrollTop -= parent.top - self.top;
  else if (self.bottom > parent.bottom)
    container.scrollTop += self.bottom - parent.bottom;
}
