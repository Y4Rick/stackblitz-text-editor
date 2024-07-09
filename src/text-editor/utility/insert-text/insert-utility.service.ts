import { Injectable } from '@angular/core';
import {
  TextEditorTextModification,
  TextEditorValue,
} from '../../text-editor.constants';

@Injectable()
export class InsertUtilityService {
  public getDataAttrIndex(element: HTMLElement, attr: string): number {
    return Number(element.dataset[attr]);
  }

  public canConcatBodies(
    a: TextEditorTextModification[],
    b: TextEditorTextModification[]
  ): boolean {
    a?.sort();
    b?.sort();
    console.log(
      'canConcatBodies a b',
      a,
      b,
      JSON.stringify(a) === JSON.stringify(b)
    );

    return JSON.stringify(a) === JSON.stringify(b);
  }

  public preCreateSectionBody(
    anchor: string,
    focus: string,
    text: string,
    start: number,
    end: number,
    mod: Array<TextEditorTextModification>
  ): {
    text: string;
    mod: Array<TextEditorTextModification>;
  } {
    return {
      text: `${anchor.slice(0, start)}${text}${focus.slice(end, focus.length)}`,
      mod: mod,
    };
  }
}
