const keywordPrefix = 'kw_5rLEyAJN19evvK66ooKdE_';

export class Keyword extends String {
  public readonly isKeyword = true;

  constructor(data: string) {
    super(keywordPrefix + data);
  }
}
