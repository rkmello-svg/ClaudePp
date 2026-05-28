export class EAN13Validator {
  validate(barcode: string): { valid: boolean; error?: string } {
    if (!/^\d{13}$/.test(barcode)) {
      return { valid: false, error: 'EAN-13 must be 13 digits' };
    }

    const checksum = this.calculateChecksum(barcode.substring(0, 12));
    const providedChecksum = parseInt(barcode[12]);

    if (checksum !== providedChecksum) {
      return { valid: false, error: 'Invalid EAN-13 checksum' };
    }

    return { valid: true };
  }

  private calculateChecksum(barcode: string): number {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(barcode[i]);
      const multiplier = (i % 2 === 0) ? 1 : 3;
      sum += digit * multiplier;
    }
    return (10 - (sum % 10)) % 10;
  }
}
