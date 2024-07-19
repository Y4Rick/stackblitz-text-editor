import { Injectable, inject } from "@angular/core";
import {
  TextEditorValue,
  TextEditorSectionType,
  TextEditorTextModification,
  TextEditorInputEventType,
  TextEditorHandle
} from "./text-editor.constants";
import { InsertTextBodyService } from "./utility/insert-text/insert-text-body.service";
import { InsertTextSectionService } from "./utility/insert-text/insert-text-section.service";
import { InsertTextCollectionService } from "./utility/insert-text/insert-text-collection.service";
import { InsertTextService } from "./utility/insert-text/insert-text.service";
import { InsertSectionService } from "./utility/insert-section/insert-section.service";
import { UtilityService } from "./utility/utility.service";

@Injectable()
export class TextEditorService {
  private readonly mutation_observers: Map<string, MutationObserver> =
    new Map();

  private utilityService = inject(UtilityService);
  private insertTextService = inject(InsertTextService);
  private insertTextBodyService = inject(InsertTextBodyService);
  private insertTextSectionService = inject(InsertTextSectionService);
  private insertTextCollectionService = inject(InsertTextCollectionService);
  private insertSectionService = inject(InsertSectionService);

  constructor() {}

  public isValueValid(value: any | Array<TextEditorValue>): boolean {
    const is_sections =
      value &&
      Array.isArray(value) &&
      value.every((item) =>
        Object.values(TextEditorSectionType).some(
          (type) => type === item.section
        )
      );

    if (!is_sections) return is_sections;

    const is_bodies: boolean[] = value?.reduce(
      (acc: boolean[], item: any | TextEditorValue) => {
        if (item.section === TextEditorSectionType.PARAGRAPH) {
          acc.push(
            Array.isArray(item?.body) &&
              !!item.body.length &&
              item.body.every(
                (
                  body:
                    | any
                    | {
                        text: string;
                        mod?: Array<TextEditorTextModification>;
                      }
                ) => typeof body.text === "string" && body.text.length
              )
          );
        }

        return acc;
      },
      []
    );

    return is_bodies.every((item) => item);
  }

  public getControlValue(
    value: Array<TextEditorValue>
  ): Array<TextEditorValue> | "" {
    return this.utilityService.isEditorValueExists(value) ? value : "";
  }

  public isEditorAvailable(
    doc_element: HTMLSpanElement,
    value: Array<TextEditorValue>
  ): boolean {
    const box_exist = !!doc_element.querySelector("span.text-editor__box");

    if (!box_exist) return box_exist;

    const editor = doc_element.querySelector(
      'span.text-editor__selection[contenteditable="true"]'
    );

    if (!editor) return false;

    const editor_section = Array.from(editor.children).every(
      (item) =>
        item.localName === "span" &&
        item.classList.contains("text-editor__section") &&
        item.hasAttribute("data-section_index")
    );

    if (!editor_section) return editor_section;

    const count_section =
      doc_element.querySelectorAll("span.text-editor__section")?.length || 0;

    if (count_section !== value.length) return false;

    const section_body = Object.values(
      doc_element.querySelectorAll("span.text-editor__section")
    ).every((section) =>
      Array.from(section.children).every(
        (item) =>
          item.localName === "span" &&
          item.classList.contains("text-editor__body") &&
          (item as HTMLSpanElement).dataset["body_index"] &&
          !item.children.length
      )
    );

    if (!section_body) return section_body;

    const count_body = Object.values(
      doc_element.querySelectorAll("span.text-editor__section")
    ).every(
      (section, index) =>
        section.querySelectorAll("span.text-editor__body")?.length ===
        value[index].body.length
    );

    if (!count_body) return count_body;

    const body_available = Object.values(
      doc_element.querySelectorAll("span.text-editor__section")
    ).every((section, section_index) =>
      Array.from(section.children).every(
        (item, body_index) =>
          (item as HTMLSpanElement).innerText ===
          value[section_index].body[body_index].text
      )
    );

    return body_available;
  }

  public isHandleAvailable(value?: TextEditorHandle): boolean {
    return (
      !!value?.monitor &&
      !!value?.anchor &&
      !!value?.focus &&
      !!value?.update?.length
    );
  }

  public manageFocusEditor(
    target: HTMLSpanElement,
    value: Array<TextEditorValue>
  ): void {
    if (!this.utilityService.isEditorValueExists(value)) {
      console.log("manageFocusEditor");

      const body_element = target.querySelector(
        "span.text-editor__body"
      ) as HTMLSpanElement;

      console.log("body_element childNodes", body_element?.childNodes.item(0));

      if (!body_element?.childNodes?.item(0)) {
        this.utilityService.setEmptyTextNode(body_element);

        const selection = this.utilityService.getDOCSelection();

        selection.removeAllRanges();
        selection.collapse(body_element, 0);
      }
    }
  }

