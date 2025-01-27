import { Injectable, inject } from "@angular/core";
import { TextEditorHandle, TextEditorValue } from "../../text-editor.constants";
import { InsertTextUtilityService } from "./insert-text-utility.service";
import { UtilityService } from "../utility.service";

@Injectable()
export class InsertTextBodyService {
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
    console.log("SelectionBody handle");

    return this.getTextEditorHandleConfig({
      text,
      value,
      ...this.getSelectionConfig(selection)
    });
  }

  private getSelectionConfig({
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset
  }: Selection): {
    anchor: HTMLSpanElement;
    anchor_offset: number;
    focus_offset: number;
    section_index: number;
    body_index: number;
  } {
    const forward = focusOffset > anchorOffset;
    const anchor = (
      forward ? anchorNode!.parentElement : focusNode!.parentElement
    ) as HTMLSpanElement;

    return {
      anchor,
      anchor_offset: forward ? anchorOffset : focusOffset,
      focus_offset: forward ? focusOffset : anchorOffset,
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
    focus_offset,
    body_index,
    section_index
  }: {
    text: string;
    value: Array<TextEditorValue>;
    anchor: HTMLSpanElement;
    anchor_offset: number;
    focus_offset: number;
    body_index: number;
    section_index: number;
  }): TextEditorHandle {
    const handle = this.insertTextUtilityService.getBodyHandleObject({
      host: anchor.parentElement as HTMLSpanElement,
      index: body_index,
      offset: anchor_offset + 1
    });

    return {
      monitor: anchor,
      anchor: handle,
      focus: handle,
      update: this.updateBodyValue({
        text,
        value,
        body_index,
        section_index,
        anchor_offset,
        focus_offset
      })
    };
  }

  private updateBodyValue({
    text,
    value,
    body_index,
    section_index,
    anchor_offset,
    focus_offset
  }: {
    text: string;
    value: Array<TextEditorValue>;
    body_index: number;
    section_index: number;
    anchor_offset: number;
    focus_offset: number;
  }): Array<TextEditorValue> {
    const body = value[section_index].body[body_index];

    value[section_index].body.splice(
      body_index,
      1,
      this.insertTextUtilityService.createSectionBody(
        body.text,
        body.text,
        text,
        anchor_offset,
        focus_offset,
        body.mod
      )
    );

    return value;
  }
}
