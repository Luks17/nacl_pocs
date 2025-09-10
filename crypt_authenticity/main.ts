import type { MessageExample } from "./example.ts";
import Subject from "./subject.ts";

function main() {
  const bob = new Subject("Bob");
  const alice = new Subject("Alice");
  const julie = new Subject("Julie");

  const bobMessageContent: MessageExample = {
    auth_token: "1234567890",
    channel: "general",
    text: bob.toString(),
  };

  const encryptedMessage = bob.newMessage(bobMessageContent, alice);

  // alice can decrypt the message
  logMessage(encryptedMessage, bob, alice);
  // bob can decrypt the message
  logMessage(encryptedMessage, alice, bob);
  // julie can't decrypt the message
  logMessage(encryptedMessage, julie, bob);
}

function logMessage(message: string, receiver: Subject, sender: Subject) {
  try {
    const decryptedMessage = receiver.decryptMessage<MessageExample>(
      message,
      sender,
    );

    console.log(
      `${receiver.getName()} decrypted a message: ` +
      JSON.stringify(decryptedMessage),
    );
  } catch (error) {
    console.log(`${receiver.getName()} can't decrypt the message`);
  }
}

main();
