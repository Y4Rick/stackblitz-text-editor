import { Injectable, inject } from '@angular/core';
import { TextEditorHandle, TextEditorValue } from '../../text-editor.constants';
import { InsertUtilityService } from './insert-utility.service';

@Injectable()
export class InsertTextCollectionService {
  private insertUtilityService = inject(InsertUtilityService);

  public handelInsert(
    text: string,
    value: Array<TextEditorValue>,
    selection: Selection
  ): TextEditorHandle {
    console.log('SelectionCollection handel');

    const {
      anchor_section,
      focus_section,
      anchor_body,
      focus_body,
      start,
      end,
    } = this.getSelectionValue(selection);

    console.log(
      'SelectionCollection getSelectionValue',
      anchor_section,
      focus_section,
      anchor_body,
      focus_body,
      start,
      end
    );

    if (
      this.canRemoveFullSelectedSections(
        value,
        focus_section[1],
        focus_body[1],
        end
      )
    ) {
      return {
        node: anchor_body[0],
        update: this.removeFullSelectedSections(
          text,
          value,
          anchor_section[1],
          focus_section[1],
          anchor_body[1],
          start
        ),
        offset: start + 1,
      };
    } else if (
      this.canRemoveFocusBody(value, focus_section[1], focus_body[1], end)
    ) {
      return {
        node: anchor_body[0],
        update: this.removeFocusBody(
          text,
          value,
          anchor_section[1],
          focus_section[1],
          anchor_body[1],
          focus_body[1],
          start,
          end
        ),
        offset: start + 1,
      };
    } else {
      return {
        node: anchor_body[0],
        update: this.keppFocusBody(
          text,
          value,
          anchor_section[1],
          focus_section[1],
          anchor_body[1],
          focus_body[1],
          start,
          end
        ),
        offset: start + 1,
      };
    }
  }

  private getSelectionValue({
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset,
  }: Selection): {
    anchor_section: [HTMLSpanElement, number];
    focus_section: [HTMLSpanElement, number];
    anchor_body: [HTMLSpanElement, number];
    focus_body: [HTMLSpanElement, number];
    start: number;
    end: number;
  } {
    const anchor_section = anchorNode!.parentElement!
      .parentElement as HTMLElement;
    const focus_section = focusNode!.parentElement!
      .parentElement as HTMLElement;

    const anchor_section_index = this.insertUtilityService.getDataAttrIndex(
      anchorNode!.parentElement!.parentElement as HTMLElement,
      'section_index'
    );
    const focus_section_index = this.insertUtilityService.getDataAttrIndex(
      focusNode!.parentElement!.parentElement as HTMLElement,
      'section_index'
    );

    const forward = focus_section_index > anchor_section_index;

    const anchor_body = anchorNode!.parentElement as HTMLElement;
    const focus_body = focusNode!.parentElement as HTMLElement;

    const anchor_body_index = this.insertUtilityService.getDataAttrIndex(
      anchor_body,
      'body_index'
    );
    const focus_body_index = this.insertUtilityService.getDataAttrIndex(
      focus_body,
      'body_index'
    );

    return {
      anchor_section: forward
        ? [anchor_section, anchor_section_index]
        : [focus_section, focus_section_index],
      focus_section: forward
        ? [focus_section, focus_section_index]
        : [anchor_section, anchor_section_index],
      anchor_body: forward
        ? [anchor_body, anchor_body_index]
        : [focus_body, focus_body_index],
      focus_body: forward
        ? [focus_body, focus_body_index]
        : [anchor_body, anchor_body_index],
      start: forward ? anchorOffset : focusOffset,
      end: forward ? focusOffset : anchorOffset,
    };
  }

  private canRemoveFullSelectedSections(
    value: TextEditorValue[],
    section_index: number,
    focus_index: number,
    end: number
  ): boolean {
    console.log(
      'SelectionCollection canRemoveFullSelectedSections',
      value[section_index].body.length - 1 === focus_index &&
        end === value[section_index].body[focus_index].text.length
    );

    return (
      value[section_index].body.length - 1 === focus_index &&
      end === value[section_index].body[focus_index].text.length
    );
  }

