import { Injectable, inject } from "@angular/core";
import { TextEditorHandle, TextEditorValue } from "../../text-editor.constants";
import { InsertUtilityService } from "./insert-utility.service";

@Injectable()
export class InsertTextBodyService {
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
    console.log("SelectionBody handel");

    const { anchor, anchor_offset, focus_offset } =
      this.getSelectionConfig(selection);

    const body_index = this.insertUtilityService.getDataAttrIndex(
      anchor as HTMLElement,
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
      focus_offset,
      section_index,
      body_index
    });
  }

  private getSelectionConfig(selection: Selection): {
    anchor: HTMLSpanElement;
    anchor_offset: number;
    focus_offset: number;
  } {
    const forward = selection.focusOffset > selection.anchorOffset;

    return {
      anchor: (forward
        ? selection.anchorNode!.parentElement
        : selection.focusNode!.parentElement) as HTMLSpanElement,
      anchor_offset: forward ? selection.anchorOffset : selection.focusOffset,
      focus_offset: forward ? selection.focusOffset : selection.anchorOffset
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
    const anchor_handle = {
      host: anchor.parentElement as Node,
      query: `span.text-editor__body[data-body_index='${body_index}']`,
      offset: anchor_offset + 1
    };

    return {
      monitor: anchor,
      anchor: anchor_handle,
      focus: anchor_handle,
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
      this.insertUtilityService.createSectionBody(
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
