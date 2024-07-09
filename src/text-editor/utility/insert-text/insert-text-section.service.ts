import { Injectable, inject } from '@angular/core';
import { InsertUtilityService } from './insert-utility.service';
import { TextEditorHandle, TextEditorValue } from '../../text-editor.constants';

@Injectable()
export class InsertTextSectionService {
  private insertUtilityService = inject(InsertUtilityService);

  public handelInsert(
    text: string,
    value: Array<TextEditorValue>,
    selection: Selection
  ): TextEditorHandle {
    console.log('SelectionSection handel');

    const { section_index, anchor, focus, start, end } =
      this.getSelectionValue(selection);

    return {
      node: anchor[0],
      update: this.canRemoveFollowingBodies(value, section_index, focus[1], end)
        ? this.removeFollowingBodies(
            text,
            value,
            section_index,
            anchor[1],
            focus[1],
            start
          )
        : this.keppFollowingBodies(
            text,
            value,
            section_index,
            anchor[1],
            focus[1],
            start,
            end
          ),
      offset: start + 1,
    };
  }

  private getSelectionValue({
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset,
  }: Selection): {
    section_index: number;
    anchor: [HTMLSpanElement, number];
    focus: [HTMLSpanElement, number];
    start: number;
    end: number;
  } {
    const section_index = this.insertUtilityService.getDataAttrIndex(
      anchorNode!.parentElement!.parentElement as HTMLElement,
      'section_index'
    );

    const anchor_body = anchorNode!.parentElement as HTMLElement;
    const focus_body = focusNode!.parentElement as HTMLElement;

    const anchor_index = this.insertUtilityService.getDataAttrIndex(
      anchor_body,
      'body_index'
    );
    const focus_index = this.insertUtilityService.getDataAttrIndex(
      focus_body,
      'body_index'
    );

    const forward = focus_index > anchor_index;

    return {
      section_index,
      anchor: forward ? [anchor_body, anchor_index] : [focus_body, focus_index],
      focus: forward ? [focus_body, focus_index] : [anchor_body, anchor_index],
      start: forward ? anchorOffset : focusOffset,
      end: forward ? focusOffset : anchorOffset,
    };
  }

  private canRemoveFollowingBodies(
    value: Array<TextEditorValue>,
    section_index: number,
    focus_index: number,
    end: number
  ): boolean {
    console.log(
      'SelectionSection canRemoveFollowingBodies',
      end === value[section_index].body[focus_index].text.length
    );

    return end === value[section_index].body[focus_index].text.length;
  }

  private removeFollowingBodies(
    text: string,
    value: Array<TextEditorValue>,
    section_index: number,
    anchor_index: number,
    focus_index: number,
    start: number
  ): Array<TextEditorValue> {
    console.log('SelectionSection removeFollowingBodies');

    const anchor_body = value[section_index].body[anchor_index];
    const next_body = value[section_index].body[focus_index + 1];

    const can_concat = this.insertUtilityService.canConcatBodies(
      anchor_body?.mod,
      next_body?.mod
    );

    value[section_index].body.splice(
      anchor_index,
      can_concat
        ? focus_index + 1 - anchor_index + 1
        : focus_index - anchor_index + 1,
      this.insertUtilityService.preCreateSectionBody(
        anchor_body.text,
        can_concat ? next_body.text : '',
        text,
        start,
        0,
        anchor_body.mod
      )
    );

    return value;
  }

  private keppFollowingBodies(
    text: string,
    value: Array<TextEditorValue>,
    section_index: number,
    anchor_index: number,
    focus_index: number,
    start: number,
    end: number
  ): Array<TextEditorValue> {
    console.log('SelectionSection keppFollowingBodies');

    const anchor_body = value[section_index].body[anchor_index];
    const focus_body = value[section_index].body[focus_index];

    const can_concat = this.insertUtilityService.canConcatBodies(
      anchor_body?.mod,
      focus_body?.mod
    );

    value[section_index].body.splice(
      anchor_index,
      focus_index - anchor_index + 1,
      ...(can_concat
        ? [
            this.insertUtilityService.preCreateSectionBody(
              anchor_body.text,
              focus_body.text,
              text,
              start,
              end,
              anchor_body.mod
            ),
          ]
        : [
            this.insertUtilityService.preCreateSectionBody(
              anchor_body.text,
              '',
              text,
              start,
              0,
              anchor_body.mod
            ),
            this.insertUtilityService.preCreateSectionBody(
              '',
              focus_body.text,
              '',
              0,
              end,
              focus_body.mod
            ),
          ])
    );

    return value;
  }
}
