import { Injectable, inject } from '@angular/core';
import { TextEditorHandle, TextEditorValue } from '../../text-editor.constants';
import { InsertUtilityService } from './insert-utility.service';

@Injectable()
export class InsertTextBodyService {
  private insertUtilityService = inject(InsertUtilityService);

  public handelInsert(
    text: string,
    value: Array<TextEditorValue>,
    selection: Selection
  ): TextEditorHandle {
    console.log('SelectionBody handel');

    const { node, start, end } = this.getSelectionValue(selection);

    return {
      node,
      update: this.updateBodyValue(text, value, node, start, end),
      offset: start + 1,
    };
  }

  private getSelectionValue(selection: Selection): {
    node: HTMLSpanElement;
    start: number;
    end: number;
  } {
    const forward = selection.focusOffset > selection.anchorOffset;

    return {
      node: (forward
        ? selection.anchorNode!.parentElement
        : selection.focusNode!.parentElement) as HTMLSpanElement,
      start: forward ? selection.anchorOffset : selection.focusOffset,
      end: forward ? selection.focusOffset : selection.anchorOffset,
    };
  }

  private updateBodyValue(
    text: string,
    value: Array<TextEditorValue>,
    node: HTMLSpanElement,
    start: number,
    end: number
  ): Array<TextEditorValue> {
    const section_index = this.insertUtilityService.getDataAttrIndex(
      node.parentElement!,
      'section_index'
    );
    const body_index = this.insertUtilityService.getDataAttrIndex(
      node as HTMLElement,
      'body_index'
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
        end,
        body.mod
      )
    );

    return value;
  }
}
