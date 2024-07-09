import { Injectable, inject } from '@angular/core';
import {
  TextEditorValue,
  TextEditorSectionType,
  TextEditorTextModification,
  TextEditorInputEventType,
  TextEditorHandle,
} from './text-editor.constants';
import { InsertTextBodyService } from './utility/insert-text/insert-text-body.service';
import { InsertTextSectionService } from './utility/insert-text/insert-text-section.service';
import { InsertTextCollectionService } from './utility/insert-text/insert-text-collection.service';
import { InsertTextService } from './utility/insert-text/insert-text.service';
import { InsertSectionService } from './utility/insert-section/insert-section.service';

@Injectable()
export class TextEditorService {
  private readonly mutation_observers: Map<string, MutationObserver> =
    new Map();

  private insertTextService = inject(InsertTextService);
  private insertTextBodyService = inject(InsertTextBodyService);
  private insertTextSectionService = inject(InsertTextSectionService);
  private insertTextCollectionService = inject(InsertTextCollectionService);
  private insertSectionService = inject(InsertSectionService);

  constructor() {}

  public isValueValid(value: any | Array<TextEditorValue>): boolean {
    const is_sections =
      value &&
      Array.isArray(value) &&
      value.every((item) =>
        Object.values(TextEditorSectionType).some(
          (type) => type === item.section
        )
      );

    if (!is_sections) return is_sections;

    const is_bodies: boolean[] = value?.reduce(
      (acc: boolean[], item: any | TextEditorValue) => {
        if (item.section === TextEditorSectionType.PPARAGRAPH) {
          acc.push(
            Array.isArray(item?.body) &&
              !!item.body.length &&
              item.body.every(
                (
                  body:
                    | any
                    | {
                        text: string;
                        mod?: Array<TextEditorTextModification>;
                      }
                ) => typeof body.text === 'string' && body.text.length
              )
          );
        }

        return acc;
      },
      []
    );

    return is_bodies.every((item) => item);
  }

  public getDefaultValue(value: any): Array<TextEditorValue> {
    return [
      {
        section: TextEditorSectionType.PPARAGRAPH,
        body: [
          {
            text: (value ?? '').toString(),
            mod: [],
          },
        ],
      },
    ];
  }

  public getChangeValue(
    value: Array<TextEditorValue>
  ): Array<TextEditorValue> | '' {
    return value[0].body[0].text.length ? value : '';
  }

  public isEditorAvailable(
    doc_element: HTMLSpanElement,
    value: Array<TextEditorValue>
  ): boolean {
    const box_exist = !!doc_element.querySelector('span.text-editor__box');

    if (!box_exist) return box_exist;

    const editor = doc_element.querySelector(
      'span.text-editor__selection[contenteditable="true"]'
    );

    if (!editor) return false;

    const editor_section = Array.from(editor.children).every(
      (item) =>
        item.localName === 'span' &&
        item.classList.contains('text-editor__section') &&
        item.hasAttribute('data-section_index')
    );

    if (!editor_section) return editor_section;

    const count_section =
      doc_element.querySelectorAll('span.text-editor__section')?.length || 0;

    if (count_section !== value.length) return false;

    const section_body = Object.values(
      doc_element.querySelectorAll('span.text-editor__section')
    ).every((section) =>
      Array.from(section.children).every(
        (item) =>
          item.localName === 'span' &&
          item.classList.contains('text-editor__body') &&
          (item as HTMLElement).dataset['body_index'] &&
          !item.children.length
      )
    );

    if (!section_body) return section_body;

    const count_body = Object.values(
      doc_element.querySelectorAll('span.text-editor__section')
    ).every(
      (section, index) =>
        section.querySelectorAll('span.text-editor__body')?.length ===
        value[index].body.length
    );

    if (!count_body) return count_body;

    const body_available = Object.values(
      doc_element.querySelectorAll('span.text-editor__section')
    ).every((section, section_index) =>
      Array.from(section.children).every(
        (item, body_index) =>
          (item as HTMLElement).innerText ===
          value[section_index].body[body_index].text
      )
    );

    return body_available;
  }

