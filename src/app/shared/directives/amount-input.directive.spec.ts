import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AmountInputDirective } from './amount-input.directive';

@Component({
  imports: [ReactiveFormsModule, AmountInputDirective],
  template: `<input appAmountInput [formControl]="amount" />`,
})
class HostComponent {
  readonly amount = new FormControl<number | null>(null);
}

describe('AmountInputDirective (monto con separadores de miles)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const type = (value: string, cursor = value.length) => {
      input.value = value;
      input.setSelectionRange(cursor, cursor);
      input.dispatchEvent(new Event('input'));
    };
    return { control: fixture.componentInstance.amount, input, type };
  }

  it('muestra puntos de miles y millones, y el formulario recibe el número', async () => {
    const { control, input, type } = await setup();

    type('600000');
    expect(input.value).toBe('600.000');
    expect(control.value).toBe(600000);

    type('1500000');
    expect(input.value).toBe('1.500.000');
    expect(control.value).toBe(1500000);

    type('999');
    expect(input.value).toBe('999');
  });

  it('recalcula los puntos al seguir escribiendo o borrar', async () => {
    const { control, input, type } = await setup();

    type('600.0000');
    expect(input.value).toBe('6.000.000');
    expect(control.value).toBe(6000000);

    type('6.000.00');
    expect(input.value).toBe('600.000');
  });

  it('ignora letras y signos, y quita los ceros a la izquierda', async () => {
    const { control, input, type } = await setup();

    type('-12a3,5');
    expect(input.value).toBe('1.235');
    expect(control.value).toBe(1235);

    type('000450');
    expect(input.value).toBe('450');
  });

  it('un campo vacío deja el monto en null', async () => {
    const { control, input, type } = await setup();

    type('');
    expect(input.value).toBe('');
    expect(control.value).toBeNull();
  });

  it('mantiene el cursor después del dígito que se escribió', async () => {
    const { input, type } = await setup();

    type('16000', 1);
    expect(input.value).toBe('16.000');
    expect(input.selectionStart).toBe(1);

    type('16.0000', 4);
    expect(input.value).toBe('160.000');
    expect(input.selectionStart).toBe(3);
  });

  it('muestra con formato un valor asignado desde el formulario, y lo limpia al reiniciar', async () => {
    const { control, input } = await setup();

    control.setValue(5000000);
    expect(input.value).toBe('5.000.000');

    control.reset();
    expect(input.value).toBe('');
  });
});
