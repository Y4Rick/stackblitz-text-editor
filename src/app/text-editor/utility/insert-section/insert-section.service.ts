import { Injectable, inject } from "@angular/core";
import { TextEditorHandle, TextEditorValue } from "../../text-editor.constants";
import { InsertUtilityService } from "../insert-text/insert-utility.service";
import { UtilityService } from "../utility.service";

@Injectable()
export class InsertSectionService {
  private insertUtilityService = inject(InsertUtilityService);
  private utilityService = inject(UtilityService);

  public handleInsert({
    value,
    editor,
    selection
  }: {
    value: Array<TextEditorValue>;
    editor: HTMLSpanElement;
    selection: Selection;
  }): TextEditorHandle {
    console.log("InsertSectionService handleInsert");
    const { section_index, anchor_body_index, anchor_offset } =
      this.getSelectionConfig(selection);

    console.log(
      "getSelectionConfig",
      section_index,
      anchor_body_index,
      anchor_offset
    );

    return this.mustCreateEmptySection({
      value,
      section_index,
      anchor_body_index,
      anchor_offset
    })
      ? this.createEmptySection({ value, section_index, editor })
      : this.mustCreateFilledSection();

    // if (
    //   this.mustCreateEmptySection({
    //     value,
    //     section_index,
    //     anchor_body_index,
    //     anchor_offset
    //   })
    // ) {
    //   console.log("mustCreateEmptySection");

    // }

    // const value_exists = this.isValueExists(value);

    // console.log("value_exists", value_exists);

    // const result = {
    //   monitor: undefined,
    //   anchor: undefined,
    //   focus: undefined,
    //   update: []
    // };

    // if (value_exists) {
    //   const value_section = value[selection_config.section_index];

    //   // value.splice()
    //   // value[section_index].body.splice(
    //   //   anchor_body_index,
    //   //   can_concat_bodies
    //   //     ? focus_body_index + 1 - anchor_body_index + 1
    //   //     : focus_body_index - anchor_body_index + 1,
    //   //   this.insertUtilityService.createSectionBody(
    //   //     value_anchor_body.text,
    //   //     can_concat_bodies ? value_next_body.text : "",
    //   //     text,
    //   //     anchor_offset,
    //   //     0,
    //   //     value_anchor_body.mod
    //   //   )
    //   // );
    // }

    // return {} as any;
  }

  private getSelectionConfig({
    anchorNode,
    anchorOffset
  }: // focusNode,
  // focusOffset
  Selection): {
    section_index: number;
    // anchor: HTMLSpanElement;
    anchor_body_index: number;
    anchor_offset: number;
    // focus_body_index: number;
    // focus_offset: number;
  } {
    // const anchor_body = anchorNode!.parentElement as HTMLElement;
    // // const focus_body = focusNode!.parentElement as HTMLElement;

    // const anchor_body_index = this.insertUtilityService.getDataAttrIndex(
    //   anchor_body,
    //   "body_index"
    // );
    // const focus_body_index = this.insertUtilityService.getDataAttrIndex(
    //   focus_body,
    //   "body_index"
    // );

    // const forward = focus_body_index > anchor_body_index;

    return {
      section_index: this.insertUtilityService.getDataAttrIndex(
        anchorNode!.parentElement!.parentElement as HTMLSpanElement,
        "section_index"
      ),
      // anchor: forward ? anchor_body : focus_body,
      anchor_body_index: this.insertUtilityService.getDataAttrIndex(
        anchorNode!.parentElement!,
        "body_index"
      ),
      anchor_offset: anchorOffset
      // focus_body_index: forward ? focus_body_index : anchor_body_index,
      // focus_offset: forward ? focusOffset : anchorOffset
    };
  }

  private mustCreateEmptySection({
    value,
    section_index,
    anchor_body_index,
    anchor_offset
  }: {
    value: Array<TextEditorValue>;
    section_index: number;
    anchor_body_index: number;
    anchor_offset: number;
  }): boolean {
    console.log(
      "mustCreateEmptySection",
      value[section_index].body.length - 1 === anchor_body_index &&
        value[section_index].body[anchor_body_index].text.length ===
          anchor_offset
    );

    return (
      value[section_index].body.length - 1 === anchor_body_index &&
      value[section_index].body[anchor_body_index].text.length === anchor_offset
    );
  }

  private createEmptySection({
    value,
    section_index,
    editor
  }: {
    value: Array<TextEditorValue>;
    section_index: number;
    editor: HTMLSpanElement;
  }): TextEditorHandle {
    console.log("createEmptySection");

    const handle = {
      host: editor,
      query: `span.text-editor__section[data-section_index='${
        section_index + 1
      }'] span.text-editor__body[data-body_index='0']`,
      offset: 0
    };

    value.splice(
      section_index + 1,
      0,
      this.utilityService.createSectionParagraphBody("")
    );

    return {
      monitor: editor,
      anchor: handle,
      focus: handle,
      update: value
    };
  }

  private mustCreateFilledSection() {
    return {} as any;
  }
}
