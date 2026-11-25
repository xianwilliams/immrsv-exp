/** Keep intentional editor line breaks without accepting HTML. */
export function contentLines(value: string) {
  return value
    .split("\n")
    .flatMap((line, index) => (index ? [<br key={index} />, line] : [line]));
}
