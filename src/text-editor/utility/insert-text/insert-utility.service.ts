import { Injectable } from "@angular/core";
import { TextEditorTextModification } from "../../text-editor.constants";

@Injectable()
export class InsertUtilityService {
  public getDataAttrIndex(element: HTMLSpanElement, attr: string): number {
    return Number(element.dataset[attr]);
  }

  public canConcatBodies(
    a: TextEditorTextModification[],
    b: TextEditorTextModification[]
  ): boolean {
    a?.sort();
    b?.sort();
    console.log(
      "canConcatBodies a b",
      a,
      b,
      JSON.stringify(a) === JSON.stringify(b)
    );

    return JSON.stringify(a) === JSON.stringify(b);
  }

  public createSectionBody(
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
      mod: mod
    };
  }

  public getBodyHandleObject({
    host,
    index,
    offset
  }: {
    host: HTMLSpanElement;
    index: number;
    offset: number;
  }): {
    host: HTMLSpanElement;
    query: string;
    offset: number;
  } {
    return {
      host,
      query: `span.text-editor__body[data-body_index='${index}']`,
      offset
    };
  }
}