  private removeFullSelectedSections(
    text: string,
    value: TextEditorValue[],
    anchor_section: number,
    focus_section: number,
    anchor_body: number,
    start: number
  ): TextEditorValue[] {
    console.log('SelectionCollection removeFullSelectedSections');

    const body = value[anchor_section].body;

    body.splice(
      anchor_body,
      body.length + 1,
      this.insertUtilityService.preCreateSectionBody(
        body[anchor_body].text,
        '',
        text,
        start,
        0,
        body[anchor_body].mod
      )
    );

    this.removeValueSections(
      value,
      anchor_section + 1,
      focus_section - anchor_section
    );

    return value;
  }

  private canRemoveFocusBody(
    value: TextEditorValue[],
    section_index: number,
    focus_index: number,
    end: number
  ): boolean {
    console.log(
      'SelectionCollection canRemoveFocusBody',
      end === value[section_index].body[focus_index].text.length
    );

    return end === value[section_index].body[focus_index].text.length;
  }

  private removeFocusBody(
    text: string,
    value: TextEditorValue[],
    anchor_section_index: number,
    focus_section_index: number,
    anchor_body_index: number,
    focus_body_index: number,
    start: number,
    end: number
  ): TextEditorValue[] {
    console.log('SelectionCollection removeFocusBody');

    const anchor_section = value[anchor_section_index];
    const anchor_section_body = anchor_section.body[anchor_body_index];

    const focus_section = value[focus_section_index];
    const focus_section_body = focus_section.body[focus_body_index];
    const focus_section_next_body = focus_section.body[focus_body_index + 1];

    const can_concat_body = this.insertUtilityService.canConcatBodies(
      anchor_section_body?.mod,
      focus_section_next_body?.mod
    );

    anchor_section.body.splice(
      anchor_body_index,
      anchor_section.body.length + 1,
      this.insertUtilityService.preCreateSectionBody(
        anchor_section_body.text,
        can_concat_body ? focus_section_next_body.text : '',
        text,
        start,
        0,
        anchor_section_body.mod
      ),
      ...(can_concat_body
        ? focus_section.body.splice(focus_body_index + 2)
        : [
            this.insertUtilityService.preCreateSectionBody(
              '',
              focus_section_body.text,
              '',
              0,
              end,
              focus_section_body.mod
            ),
            ...focus_section.body.splice(focus_body_index + 1),
          ])
    );

    this.removeValueSections(
      value,
      anchor_section_index + 1,
      focus_section_index - anchor_section_index
    );

    return value;
  }

  private keppFocusBody(
    text: string,
    value: TextEditorValue[],
    anchor_section_index: number,
    focus_section_index: number,
    anchor_body_index: number,
    focus_body_index: number,
    start: number,
    end: number
  ): TextEditorValue[] {
    console.log('SelectionCollection keppFocusBody');

    const anchor_section = value[anchor_section_index];
    const anchor_section_body = anchor_section.body[anchor_body_index];

    const focus_section = value[focus_section_index];
    const focus_section_body = focus_section.body[focus_body_index];

    const can_concat_body = this.insertUtilityService.canConcatBodies(
      anchor_section_body?.mod,
      focus_section_body?.mod
    );

    anchor_section.body.splice(
      anchor_body_index,
      anchor_section.body.length + 1,
      this.insertUtilityService.preCreateSectionBody(
        anchor_section_body.text,
        can_concat_body ? focus_section_body.text : '',
        text,
        start,
        can_concat_body ? end : 0,
        anchor_section_body.mod
      ),
      ...(can_concat_body
        ? focus_section.body.splice(focus_body_index + 1)
        : [
            this.insertUtilityService.preCreateSectionBody(
              '',
              focus_section_body.text,
              '',
              0,
              end,
              focus_section_body.mod
            ),
            ...focus_section.body.splice(focus_body_index + 2),
          ])
    );

    this.removeValueSections(
      value,
      anchor_section_index + 1,
      focus_section_index - anchor_section_index
    );

    return value;
  }

  private removeValueSections(
    value: TextEditorValue[],
    from: number,
    to: number
  ): void {
    value.splice(from, to);
  }
}
