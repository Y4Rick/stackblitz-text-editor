import { Injectable, inject } from "@angular/core";
import { TextEditorValue, TextEditorHandle } from "../../text-editor.constants";
import { InsertTextUtilityService } from "./insert-text-utility.service";
import { UtilityService } from "../utility.service";

@Injectable()
export class InsertTextService {
  private insertTextUtilityService = inject(InsertTextUtilityService);
  private utilityService = inject(UtilityService);

  public handleInsert({
    text,
    value,
    selection
  }: {
    text: string;
    value: Array<TextEditorValue>;
    selection: Selection;
  }): TextEditorHandle {
    const value_exists = this.utilityService.isEditorValueExists(value);

    console.log("InsertText handle", "value_exists: ", value_exists);

    return this.getTextEditorHandleConfig({
      text,
      value,
      ...this.getSelectionConfig(selection, value_exists),
      value_exists
    });
  }

  private getSelectionConfig(
    selection: Selection,
    value_exists: boolean
  ): {
    anchor: HTMLSpanElement;
    anchor_offset: number;
    section_index: number;
    body_index: number;
  } {
    const anchor = (
      value_exists ? selection.anchorNode?.parentElement : selection.anchorNode
    ) as HTMLSpanElement;

    return {
      anchor,
      anchor_offset: selection.anchorOffset,
      section_index: this.utilityService.getDataAttrIndex(
        anchor.parentElement!,
        "section_index"
      ),
      body_index: this.utilityService.getDataAttrIndex(anchor, "body_index")
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
    const handle = this.insertTextUtilityService.getBodyHandleObject({
      host: anchor.parentElement as HTMLSpanElement,
      index: body_index,
      offset: value_exists ? anchor_offset + 1 : 1
    });

    return {
      monitor: anchor,
      anchor: handle,
      focus: handle,
      update: value_exists
        ? this.updateBodyValue({
            text,
            value,
            body_index,
            section_index,
            offset: anchor_offset
          })
        : [this.utilityService.createSectionParagraphBody(text)]
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
      this.insertTextUtilityService.createSectionBody(
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
}