  public handleInputEvent({
    event,
    value,
    editor
  }: {
    event: InputEvent;
    value: TextEditorValue[];
    editor: HTMLSpanElement;
  }): TextEditorHandle | undefined {
    console.log("handleInputEvent", event, "value", value);

    const selection = this.utilityService.getDOCSelection();
    const clone = this.cloneValue(value);

    switch (event.inputType) {
      case TextEditorInputEventType.INSERT_TEXT:
        const handle = {
          text: event.data!,
          value: clone,
          selection
        };

        return selection.isCollapsed
          ? this.insertTextService.handleInsert(handle)
          : this.handleSelectiveInsertTextEvent(handle);

      case TextEditorInputEventType.INSERT_PARAGRAPH:
      case TextEditorInputEventType.INSERT_LINEB_REAK:
        return selection.isCollapsed
          ? this.insertSectionService.handleInsert({
              value: clone,
              editor,
              selection
            })
          : this.handleSelectiveInsertSectionEvent();

      default:
        return;
    }
  }

  public watchMutationObserver({
    monitor,
    anchor,
    focus
  }: {
    monitor: HTMLSpanElement;
    anchor: {
      host: HTMLSpanElement;
      query: string;
      offset: number;
    };
    focus: {
      host: HTMLSpanElement;
      query: string;
      offset: number;
    };
  }): void {
    console.log("watchMutationObserver");
    console.log("monitor", monitor);
    console.log("anchor", anchor);
    console.log("focus", focus);

    const observer_id = `observer_${new Date().getTime()}`;

    const mutation_observer = new MutationObserver(
      (mutations: Array<MutationRecord>) => {
        mutation_observer.disconnect();

        console.log("mutations", mutations);

        this.removeMutationObserver(observer_id);

        const anchor_collapse = anchor.host.querySelector(
          anchor.query
        ) as HTMLSpanElement;
        const focus_collapse = focus.host.querySelector(
          focus.query
        ) as HTMLSpanElement;

        console.log("anchor_collapse", anchor_collapse);
        console.log("focus_collapse", focus_collapse);

        if (anchor_collapse && focus_collapse) {
          const selection = this.utilityService.getDOCSelection();

          if (!anchor_collapse.childNodes.item(0)) {
            this.utilityService.setEmptyTextNode(anchor_collapse);
          }

          if (!focus_collapse.childNodes.item(0)) {
            this.utilityService.setEmptyTextNode(focus_collapse);
          }

          selection.removeAllRanges();
          selection.setBaseAndExtent(
            anchor_collapse.childNodes.item(0),
            anchor.offset,
            focus_collapse.childNodes.item(0),
            focus.offset
          );
        }
      }
    );

    this.pushMutationObserver(mutation_observer, observer_id);

    mutation_observer.observe(monitor, {
      childList: true,
      characterData: true
    });
  }

  public clearMutationObserver(): void {
    if (this.mutation_observers.size) {
      this.mutation_observers.forEach((observer) => observer.disconnect);

      this.mutation_observers.clear();
    }

    console.log("clearMutationObserver", this.mutation_observers);
  }

  private cloneValue(value: Array<TextEditorValue>): Array<TextEditorValue> {
    return JSON.parse(JSON.stringify(value));
  }

  private handleSelectiveInsertTextEvent(config: {
    text: string;
    value: TextEditorValue[];
    selection: Selection;
  }): TextEditorHandle | undefined {
    if (this.isSelectionBody(config.selection)) {
      // same body
      return this.insertTextBodyService.handleInsert(config);
    } else if (this.isSelectionSection(config.selection)) {
      // same section
      return this.insertTextSectionService.handleInsert(config);
    } else if (this.isSelectionCollection(config.selection)) {
      // full collection
      return this.insertTextCollectionService.handleInsert(config);
    } else return;
  }

  private handleSelectiveInsertSectionEvent(): TextEditorHandle | undefined {
    return {} as any;
  }

  private isSelectionCollection({ anchorNode, focusNode }: Selection): boolean {
    const anchor_saction = anchorNode?.parentElement!
      .parentElement as HTMLSpanElement;

    const focus_saction = focusNode?.parentElement!
      .parentElement as HTMLSpanElement;

    return !anchor_saction!.isSameNode(focus_saction);
  }

  private isSelectionSection({ anchorNode, focusNode }: Selection): boolean {
    const anchor_saction = anchorNode?.parentElement!
      .parentElement as HTMLSpanElement;

    const focus_saction = focusNode?.parentElement!
      .parentElement as HTMLSpanElement;

    return anchor_saction!.isSameNode(focus_saction);
  }

  private isSelectionBody({ anchorNode, focusNode }: Selection): boolean {
    return anchorNode!.isSameNode(focusNode);
  }

  private pushMutationObserver(observer: MutationObserver, id: string): void {
    this.mutation_observers.set(id, observer);
  }

  private removeMutationObserver(id: string): void {
    this.mutation_observers.delete(id);

    console.log("removeMutationObserver", this.mutation_observers);
  }
}
