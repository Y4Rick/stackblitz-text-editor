import { Injectable, inject } from "@angular/core";
import {
  TextEditorValue,
  TextEditorHandle,
  TextEditorSectionType
} from "../../text-editor.constants";
import { InsertUtilityService } from "./insert-utility.service";

@Injectable()
export class InsertTextService {
  private insertUtilityService = inject(InsertUtilityService);

  public handelInsert(
    text: string,
    value: Array<TextEditorValue>,
    selection: Selection,
    editor: HTMLSpanElement
  ): TextEditorHandle {
    console.log("InsertText handel");

    const value_exists = this.isValueExists(value);
    const { node, offset } = this.getSelectionValue(selection);

    console.log("InsertText value exists", value_exists);

    return {
      node: value_exists
        ? node
        : (editor.querySelector("span.text-editor__body") as Node),
      update: value_exists
        ? this.updateBodyValue(text, value, node, offset)
        : this.getBodyValue(text),
      offset: value_exists ? offset + 1 : 1
    };
  }

  private isValueExists(value: Array<TextEditorValue>): boolean {
    return value.some((section) =>
      section.body.some((body) => body.text.length)
    );
  }

  private getSelectionValue(selection: Selection): {
    node: HTMLSpanElement;
    offset: number;
  } {
    return {
      node: selection.anchorNode?.parentElement as HTMLSpanElement,
      offset: selection.focusOffset
    };
  }

  private updateBodyValue(
    text: string,
    value: Array<TextEditorValue>,
    node: HTMLElement,
    start: number
  ): Array<TextEditorValue> {
    const section_index = this.insertUtilityService.getDataAttrIndex(
      node.parentElement!,
      "section_index"
    );
    const body_index = this.insertUtilityService.getDataAttrIndex(
      node as HTMLElement,
      "body_index"
    );
    const body = value[section_index].body[body_index];

    value[section_index].body.splice(
      body_index,
      1,
      this.insertUtilityService.preCreateSectionBody(
        body.text,
        body.text,
        text,
        start,
        start,
        body.mod
      )
    );

    return value;
  }

  private getBodyValue(text: string): Array<TextEditorValue> {
    return [
      {
        section: TextEditorSectionType.PPARAGRAPH,
        body: [
          {
            text: (text ?? "").toString(),
            mod: []
          }
        ]
      }
    ];
  }
}
