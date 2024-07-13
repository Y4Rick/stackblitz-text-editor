import { Component, OnInit, ViewChild } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import "zone.js";
import { TextEditorComponent } from "./text-editor/text-editor.component";
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule
} from "@angular/forms";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [TextEditorComponent, FormsModule, ReactiveFormsModule],
  template: `
    <div class="box">
      <div>
        <button (click)="setValue(undefined)">set undefine</button>
        <button (click)="setValue('My string')">set string</button>
        <button (click)="setValue({ text: 'Zone text' })">
          set incorect zone
        </button>
        <button (click)="setDelta()">set delta</button>
        <button (click)="setBigDelta()">set big zone</button>
        <button (click)="setFullDelta()">set full zone</button>
      </div>
      <app-text-editor
        style="height: 250px; width: 250px"
        [formControl]="control"
      ></app-text-editor>
      <!-- <app-document-area style="height: 250px; width: 250px" [formControl]="control2"></app-document-area> -->
    </div>

    <input type="text" [formControl]="text" />

    <!-- <form [formGroup]="form">
    <app-document-area style="height: 250px; width: 250px" formControlName="text"></app-document-area>
    </form> -->
    <button (click)="setValueText('My string')">set string</button>

    <!-- <textarea #textarea_input [formControl]="textarea"></textarea>
    <input #text_input type="text" [formControl]="text">
    <input #number_input type="number" [formControl]="number">
    <button (click)="setD(true)">set de control</button>
    <button (click)="setD(false)">set un control</button> -->
  `
})
export class App implements OnInit {
  name = "Angular";

  form = this.fb.group({
    text: "this.fb.group"
  });

  // @ViewChild('text_input') text_input!: Element;
  // @ViewChild('textarea_input') textarea_input!: Element;
  // @ViewChild('number_input') number_input!: Element;

  // private mock_blocks: DocumentAreaValue = {
  //   text: 'But I must explain to you how all this mistaken idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences. The wise man therefore always holds in these matters to this principle of selection.',
  //   zones: [
  //     {
  //       type: DocumentAreaZoneType.PPARAGRAPH,
  //       deltas: [
  //         {
  //           text: 'But I must explain to you how all this',
  //           mod: new Set([]),
  //         },
  //         {
  //           text: 'mistaken',
  //           mod: new Set([DocumentAreaDeltaMod.ITALIC]),
  //         },
  //         {
  //           text: 'idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error.',
  //           mod: new Set([]),
  //         },
  //       ],
  //     },
  //     {
  //       type: DocumentAreaZoneType.PPARAGRAPH,
  //       deltas: [
  //         {
  //           text: 'No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences.',
  //           mod: new Set([]),
  //         },
  //       ],
  //     },
  //     {
  //       type: DocumentAreaZoneType.PPARAGRAPH,
  //       deltas: [
  //         {
  //           text: 'The wise man therefore',
  //           mod: new Set([]),
  //         },
  //         {
  //           text: 'always holds',
  //           mod: new Set([DocumentAreaDeltaMod.BOLD]),
  //         },
  //         {
  //           text: 'in these matters to this principle of selection.',
  //           mod: new Set([]),
  //         },
  //       ],
  //     },
  //   ],
  // };

  control = new FormControl<any>(null);
  // control2 = new FormControl<any>('control2');

  // textarea = new FormControl<any>('hijpoioj');
  text = new FormControl<any>("");
  // number = new FormControl<any>('hijpoioj');

  constructor(private fb: FormBuilder) {
    this.control.valueChanges.subscribe((v) => {
      console.log("valueChanges", v);

      // setTimeout(() => {
      //   console.log('doc value', this.control.value);
      // }, 2000);
    });

    // this.number.valueChanges.subscribe((v) => {
    //   console.log('number valueChanges', v);
    //   console.log('number_input', this.number_input);
    //   // setTimeout(() => {
    //   //   console.log('doc value', this.control.value);
    //   // }, 2000);
    // });

    this.text.valueChanges.subscribe((v) => {
      console.log("text valueChanges", v);

      setTimeout(() => {
        console.log("doc value", this.control.value);
      }, 2000);
    });

    this.form.valueChanges.subscribe((v) => {
      console.log("form valueChanges", v);
      // console.log('text_input', this.text_input);

      // setTimeout(() => {
      //   console.log('doc value', this.control.value);
      //   console.log('number value', this.number.value);
      // }, 2000);
    });

    // this.textarea.valueChanges.subscribe((v) => {
    //   console.log('textarea valueChanges', v);
    //   console.log('textarea_input', this.textarea_input);

    //   // setTimeout(() => {
    //   //   console.log('doc value', this.control.value);
    //   //   console.log('number value', this.number.value);
    //   // }, 2000);
    // });
  }

