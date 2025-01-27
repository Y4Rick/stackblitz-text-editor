import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  ElementRef,
  HostBinding,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subscription, filter, fromEvent, map, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TextEditorService } from "./text-editor.service";
import {
  TextEditorTextModification,
  TextEditorValue,
  TextEditorHandle,
  TextEditorSectionType
} from "./text-editor.constants";
import { InsertTextUtilityService } from "./utility/insert-text/insert-text-utility.service";
import { InsertTextService } from "./utility/insert-text/insert-text.service";
import { InsertTextBodyService } from "./utility/insert-text/insert-text-body.service";
import { InsertTextSectionService } from "./utility/insert-text/insert-text-section.service";
import { InsertTextCollectionService } from "./utility/insert-text/insert-text-collection.service";
import { InsertSectionService } from "./utility/insert-section/insert-section.service";
import { UtilityService } from "./utility/utility.service";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: "app-text-editor",
  templateUrl: "text-editor.component.html",
  styleUrl: "text-editor.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: TextEditorComponent
    },
    UtilityService,
    TextEditorService,
    InsertTextUtilityService,
    InsertTextService,
    InsertTextBodyService,
    InsertTextSectionService,
    InsertTextCollectionService,
    InsertSectionService
  ]
})
export class TextEditorComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @HostBinding("class") public readonly host_selector = "text-editor";

  public readonly text_mod = TextEditorTextModification;
  public readonly section_type = TextEditorSectionType;

  @HostBinding("class.text-editor--focus") public get focus(): boolean {
    return this._focus();
  }

  @HostBinding("class.text-editor--disabled") public get disabled(): boolean {
    return this._disabled();
  }

  public onChange: Function = () => {};
  public onTouched: Function = () => {};

  public value: Array<TextEditorValue> = [];

  @ViewChild("textEditor", { static: true })
  private readonly text_editor_element!: ElementRef<HTMLSpanElement>;

  private textEditorService = inject(TextEditorService);
  private utilityService = inject(UtilityService);

  private focus$!: Subscription;
  private blur$!: Subscription;
  private input$!: Subscription;

  private _focus = signal(false);
  private _disabled = signal(false);

  private get host_element(): HTMLSpanElement {
    return this.el.nativeElement as HTMLSpanElement;
  }

  private get editor(): HTMLSpanElement {
    return this.text_editor_element.nativeElement as HTMLSpanElement;
  }

  constructor(public el: ElementRef, private destroyRef: DestroyRef) {}

  public ngOnInit(): void {
    this.focus$ = fromEvent(this.editor, "focus")
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(
          (event: Event) => event as FocusEvent & { target: HTMLSpanElement }
        ),
        tap((event: FocusEvent & { target: HTMLSpanElement }) =>
          this.textEditorService.manageFocusEditor(event.target, this.value)
        )
      )
      .subscribe((event: FocusEvent & { target: HTMLSpanElement }) => {
        console.log(event);
        this._focus.set(true);
      });

    this.blur$ = fromEvent(this.editor, "blur")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.onTouched();
        this._focus.set(false);
      });

    this.input$ = fromEvent(this.editor, "beforeinput")
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((event: Event) => event.preventDefault()),
        filter(() =>
          this.textEditorService.isEditorAvailable(
            this.host_element,
            this.value
          )
        ),
        map(
          (event: Event) =>
            this.textEditorService.handleInputEvent({
              event: event as InputEvent,
              value: this.value,
              editor: this.editor
            })!
        ),
        filter((result: TextEditorHandle | undefined) =>
          this.textEditorService.isHandleAvailable(result)
        ),
        map((value: TextEditorHandle | undefined) => value as TextEditorHandle)
      )

      .subscribe(({ monitor, anchor, focus, update }: TextEditorHandle) => {
        console.log("handleInputEvent result", monitor, anchor, focus, update);

        this.textEditorService.watchMutationObserver({
          monitor,
          anchor,
          focus
        });

        this.value = update;

        this.onChange(this.textEditorService.getControlValue(this.value));

        console.log("after handle_value", this.value);
      });
  }

  public ngOnDestroy(): void {
    this.focus$?.unsubscribe();
    this.blur$?.unsubscribe();
    this.input$?.unsubscribe();

    this.textEditorService.clearMutationObserver();
  }

  public writeValue(value: any | Array<TextEditorValue>): void {
    console.log("on writeValue", value);

    if (this.textEditorService.isValueValid(value)) {
      this.value = value;
    } else {
      this.value = [this.utilityService.createSectionParagraphBody(value)];

      this.onChange(this.textEditorService.getControlValue(this.value));
    }

    console.log("out writeValue", this.value);
  }

  public registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  public setDisabledState(disabled: boolean): void {
    this._disabled.set(disabled);
  }
}
