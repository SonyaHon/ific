import { unescapeString } from "../utils/string";

interface Token {
  line: number;
  column: number;
  text: string;
  file?: string;
}

class TokenReader {
  private pos = 0;
  constructor(private readonly data: string) { }

  peek(count = 1) {
    return this.data.slice(this.pos, this.pos + count);
  }

  peekBefore() {
    return this.data[this.pos - 1];
  }

  next(count = 1): string {
    const res = this.peek(count);
    this.pos += count;
    return res;
  }


  getCoordinatesAtPos(): { line: number, column: number } {
    const splitted = this.data.split('\n');
    let acc = 0;
    for (let line = 0; line < splitted.length; line++) {
      const lineText = splitted[line];
      if (acc + lineText.length >= this.pos) {

        return {
          line: line + 1,
          column: this.pos - acc + 1,
        }

      } else {
        acc += lineText.length + 1;
      }
    }

    throw new Error();
  }

  isEmpty(): boolean {
    return this.data.length <= this.pos;
  }
}

class ReaderError extends Error {

}

type Parser = (reader: TokenReader) => Token;

const trimLeft = (reader: TokenReader) => {
  while (reader.peek().match(/[\s,]/)) {
    reader.next();
  }
}

const trimComment = (reader: TokenReader) => {
  if (reader.peek() !== ';') return;
  while (reader.next() !== '\n') { }
}

const parseFixedStringFacrory: (toParse: string) => Parser =
  (toParse: string) => (reader: TokenReader): Token => {
    const dt = reader.peek(toParse.length);
    if (dt === toParse) {
      const coords = reader.getCoordinatesAtPos();
      reader.next(toParse.length);
      return {
        ...coords,
        text: dt,
      };
    }

    throw new Error();
  }

const parseStringLiteral: Parser = (reader) => {
  if (reader.peek() !== '"') throw new Error();
  let accum = '"';
  const coords = reader.getCoordinatesAtPos();
  reader.next();

  while (true) {
    const ch = reader.next();
    accum += ch;

    if (ch === '"' && reader.peekBefore() !== '\\') {
      return {
        ...coords,
        text: accum,
      };
    }

    if (reader.isEmpty()) throw Error();
  }
}

const parseWord: Parser = (reader) => {
  let accum = '';
  const coords = reader.getCoordinatesAtPos();
  while (true) {
    const ch = reader.next();
    accum += ch;

    if (!!reader.peek().match(/['\s,(){}']/)) {
      return {
        ...coords,
        text: accum,
      };
    }

    if (reader.isEmpty()) throw Error();
  }
}

const parsers: Parser[] = [
  parseFixedStringFacrory("("),
  parseFixedStringFacrory(")"),
  parseFixedStringFacrory("{"),
  parseFixedStringFacrory("}"),
  parseStringLiteral,
  parseWord,
];

const tryParseNextToken = (reader: TokenReader): Token => {
  trimLeft(reader);
  trimComment(reader);
  for (const tryParse of parsers) {
    try {
      return tryParse(reader);
    } catch {
    }
  }
  const { line, column } = reader.getCoordinatesAtPos();
  throw new ReaderError(`Unexpected character at: ${line}:${column}`);
}

export const parseStringAsTokens = (input: string): Token[] => {
  const reader = new TokenReader(input);
  const result: Token[] = [];

  while (!reader.isEmpty()) {
    result.push(tryParseNextToken(reader));
  }

  return result;
}


class DataReader {
  private pos = 0;
  constructor(private readonly strings: Token[]) { }

  peek() {
    return this.strings[this.pos];
  }

  next() {
    return this.strings[this.pos++];
  }

  isEmpty() {
    return this.pos >= this.strings.length;
  }
}

const NODS = Symbol();
export enum IficDataType {
  List,
  Hashmap,
  String,
  Keyword,
  Number,
  Boolean,
  Nil,
  Undeinfed,
  Symbol
}
export interface IficData {
  type: IficDataType,
  value: unknown,
};

const parseList = (reader: DataReader): IficData | null => {
  if (reader.peek().text !== '(') return null;
  const { line, column } = reader.next();

  const list: IficData[] = [];

  while (reader.peek().text !== ')' && !reader.isEmpty()) {
    list.push(tryParseNext(reader));
  }

  if (reader.isEmpty()) {
    throw new Error(`Unfinished list at: ${line}:${column}`);
  }

  reader.next();
  return {
    type: IficDataType.List,
    value: list,
  };
}

const parseHashMap = (reader: DataReader): IficData | null => {
  if (reader.peek().text !== '{') return null;
  const { line, column } = reader.next();
  const hashmap: { key: IficData, value: IficData }[] = [];

  while (reader.peek().text !== '}' && !reader.isEmpty()) {
    const key = tryParseNext(reader);
    if (![IficDataType.String, IficDataType.Keyword].includes(key.type)) {
      throw new Error(`Only <string> or <keyword> can be keys of hashmaps: ${line}:${column}`);
    }

    const value = tryParseNext(reader);
    hashmap.push({ key, value });
  }

  if (reader.isEmpty()) {
    throw new Error(`Unfinished hashmap at: ${line}:${column}`);
  }
  reader.next();
  return {
    type: IficDataType.Hashmap,
    value: hashmap,
  };
}

const parseString = (reader: DataReader): IficData | null => {
  if (reader.peek().text[0] === '"') {
    const value = reader.next().text;
    return {
      type: IficDataType.String,
      value,
    }
  }
  return null;
}

const parseKeyword = (reader: DataReader): IficData | null => {
  if (reader.peek().text[0] === ':') {
    return {
      type: IficDataType.Keyword,
      value: reader.next().text,
    }
  }
  return null;
}

const parseNumber = (reader: DataReader): IficData | null => {
  const { text } = reader.peek();
  const num = parseFloat(text.replace(/_/g, ''));
  if (isNaN(num)) return null;
  reader.next();
  return {
    type: IficDataType.Number,
    value: text.replace(/_/g, ''),
  }
}

const parseBoolean = (reader: DataReader): IficData | null => {
  const { text } = reader.peek();
  if (text === 'true' || text === 'false') {
    reader.next();
    return {
      type: IficDataType.Boolean,
      value: text,
    }
  }
  return null;
}

const parseNilOrUndeinfed = (reader: DataReader): IficData | null => {
  const { text } = reader.peek();
  if (text === 'nil') {
    reader.next();
    return {
      type: IficDataType.Nil,
      value: "null",
    };
  }
  if (text === 'undefined') {
    reader.next();
    return {
      type: IficDataType.Undeinfed,
      value: "undefined",
    };
  }
  return null;
}

const parseSymbol = (reader: DataReader): IficData => {
  const { text } = reader.next();
  return {
    type: IficDataType.Symbol,
    value: text,
  }
}

const tryParseNext = (reader: DataReader): IficData => {
  const { line, column } = reader.peek();

  for (const parseAnything of [
    parseList,
    parseHashMap,
    parseString,
    parseKeyword,
    parseNumber,
    parseBoolean,
    parseNilOrUndeinfed,
    parseSymbol,
  ]) {
    const result = parseAnything(reader);
    if (!!result) return result;
  }

  throw new Error(`Unexpected token at ${line}:${column}`);
}

export const parseTokensAsData = (input: Token[]): IficData[] => {
  const reader = new DataReader(input);
  const result: IficData[] = [];

  while (!reader.isEmpty()) {
    result.push(tryParseNext(reader));
  }

  return result;
}
