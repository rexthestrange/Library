'use strict';

import crypto from 'crypto';
import ece from 'http_ece';
import urlBase64 from 'urlsafe-base64';

const encrypt = function(userPublicKey, userAuth, payload, contentEncoding) {
  if (!userPublicKey) {
    throw new Error('No user public key provided for encryption.');
  }

  if (typeof userPublicKey !== 'string') {
    throw new Error('The subscription p256dh value must be a string.');
  }

  if (urlBase64.decode(userPublicKey).length !== 65) {
    throw new Error('The subscription p256dh value should be 65 bytes long.');
  }

  if (!userAuth) {
    throw new Error('No user auth provided for encryption.');
  }

  if (typeof userAuth !== 'string') {
    throw new Error('The subscription auth key must be a string.');
  }

  if (urlBase64.decode(userAuth).length < 16) {
    throw new Error('The subscription auth key should be at least 16 '
    + 'bytes long');
  }

  if (typeof payload !== 'string' && !Buffer.isBuffer(payload)) {
    throw new Error('Payload must be either a string or a Node Buffer.');
  }

  if (typeof payload === 'string' || payload instanceof String) {
    payload = Buffer.from(payload);
  }

  const localCurve = crypto.createECDH('prime256v1');
  const localPublicKey = localCurve.generateKeys();

  const salt = urlBase64.encode(crypto.randomBytes(16));

  const cipherText = ece.encrypt(payload, {
    version: contentEncoding,
    dh: userPublicKey,
    privateKey: localCurve,
    salt: salt,
    authSecret: userAuth
  });

  return {
    localPublicKey: localPublicKey,
    salt: salt,
    cipherText: cipherText
  };
};

export default {
  encrypt: encrypt
};