  public handleInputEvent(
    event: InputEvent,
    value: TextEditorValue[],
    editor: HTMLSpanElement
  ): TextEditorHandle | undefined {
    console.log('handleInputEvent', event, 'value', value);

    switch (event.inputType) {
      case TextEditorInputEventType.INSERT_TEXT:
        return this.getDOCSelection().isCollapsed
          ? this.insertTextService.handelInsert(
              event.data!,
              this.cloneValue(value),
              this.getDOCSelection(),
              editor
            )
          : this.handleSelectiveInsertTextEvent(
              event.data!,
              this.cloneValue(value),
              this.getDOCSelection()
            );

      case TextEditorInputEventType.INSERT_PARAGRAPH:
      case TextEditorInputEventType.INSERT_LINEB_REAK:
        return this.getDOCSelection().isCollapsed
          ? this.insertSectionService.handelInsert()
          : this.handleSelectiveInsertSectionEvent();

      default:
        return;
    }
  }

  public isHandleAvailable(value: TextEditorHandle): boolean {
    return value?.node && value?.update && value?.offset > -1;
  }

  public watchMutationObserver(node: Node, collapse_index: number): void {
    const observer_id = `observer_${new Date().getTime()}`;

    const mutation_observer = new MutationObserver(
      (mutations: Array<MutationRecord>) => {
        mutation_observer.disconnect();

        console.log('mutations', mutations);

        this.removeMutationObserver(observer_id);

        const added_node = mutations?.at(0)?.addedNodes;

        if (added_node) {
          const selection = this.getDOCSelection();

          selection.removeAllRanges();
          selection.collapse(added_node.item(0), collapse_index);
        }
      }
    );

    this.pushMutationObserver(mutation_observer, observer_id);

    mutation_observer.observe(node, {
      childList: true,
      characterData: true,
    });
  }

  public clearMutationObserver(): void {
    if (this.mutation_observers.size) {
      this.mutation_observers.forEach((observer) => observer.disconnect);

      this.mutation_observers.clear();
    }

    console.log('clearMutationObserver', this.mutation_observers);
  }

  public cloneValue(value: Array<TextEditorValue>): Array<TextEditorValue> {
    return JSON.parse(JSON.stringify(value));
  }

  private handleSelectiveInsertTextEvent(
    text: string,
    value: Array<TextEditorValue>,
    selection: Selection
  ): TextEditorHandle | undefined {
    if (this.isSelectionBody(selection)) {
      // same body
      return this.insertTextBodyService.handelInsert(text, value, selection);
    } else if (this.isSelectionSection(selection)) {
      // same section
      return this.insertTextSectionService.handelInsert(text, value, selection);
    } else if (this.isSelectionCollection(selection)) {
      // full collection
      return this.insertTextCollectionService.handelInsert(
        text,
        value,
        selection
      );
    } else {
      return;
    }
  }

  private handleSelectiveInsertSectionEvent(): TextEditorHandle | undefined {
    // text: string,
    // value: Array<TextEditorValue>,
    // selection: Selection
    // if (this.isSelectionBody(selection)) {
    //   // same body
    //   return this.insertTextBodyService.handelInsert(text, value, selection);
    // } else if (this.isSelectionSection(selection)) {
    //   // same section
    //   return this.insertTextSectionService.handelInsert(text, value, selection);
    // } else if (this.isSelectionCollection(selection)) {
    //   // full collection
    //   return this.insertTextCollectionService.handelInsert(
    //     text,
    //     value,
    //     selection
    //   );
    // } else {
    //   return;
    // }

    return {} as any;
  }

  private isSelectionCollection({ anchorNode, focusNode }: Selection): boolean {
    const anchor_saction = anchorNode?.parentElement!
      .parentElement as HTMLElement;

    const focus_saction = focusNode?.parentElement!
      .parentElement as HTMLElement;

    return !anchor_saction!.isSameNode(focus_saction);
  }

  private isSelectionSection({ anchorNode, focusNode }: Selection): boolean {
    const anchor_saction = anchorNode?.parentElement!
      .parentElement as HTMLElement;

    const focus_saction = focusNode?.parentElement!
      .parentElement as HTMLElement;

    return anchor_saction!.isSameNode(focus_saction);
  }

  private isSelectionBody({ anchorNode, focusNode }: Selection): boolean {
    return anchorNode!.isSameNode(focusNode);
  }

  private getDOCSelection(): Selection {
    return document.getSelection()!;
  }

  private pushMutationObserver(observer: MutationObserver, id: string): void {
    this.mutation_observers.set(id, observer);
  }

  private removeMutationObserver(id: string): void {
    this.mutation_observers.delete(id);

    console.log('removeMutationObserver', this.mutation_observers);
  }
}
