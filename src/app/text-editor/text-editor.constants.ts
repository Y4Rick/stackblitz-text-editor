export enum TextEditorSectionType {
  // TITLE = 'title',
  PARAGRAPH = "paragraph"

  // ORDER = 'order',
  // BULLET = 'bullet',
  // DEFINITION = 'definition',

  // QUOTATION = 'quotation',
  // CODE = 'code',

  // PICTURE = 'picture',
  // GALLERY = 'gallery',

  // VIDEO = 'video',
  // PLAYER = 'player',

  // AUDIO = 'audio',
  // TRACK = 'track',

  // FORMULA = 'formula',
  // TABLE = 'table',

  // ADDRESS = 'address',
}

export enum TextEditorTextModification {
  BOLD = "bold",
  ITALIC = "italic"

  // HIGHLIGHT = 'highlight',
  // QUOTATION = 'quotation',
  // TIME = 'time',

  // LINK = 'link',

  // ABBREVIATION = 'abbreviation',
  // CITATION = 'citation',

  // KEYBOARD = 'keyboard',
  // SAMPLE = 'sample',
  // VARIABLE = 'variable',

  // SUBSCRIPT = 'subscript',
  // SUPERSCRIPT = 'superscript',
}

export enum TextEditorInputEventType {
  INSERT_TEXT = "insertText",
  INSERT_PARAGRAPH = "insertParagraph",
  INSERT_LINE_BREAK = "insertLineBreak"
}

export interface TextEditorValue {
  section: TextEditorSectionType;
  body: Array<{
    text: string;
    mod: Array<TextEditorTextModification>;
  }>;
}

export interface TextEditorHandle {
  monitor: HTMLSpanElement;
  anchor: {
    host: HTMLSpanElement;
    query: string;
    offset: number;
  };
  focus: {
    host: HTMLSpanElement;
    query: string;
    offset: number;
  };
  update: Array<TextEditorValue>;
}
