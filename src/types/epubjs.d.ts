declare module 'epubjs' {
  export interface Rendition {
    on(
      event: 'selected',
      listener: (cfiRange: string) => void | Promise<void>
    ): void;
    on(event: string, listener: (...args: never[]) => unknown): void;
    getRange(cfiRange: string): { toString(): string };
    annotations: {
      highlight(
        cfiRange: string,
        data: Record<string, unknown>,
        cb: () => void,
        className: string,
        styles?: Record<string, string>
      ): void;
    };
  }
}
