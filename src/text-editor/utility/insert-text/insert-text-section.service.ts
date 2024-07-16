import { Injectable, inject } from "@angular/core";
import { InsertUtilityService } from "./insert-utility.service";
import { TextEditorHandle, TextEditorValue } from "../../text-editor.constants";

@Injectable()
export class InsertTextSectionService {
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
    console.log("SelectionSection handel");

    return this.getTextEditorHandleConfig({
      text,
      value,
      ...this.getSelectionConfig(selection)
    });
  }

  private getTextEditorHandleConfig({
    text,
    value,
    section_index,
    anchor,
    anchor_body_index,
    anchor_offset,
    focus_body_index,
    focus_offset
  }: {
    text: string;
    value: Array<TextEditorValue>;
    section_index: number;
    anchor: HTMLSpanElement;
    anchor_body_index: number;
    anchor_offset: number;
    focus_body_index: number;
    focus_offset: number;
  }): TextEditorHandle {
    const handle = this.insertUtilityService.getBodyHandleObject({
      host: anchor.parentElement as Node,
      index: anchor_body_index,
      offset: anchor_offset + 1
    });

    return {
      monitor: anchor,
      anchor: handle,
      focus: handle,
      update: this.canRemoveFollowingBodies({
        value,
        section_index,
        focus_body_index,
        focus_offset
      })
        ? this.removeFollowingBodies({
            text,
            value,
            section_index,
            anchor_body_index,
            focus_body_index,
            anchor_offset
          })
        : this.keppFollowingBodies({
            text,
            value,
            section_index,
            anchor_body_index,
            focus_body_index,
            anchor_offset,
            focus_offset
          })
    };
  }

  private getSelectionConfig({
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset
  }: Selection): {
    section_index: number;
    anchor: HTMLSpanElement;
    anchor_body_index: number;
    anchor_offset: number;
    focus_body_index: number;
    focus_offset: number;
  } {
    const anchor_body = anchorNode!.parentElement as HTMLElement;
    const focus_body = focusNode!.parentElement as HTMLElement;

    const anchor_body_index = this.insertUtilityService.getDataAttrIndex(
      anchor_body,
      "body_index"
    );
    const focus_body_index = this.insertUtilityService.getDataAttrIndex(
      focus_body,
      "body_index"
    );

    const forward = focus_body_index > anchor_body_index;

    return {
      section_index: this.insertUtilityService.getDataAttrIndex(
        anchorNode!.parentElement!.parentElement as HTMLElement,
        "section_index"
      ),
      anchor: forward ? anchor_body : focus_body,
      anchor_body_index: forward ? anchor_body_index : focus_body_index,
      anchor_offset: forward ? anchorOffset : focusOffset,
      focus_body_index: forward ? focus_body_index : anchor_body_index,
      focus_offset: forward ? focusOffset : anchorOffset
    };
  }

  private canRemoveFollowingBodies({
    value,
    section_index,
    focus_body_index,
    focus_offset
  }: {
    value: Array<TextEditorValue>;
    section_index: number;
    focus_body_index: number;
    focus_offset: number;
  }): boolean {
    console.log(
      "SelectionSection canRemoveFollowingBodies",
      focus_offset === value[section_index].body[focus_body_index].text.length
    );

    return (
      focus_offset === value[section_index].body[focus_body_index].text.length
    );
  }

  private removeFollowingBodies({
    text,
    value,
    section_index,
    anchor_body_index,
    focus_body_index,
    anchor_offset
  }: {
    text: string;
    value: Array<TextEditorValue>;
    section_index: number;
    anchor_body_index: number;
    focus_body_index: number;
    anchor_offset: number;
  }): Array<TextEditorValue> {
    console.log("SelectionSection removeFollowingBodies");

    const value_anchor_body = value[section_index].body[anchor_body_index];
    const value_next_body = value[section_index].body[focus_body_index + 1];

    const can_concat_bodies = this.insertUtilityService.canConcatBodies(
      value_anchor_body?.mod,
      value_next_body?.mod
    );

    value[section_index].body.splice(
      anchor_body_index,
      can_concat_bodies
        ? focus_body_index + 1 - anchor_body_index + 1
        : focus_body_index - anchor_body_index + 1,
      this.insertUtilityService.createSectionBody(
        value_anchor_body.text,
        can_concat_bodies ? value_next_body.text : "",
        text,
        anchor_offset,
        0,
        value_anchor_body.mod
      )
    );

    return value;
  }

  private keppFollowingBodies({
    text,
    value,
    section_index,
    anchor_body_index,
    focus_body_index,
    anchor_offset,
    focus_offset
  }: {
    text: string;
    value: Array<TextEditorValue>;
    section_index: number;
    anchor_body_index: number;
    focus_body_index: number;
    anchor_offset: number;
    focus_offset: number;
  }): Array<TextEditorValue> {
    console.log("SelectionSection keppFollowingBodies");

    const value_anchor_body = value[section_index].body[anchor_body_index];
    const value_focus_body = value[section_index].body[focus_body_index];

    const can_concat_bodies = this.insertUtilityService.canConcatBodies(
      value_anchor_body?.mod,
      value_focus_body?.mod
    );

    value[section_index].body.splice(
      anchor_body_index,
      focus_body_index - anchor_body_index + 1,
      ...(can_concat_bodies
        ? [
            this.insertUtilityService.createSectionBody(
              value_anchor_body.text,
              value_focus_body.text,
              text,
              anchor_offset,
              focus_offset,
              value_anchor_body.mod
            )
          ]
        : [
            this.insertUtilityService.createSectionBody(
              value_anchor_body.text,
              "",
              text,
              anchor_offset,
              0,
              value_anchor_body.mod
            ),
            this.insertUtilityService.createSectionBody(
              "",
              value_focus_body.text,
              "",
              0,
              focus_offset,
              value_focus_body.mod
            )
          ])
    );

    return value;
  }
}
