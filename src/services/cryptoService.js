const { x25519 } = require("@noble/curves/ed25519");
const { webcrypto } = require("node:crypto");
const { TextDecoder } = require("util");

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

const decryptMessage = async (
  encryptedDataString,
  userPublicKeyHex,
  casePrivateKeyHex
) => {
  const { iv, content } = JSON.parse(encryptedDataString);
  const ivBytes = new Uint8Array(iv);
  const contentBytes = new Uint8Array(content);

  const sharedSecret = x25519.getSharedSecret(
    hexToBytes(casePrivateKeyHex),
    hexToBytes(userPublicKeyHex)
  );

  const key = await webcrypto.subtle.importKey(
    "raw",
    sharedSecret,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decryptedContent = await webcrypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBytes,
    },
    key,
    contentBytes
  );

  return new TextDecoder().decode(decryptedContent);
};

module.exports = {
  decryptMessage,
};
