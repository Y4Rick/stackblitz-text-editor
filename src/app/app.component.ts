import { Component } from "@angular/core";
import { TextEditorComponent } from "./text-editor/text-editor.component";
import { FormBuilder, FormControl, ReactiveFormsModule } from "@angular/forms";
import { TextEditorValue } from "./text-editor/text-editor.constants";

@Component({
  standalone: true,
  selector: "app-layout",
  templateUrl: "app.component.html",
  styleUrl: "app.component.scss",
  imports: [TextEditorComponent, ReactiveFormsModule]
})
export class AppComponent {
  public editor_control: FormControl;

  constructor(private fb: FormBuilder) {
    this.editor_control = this.fb.control<Array<TextEditorValue> | "">("");

    this.editor_control.valueChanges.subscribe((value) => {
      console.log("editor_control valueChanges", value);
    });
  }

  public setValue(value: any): void {
    this.editor_control.setValue(value);
  }

  public setSection(): void {
    this.editor_control.setValue([
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
    ]);
  }

  public setFewSections(): void {
    this.editor_control.setValue([
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
    ]);
  }

  public setFullCollection(): void {
    this.editor_control.setValue([
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
    ]);
  }
}
