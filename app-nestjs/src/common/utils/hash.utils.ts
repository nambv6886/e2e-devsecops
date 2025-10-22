import * as CryptoJS from 'crypto-js';
import { CIPHER_KEY } from '../constants/common';
import { Logger } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

export class HashUtils {
  public static encryptCode(payload): string {
    return CryptoJS.AES.encrypt(JSON.stringify(payload), CIPHER_KEY).toString();
  }

  public static decryptCode(encryptedString: string): any {
    try {
      const bytes  = CryptoJS.AES.decrypt(encryptedString, CIPHER_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(originalText);
    } catch (error) {
      Logger.error(error);
      return null;
    }
  }

  public static hashPassword(password: string, salt: string): string {
    const hash = createHash('sha256').update(password);
    hash.update(salt);
    return hash.digest('hex');
  }

  public static genRandomString(numberOfCharacter: number): string {
    return randomBytes(numberOfCharacter).toString('hex');
  }
}