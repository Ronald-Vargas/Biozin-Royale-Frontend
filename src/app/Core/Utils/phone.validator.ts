import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { isValidPhoneNumber } from 'libphonenumber-js/min';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as string | null | undefined)?.trim();
    if (!value) return null;
    try {
      return isValidPhoneNumber(value) ? null : { phone: true };
    } catch {
      return { phone: true };
    }
  };
}
