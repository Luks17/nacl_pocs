import nacl from "tweetnacl";
import { base64, uint8Array } from "./util.ts";

export default class Subject {
  private name: string;
  private privateKey: Uint8Array<ArrayBufferLike>;
  private publicKey: Uint8Array<ArrayBufferLike>;

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
    const publicKeyBytes = base64.decode(receiver.getPublicKey());

    const ephemeralKeyPair = nacl.box.keyPair();

    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encrypted = nacl.box(
      messageBytes,
      nonce,
      publicKeyBytes,
      ephemeralKeyPair.secretKey,
    );

    return base64.encode(
      uint8Array.merge(ephemeralKeyPair.publicKey, nonce, encrypted),
    );
  }

  public decryptMessage<T>(message: string): T {
    const messageBytes = base64.decode(message);

    const ephemeralPublicKey = messageBytes.slice(0, nacl.box.publicKeyLength);

    const nonce = messageBytes.slice(
      nacl.box.publicKeyLength,
      nacl.box.publicKeyLength + nacl.box.nonceLength,
    );
    const encrypted = messageBytes.slice(
      nacl.box.publicKeyLength + nacl.box.nonceLength,
    );

    const decrypted = nacl.box.open(
      encrypted,
      nonce,
      ephemeralPublicKey,
      this.privateKey,
    );

    if (decrypted == null) {
      throw new Error("Decryption failed");
    }

    return JSON.parse(Buffer.from(decrypted).toString());
  }
}
