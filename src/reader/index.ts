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

type Parser = (reader: TokenReader) => string;

const trimLeft = (reader: TokenReader) => {
  while (reader.peek().match(/[\s,]/)) {
    reader.next();
  }
}

const trimComment = (reader: TokenReader) => {
  if (reader.peek() !== ';') return;
  while (reader.next() !== '\n') {}
}

const parseFixedStringFacrory: (toParse: string) => Parser = (toParse: string) => (reader: TokenReader): string => {
  const dt = reader.peek(toParse.length);
  if (dt === toParse) {
    reader.next(toParse.length);
    return dt;
  }

  throw new Error();
}

const parseStringLiteral: Parser = (reader) => {
  if (reader.peek() !== '"') throw new Error();
  let accum = '"';
  reader.next();

  while(true) {
    const ch = reader.next();
    accum += ch;
    
    if (ch === '"' && reader.peekBefore() !== '\\') {
      return accum;
    }

    if (reader.isEmpty()) throw Error();
  }
}

const parseWord: Parser = (reader) => {
  let accum = '';
  while (true) {
    const ch = reader.next();
    accum += ch;
    
    if (!!reader.peek().match(/['\s,(){}']/)) {
      return accum;
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

const tryParseNextToken = (reader: TokenReader): string => {
  trimLeft(reader);
  trimComment(reader);
  for (const tryParse of parsers) {
    try {
      return tryParse(reader);
    } catch {
    }
  }
  const {line, column} = reader.getCoordinatesAtPos();
  throw new ReaderError(`Unexpected character at: ${line}:${column}`);
}

export const parseStringAsTokens = (input: string): string[] => {
  const reader = new TokenReader(input);
  const result: string[] = [];

  while (!reader.isEmpty()) {
    result.push(tryParseNextToken(reader));
  }

  return result;
}


class DataReader {
  private pos = 0;
  constructor(private readonly strings: string[]) {}

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

const tryParseNext = (reader: DataReader) => {
  
}

export const parseTokensAsData = (input: string[]): unknown[] => {
  const reader = new DataReader(input);
  const result: unknown[] = [];

  while(!reader.isEmpty()) {
    result.push(tryParseNext(reader));
  }

  return [];
}