  ngOnInit(): void {
    // console.log('ngOnInit doc control', this.control);
    // console.log('ngOnInit text control', this.text);
    // console.log('ngOnInit number control', this.number);
  }

  public setValue(value: any): any {
    this.control.setValue(value);
  }

  public setBigDelta(): any {
    this.control.setValue(
      [
        {
          section: "paragraph",
          body: [
            {
              text: "But I must explain to you how all this ",
              mod: []
            },
            {
              text: "mistaken",
              mod: ["italic"]
            },
            {
              text: " idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error.",
              mod: []
            }
          ]
        },
        {
          section: "paragraph",
          body: [
            {
              text: "No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences.",
              mod: []
            }
          ]
        },
        {
          section: "paragraph",
          body: [
            {
              text: "The wise man therefore ",
              mod: []
            },
            {
              text: "always holds",
              mod: ["bold"]
            },
            {
              text: " in these ",
              mod: []
            },
            {
              text: "ma",
              mod: ["italic"]
            },
            {
              text: "tt",
              mod: ["bold"]
            },
            {
              text: "ers",
              mod: ["italic"]
            },
            {
              text: " to this principle of selection.",
              mod: []
            }
          ]
        }
      ]
      //   {
      //   text: 'But I must explain to you how all this mistaken idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences. The wise man therefore always holds in these matters to this principle of selection.',
      //   zones: [
      //     {
      //       type: 'paragraph',
      //       deltas: [
      //         {
      //           text: 'But I must explain to you how all this ',
      //         },
      //         {
      //           text: 'mistaken',
      //           mod: ['italic'],
      //         },
      //         {
      //           text: ' idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error.',
      //         },
      //       ],
      //     },
      //     {
      //       type: 'paragraph',
      //       deltas: [
      //         {
      //           text: 'No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences.',
      //         },
      //       ],
      //     },
      //     {
      //       type: 'paragraph',
      //       deltas: [
      //         {
      //           text: 'The wise man therefore ',
      //         },
      //         {
      //           text: 'always holds',
      //           mod: ['bold'],
      //         },
      //         {
      //           text: ' in these ',
      //         },
      //         {
      //           text: 'ma',
      //           mod: ['italic'],
      //         },
      //         {
      //           text: 'tt',
      //           mod: ['bold'],
      //         },
      //         {
      //           text: 'ers',
      //           mod: ['italic'],
      //         },
      //         {
      //           text: ' to this principle of selection.',
      //         },
      //       ],
      //     },
      //   ],
      // }
    );
  }

