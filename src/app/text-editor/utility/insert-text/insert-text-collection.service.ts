import { Injectable, inject } from "@angular/core";
import { TextEditorHandle, TextEditorValue } from "../../text-editor.constants";
import { InsertUtilityService } from "./insert-utility.service";

@Injectable()
export class InsertTextCollectionService {
  private insertUtilityService = inject(InsertUtilityService);

  public handleInsert({
    text,
    value,
    selection
  }: {
    text: string;
    value: Array<TextEditorValue>;
    selection: Selection;
  }): TextEditorHandle {
    console.log("SelectionCollection handle");

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
    anchor_section: HTMLSpanElement;
    anchor_section_index: number;
    anchor_offset: number;
    anchor_body: HTMLSpanElement;
    anchor_body_index: number;
    focus_section_index: number;
    focus_offset: number;
    focus_body_index: number;
  } {
    const anchor_section = anchorNode!.parentElement!
      .parentElement as HTMLSpanElement;
    const focus_section = focusNode!.parentElement!
      .parentElement as HTMLSpanElement;

    const anchor_section_index = this.insertUtilityService.getDataAttrIndex(
      anchor_section,
      "section_index"
    );
    const focus_section_index = this.insertUtilityService.getDataAttrIndex(
      focus_section,
      "section_index"
    );

    const anchor_body = anchorNode!.parentElement as HTMLSpanElement;
    const focus_body = focusNode!.parentElement as HTMLSpanElement;

    const anchor_body_index = this.insertUtilityService.getDataAttrIndex(
      anchor_body,
      "body_index"
    );
    const focus_body_index = this.insertUtilityService.getDataAttrIndex(
      focus_body,
      "body_index"
    );

    const forward = focus_section_index > anchor_section_index;

    return {
      anchor_section: forward ? anchor_section : focus_section,
      anchor_section_index: forward
        ? anchor_section_index
        : focus_section_index,
      anchor_offset: forward ? anchorOffset : focusOffset,
      anchor_body: forward ? anchor_body : focus_body,
      anchor_body_index: forward ? anchor_body_index : focus_body_index,
      focus_section_index: forward ? focus_section_index : anchor_section_index,
      focus_offset: forward ? focusOffset : anchorOffset,
      focus_body_index: forward ? focus_body_index : anchor_body_index
    };
  }

  private getTextEditorHandleConfig({
    text,
    value,
    anchor_section,
    anchor_section_index,
    anchor_offset,
    anchor_body,
    anchor_body_index,
    focus_section_index,
    focus_offset,
    focus_body_index
  }: {
    text: string;
    value: Array<TextEditorValue>;
    anchor_section: HTMLSpanElement;
    anchor_section_index: number;
    anchor_offset: number;
    anchor_body: HTMLSpanElement;
    anchor_body_index: number;
    focus_section_index: number;
    focus_offset: number;
    focus_body_index: number;
  }): TextEditorHandle {
    const handle = this.insertUtilityService.getBodyHandleObject({
      host: anchor_section,
      index: anchor_body_index,
      offset: anchor_offset + 1
    });

    const result: TextEditorHandle = {
      monitor: anchor_body,
      anchor: handle,
      focus: handle,
      update: []
    };

    if (
      this.canRemoveFullSelectedSections({
        value,
        focus_section_index,
        focus_body_index,
        focus_offset
      })
    ) {
      result.update = this.removeFullSelectedSections({
        text,
        value,
        anchor_section_index,
        anchor_body_index,
        anchor_offset,
        focus_section_index
      });
    } else if (
      this.canRemoveFocusBody({
        value,
        focus_section_index,
        focus_body_index,
        focus_offset
      })
    ) {
      result.update = this.removeFocusBody({
        text,
        value,
        anchor_section_index,
        anchor_body_index,
        anchor_offset,
        focus_section_index,
        focus_body_index
      });
    } else {
      result.update = this.keepFocusBody({
        text,
        value,
        anchor_section_index,
        anchor_body_index,
        anchor_offset,
        focus_section_index,
        focus_body_index,
        focus_offset
      });
    }

    value.splice(
      anchor_section_index + 1,
      focus_section_index - anchor_section_index
    );

    return result;
  }

  private canRemoveFullSelectedSections({
    value,
    focus_section_index,
    focus_body_index,
    focus_offset
  }: {
    value: TextEditorValue[];
    focus_section_index: number;
    focus_body_index: number;
    focus_offset: number;
  }): boolean {
    const bodies = value[focus_section_index].body;

    console.log(
      "SelectionCollection canRemoveFullSelectedSections",
      bodies.length - 1 === focus_body_index &&
        focus_offset === bodies[focus_body_index].text.length
    );

    return (
      bodies.length - 1 === focus_body_index &&
      focus_offset === bodies[focus_body_index].text.length
    );
  }

