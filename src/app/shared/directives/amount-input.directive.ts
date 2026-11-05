import { Directive, ElementRef, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Larger amounts would lose precision as a JavaScript number. */
const MAX_DIGITS = 15;

/**
 * Amount field in whole pesos: shows thousands separators while typing (600.000, 1.500.000)
 * and gives the form the plain number (600000).
 */
@Directive({
  selector: 'input[appAmountInput]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AmountInputDirective), multi: true },
  ],
  host: {
    type: 'text',
    inputmode: 'numeric',
    autocomplete: 'off',
    '(input)': 'onInput()',
    '(blur)': 'onTouched()',
  },
})
export class AmountInputDirective implements ControlValueAccessor {
  private readonly input: HTMLInputElement = inject(ElementRef).nativeElement;
  private onChange: (value: number | null) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.input.value = value == null ? '' : formatAmount(String(value));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.input.disabled = disabled;
  }

  protected onInput(): void {
    const { value, selectionStart } = this.input;
    const digitsBeforeCursor = countDigits(value.slice(0, selectionStart ?? value.length));
    const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, MAX_DIGITS);

    this.input.value = formatAmount(digits);
    this.keepCursorAfterDigit(digitsBeforeCursor);
    this.onChange(digits ? Number(digits) : null);
  }

  /** Separators are added or removed while typing, so the cursor is placed by digits, not characters. */
  private keepCursorAfterDigit(digitCount: number): void {
    const formatted = this.input.value;
    let position = 0;
    for (let seen = 0; position < formatted.length && seen < digitCount; position++) {
      if (/\d/.test(formatted[position])) seen++;
    }
    this.input.setSelectionRange(position, position);
  }
}

function formatAmount(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function countDigits(text: string): number {
  return text.replace(/\D/g, '').length;
}
