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

  public handelInsert({
    text,
    value,
    selection
  }: {
    text: string;
    value: Array<TextEditorValue>;
    selection: Selection;
  }): TextEditorHandle {
    const value_exists = this.isValueExists(value);

    console.log("InsertText handel", "value_exists: ", value_exists);

    const { anchor, anchor_offset } = this.getSelectionConfig(
      selection,
      value_exists
    );

    const body_index = this.insertUtilityService.getDataAttrIndex(
      anchor,
      "body_index"
    );

    const section_index = this.insertUtilityService.getDataAttrIndex(
      anchor.parentElement!,
      "section_index"
    );

    return this.getTextEditorHandleConfig({
      text,
      value,
      anchor,
      anchor_offset,
      section_index,
      body_index,
      value_exists
    });
  }

  private isValueExists(value: Array<TextEditorValue>): boolean {
    return value.some((section) =>
      section.body.some((body) => body.text.length)
    );
  }

  private getSelectionConfig(
    selection: Selection,
    value_exists: boolean
  ): {
    anchor: HTMLSpanElement;
    anchor_offset: number;
  } {
    return {
      anchor: (value_exists
        ? selection.anchorNode?.parentElement
        : selection.anchorNode) as HTMLSpanElement,
      anchor_offset: selection.anchorOffset
    };
  }

  private getTextEditorHandleConfig({
    text,
    value,
    anchor,
    anchor_offset,
    body_index,
    section_index,
    value_exists
  }: {
    text: string;
    value: Array<TextEditorValue>;
    anchor: HTMLSpanElement;
    anchor_offset: number;
    body_index: number;
    section_index: number;
    value_exists: boolean;
  }): TextEditorHandle {
    const anchor_handle = {
      host: anchor.parentElement as Node,
      query: `span.text-editor__body[data-body_index='${body_index}']`,
      offset: value_exists ? anchor_offset + 1 : 1
    };

    return {
      monitor: anchor,
      anchor: anchor_handle,
      focus: anchor_handle,
      update: value_exists
        ? this.updateBodyValue({
            text,
            value,
            body_index,
            section_index,
            offset: anchor_offset
          })
        : this.getBodyValue(text)
    };
  }

  private updateBodyValue({
    text,
    value,
    section_index,
    body_index,
    offset
  }: {
    text: string;
    value: Array<TextEditorValue>;
    section_index: number;
    body_index: number;
    offset: number;
  }): Array<TextEditorValue> {
    const body = value[section_index].body[body_index];

    value[section_index].body.splice(
      body_index,
      1,
      this.insertUtilityService.createSectionBody(
        body.text,
        body.text,
        text,
        offset,
        offset,
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