  private removeFullSelectedSections({
    text,
    value,
    anchor_section_index,
    anchor_body_index,
    anchor_offset,
    focus_section_index
  }: {
    text: string;
    value: TextEditorValue[];
    anchor_section_index: number;
    anchor_body_index: number;
    anchor_offset: number;
    focus_section_index: number;
  }): TextEditorValue[] {
    console.log("SelectionCollection removeFullSelectedSections");

    const body = value[anchor_section_index].body;

    body.splice(
      anchor_body_index,
      body.length + 1,
      this.insertUtilityService.createSectionBody(
        body[anchor_body_index].text,
        "",
        text,
        anchor_offset,
        0,
        body[anchor_body_index].mod
      )
    );

    return value;
  }

  private canRemoveFocusBody({
    value,
    focus_section_index,
    focus_body_index,
    focus_offset
  }: {
    value: TextEditorValue[];
    focus_section_index: number;
    focus_body_index: number;
    focus_offset: number;
  }): boolean {
    console.log(
      "SelectionCollection canRemoveFocusBody",
      focus_offset ===
        value[focus_section_index].body[focus_body_index].text.length
    );

    return (
      focus_offset ===
      value[focus_section_index].body[focus_body_index].text.length
    );
  }

  private removeFocusBody({
    text,
    value,
    anchor_section_index,
    anchor_body_index,
    anchor_offset,
    focus_section_index,
    focus_body_index
  }: {
    text: string;
    value: TextEditorValue[];
    anchor_section_index: number;
    anchor_body_index: number;
    anchor_offset: number;
    focus_section_index: number;
    focus_body_index: number;
  }): TextEditorValue[] {
    console.log("SelectionCollection removeFocusBody");

    const value_anchor_section = value[anchor_section_index];
    const value_anchor_section_body =
      value_anchor_section.body[anchor_body_index];

    const value_focus_section = value[focus_section_index];
    const value_focus_section_next_body =
      value_focus_section.body[focus_body_index + 1];

    const can_concat_bodies = this.insertUtilityService.canConcatBodies(
      value_anchor_section_body?.mod,
      value_focus_section_next_body?.mod
    );

    value_anchor_section.body.splice(
      anchor_body_index,
      value_anchor_section.body.length + 1,
      this.insertUtilityService.createSectionBody(
        value_anchor_section_body.text,
        can_concat_bodies ? value_focus_section_next_body.text : "",
        text,
        anchor_offset,
        0,
        value_anchor_section_body.mod
      ),
      ...(can_concat_bodies
        ? value_focus_section.body.slice(focus_body_index + 2)
        : value_focus_section.body.slice(focus_body_index + 1))
    );

    return value;
  }

  private keepFocusBody({
    text,
    value,
    anchor_section_index,
    anchor_body_index,
    anchor_offset,
    focus_section_index,
    focus_body_index,
    focus_offset
  }: {
    text: string;
    value: TextEditorValue[];
    anchor_section_index: number;
    anchor_body_index: number;
    anchor_offset: number;
    focus_section_index: number;
    focus_body_index: number;
    focus_offset: number;
  }): TextEditorValue[] {
    console.log("SelectionCollection keepFocusBody");

    const value_anchor_section = value[anchor_section_index];
    const value_anchor_section_body =
      value_anchor_section.body[anchor_body_index];

    const value_focus_section = value[focus_section_index];
    const value_focus_section_body = value_focus_section.body[focus_body_index];

    const can_concat_bodies = this.insertUtilityService.canConcatBodies(
      value_anchor_section_body?.mod,
      value_focus_section_body?.mod
    );

    value_anchor_section.body.splice(
      anchor_body_index,
      value_anchor_section.body.length + 1,
      this.insertUtilityService.createSectionBody(
        value_anchor_section_body.text,
        can_concat_bodies ? value_focus_section_body.text : "",
        text,
        anchor_offset,
        can_concat_bodies ? focus_offset : 0,
        value_anchor_section_body.mod
      ),
      ...(can_concat_bodies
        ? value_focus_section.body.slice(focus_body_index + 1)
        : [
            this.insertUtilityService.createSectionBody(
              "",
              value_focus_section_body.text,
              "",
              0,
              focus_offset,
              value_focus_section_body.mod
            ),
            ...value_focus_section.body.slice(focus_body_index + 1)
          ])
    );

    return value;
  }
}