  public setFullDelta() {
    this.control.setValue(
      [
        {
          section: "paragraph",
          body: [
            {
              text: "But I must explain to you how all this ",
              mod: []
            },
            {
              text: "mistaken",
              mod: ["italic"]
            },
            {
              text: " idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error.",
              mod: []
            }
          ]
        },
        {
          section: "paragraph",
          body: [
            {
              text: "No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences.",
              mod: []
            }
          ]
        },
        {
          section: "paragraph",
          body: [
            {
              text: "The wise man therefore ",
              mod: []
            },
            {
              text: "always holds",
              mod: ["bold"]
            },
            {
              text: " in these ",
              mod: []
            },
            {
              text: "ma",
              mod: ["italic"]
            },
            {
              text: "tt",
              mod: ["bold"]
            },
            {
              text: "ers",
              mod: ["italic"]
            },
            {
              text: " to this principle of selection.",
              mod: []
            }
          ]
        },
        {
          section: "paragraph",
          body: [
            {
              text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. ",
              mod: []
            },
            {
              text: "always holds ",
              mod: ["bold"]
            },
            {
              text: "To this principle of selection.",
              mod: []
            }
          ]
        },
        {
          section: "paragraph",
          body: [
            {
              text: "The wise man therefore ",
              mod: []
            },
            {
              text: "Lorem Ipsum ",
              mod: ["bold"]
            },
            {
              text: "- Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
              mod: []
            }
          ]
        }
      ]
      //   {
      //   text: 'But I must explain to you how all this mistaken idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences. The wise man therefore always holds in these matters to this principle of selection.',
      //   zones: [
      //     {
      //       type: 'paragraph',
      //       deltas: [
      //         {
      //           text: 'But I must explain to you how all this ',
      //         },
      //         {
      //           text: 'mistaken',
      //           mod: ['italic'],
      //         },
      //         {
      //           text: ' idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error.',
      //         },
      //       ],
      //     },
      //     {
      //       type: 'paragraph',
      //       deltas: [
      //         {
      //           text: 'No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences.',
      //         },
      //       ],
      //     },
      //     {
      //       type: 'paragraph',
      //       deltas: [
      //         {
      //           text: 'The wise man therefore ',
      //         },
      //         {
      //           text: 'always holds',
      //           mod: ['bold'],
      //         },
      //         {
      //           text: ' in these ',
      //         },
      //         {
      //           text: 'ma',
      //           mod: ['italic'],
      //         },
      //         {
      //           text: 'tt',
      //           mod: ['bold'],
      //         },
      //         {
      //           text: 'ers',
      //           mod: ['italic'],
      //         },
      //         {
      //           text: ' to this principle of selection.',
      //         },
      //       ],
      //     },
      //   ],
      // }
    );
  }

  public setValueText(value: any): any {
    this.form.setValue({ text: value });
  }

  public setD(value: boolean): any {
    value ? this.control.disable() : this.control.enable();
  }

  public setDelta(): any {
    this.control.setValue(
      [
        {
          section: "paragraph",
          body: [
            {
              text: "But I must explain to you how all this ",
              mod: []
            },
            {
              text: "mistaken",
              mod: ["italic"]
            },
            {
              text: " idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error.",
              mod: []
            }
          ]
        }
        // {
        //   type: 'paragraph',
        //   deltas: [
        //     {
        //       text: 'No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences.',
        //     },
        //   ],
        // },
        // {
        //   type: 'paragraph',
        //   deltas: [
        //     {
        //       text: 'The wise man therefore ',
        //     },
        //     {
        //       text: 'always holds',
        //       mod: ['bold'],
        //     },
        //     {
        //       text: ' in these ',
        //     },
        //     {
        //       text: 'ma',
        //       mod: ['italic'],
        //     },
        //     {
        //       text: 'tt',
        //       mod: ['bold'],
        //     },
        //     {
        //       text: 'ers',
        //       mod: ['italic'],
        //     },
        //     {
        //       text: ' to this principle of selection.',
        //     },
        //   ],
        // },
      ]
      //   {
      //   text: 'But I must explain to you how all this mistaken idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences. The wise man therefore always holds in these matters to this principle of selection.',
      //   zones: [
      //     {
      //       type: 'paragraph',
      //       deltas: [
      //         {
      //           text: 'But I must explain to you how all this ',
      //         },
      //         {
      //           text: 'mistaken',
      //           mod: ['italic'],
      //         },
      //         {
      //           text: ' idea. Lorem ipsum dolor sit amet Sed ut perspiciatis unde omnis iste natus error.',
      //         },
      //       ],
      //     },
      //     {
      //       type: 'paragraph',
      //       deltas: [
      //         {
      //           text: 'No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know consequences.',
      //         },
      //       ],
      //     },
      //     {
      //       type: 'paragraph',
      //       deltas: [
      //         {
      //           text: 'The wise man therefore ',
      //         },
      //         {
      //           text: 'always holds',
      //           mod: ['bold'],
      //         },
      //         {
      //           text: ' in these ',
      //         },
      //         {
      //           text: 'ma',
      //           mod: ['italic'],
      //         },
      //         {
      //           text: 'tt',
      //           mod: ['bold'],
      //         },
      //         {
      //           text: 'ers',
      //           mod: ['italic'],
      //         },
      //         {
      //           text: ' to this principle of selection.',
      //         },
      //       ],
      //     },
      //   ],
      // }
    );
  }
}

bootstrapApplication(App);
