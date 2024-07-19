import { Injectable, inject } from "@angular/core";
import {
  TextEditorSectionType,
  TextEditorValue
} from "../text-editor.constants";
import { DOCUMENT } from "@angular/common";

@Injectable()
export class UtilityService {
  private document = inject(DOCUMENT);

  public createSectionParagraphBody(text?: string): TextEditorValue {
    return {
      section: TextEditorSectionType.PPARAGRAPH,
      body: [
        {
          text: (text ?? "").toString(),
          mod: []
        }
      ]
    };
  }

  public isEditorValueExists(value: Array<TextEditorValue>): boolean {
    return value.some(
      (section) =>
        section.section === TextEditorSectionType.PPARAGRAPH &&
        section.body.some((body) => body.text.length)
    );
  }

  public getDOCSelection(): Selection {
    return this.document.getSelection()!;
  }

  public setEmptyTextNode(el: HTMLSpanElement): void {
    el.appendChild(this.document.createTextNode(""));
  }
}
