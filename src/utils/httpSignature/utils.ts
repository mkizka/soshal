export const textOf = (header: { [key: string]: string }, order: string[]) => {
  // 検証する時は order(リクエストヘッダーのSignatureをパースして取得したheadersの値) の順で文字列を作る
  return order
    .filter((key) => key in header)
    .map((key) => `${key}: ${header[key]}`)
    .join("\n");
};
