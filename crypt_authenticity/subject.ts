import nacl from "tweetnacl";
import { base64, uint8Array } from "./util.ts";

export default class Subject {
  private name: string;
  private privateKey: Uint8Array<ArrayBufferLike>;
  public publicKey: Uint8Array<ArrayBufferLike>;

  constructor(name: string) {
    this.name = name;

    const keys = nacl.box.keyPair();

    this.privateKey = keys.secretKey;
    this.publicKey = keys.publicKey;
  }

  public toString(): string {
    return `Hello, I'm ${this.name}. My public key is ${this.getPublicKey()}`;
  }

  public getName(): string {
    return this.name;
  }

  public getPublicKey(): string {
    return base64.encode(this.publicKey);
  }

  public newMessage<T>(
    messageObject: Record<string | number, T>,
    receiver: Subject,
  ): string {
    const messageBytes = Buffer.from(JSON.stringify(messageObject));
    const receiverPublicKey = base64.decode(receiver.getPublicKey());

    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encrypted = nacl.box(
      messageBytes,
      nonce,
      receiverPublicKey,
      this.privateKey,
    );

    return base64.encode(uint8Array.merge(nonce, encrypted));
  }

  public decryptMessage<T>(message: string, sender: Subject): T {
    const messageBytes = base64.decode(message);
    const senderPublicKey = base64.decode(sender.getPublicKey());

    const nonce = messageBytes.slice(0, nacl.box.nonceLength);
    const encrypted = messageBytes.slice(
      nacl.box.nonceLength,
      messageBytes.length,
    );

    const decrypted = nacl.box.open(
      encrypted,
      nonce,
      senderPublicKey,
      this.privateKey,
    );

    if (decrypted == null) {
      throw new Error("Decryption failed");
    }

    return JSON.parse(Buffer.from(decrypted).toString());
  }
}
