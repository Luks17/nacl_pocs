export abstract class base64 {
  static encode(data: Uint8Array): string {
    return Buffer.from(data).toString("base64");
  }

  static decode(data: string): Uint8Array {
    return Buffer.from(data, "base64");
  }
}

export abstract class uint8Array {
  static merge(a1: Uint8Array, a2: Uint8Array): Uint8Array {
    var mergedArray = new Uint8Array(a1.length + a2.length);
    mergedArray.set(a1);
    mergedArray.set(a2, a1.length);
    return mergedArray;
  }
}
