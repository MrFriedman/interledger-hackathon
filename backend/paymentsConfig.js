// Open Payments credentials are never hard-coded. Supply them at runtime.

const REQUIRED = [
  ["OPEN_PAYMENTS_WALLET_ADDRESS_URL", "walletAddressUrl"],
  ["OPEN_PAYMENTS_RECEIVING_WALLET_ADDRESS_URL", "receivingWalletAddressUrl"],
  ["OPEN_PAYMENTS_KEY_ID", "keyId"],
];

export function getOpenPaymentsConfig() {
  const config = {};
  const missing = [];

  for (const [envName, key] of REQUIRED) {
    const value = (process.env[envName] || "").trim();
    if (!value) {
      missing.push(envName);
    } else {
      config[key] = value;
    }
  }

  const inlineKey = process.env.OPEN_PAYMENTS_PRIVATE_KEY;
  const keyPath = (process.env.OPEN_PAYMENTS_PRIVATE_KEY_PATH || "").trim();
  if (inlineKey && inlineKey.trim()) {
    config.privateKey = inlineKey;
  } else if (keyPath) {
    config.privateKey = keyPath;
  } else {
    missing.push(
      "OPEN_PAYMENTS_PRIVATE_KEY or OPEN_PAYMENTS_PRIVATE_KEY_PATH"
    );
  }

  return { ...config, missing };
}
