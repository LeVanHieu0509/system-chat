import { Transform } from 'class-transformer';

export function ToArrayString(): (target: unknown, key: string) => void {
  return Transform(
    ({ value }) => {
      return value.split(',').map((v: string) => v);
    },
    { toClassOnly: true },
  );
}

export function ToBoolean(): (target: unknown, key: string) => void {
  return Transform(
    ({ value }) => {
      if (['true', 'on', 'yes', '1', true].includes(value.toLowerCase())) {
        return true;
      }
      if (['false', 'off', 'no', '0', false].includes(value.toLowerCase())) {
        return false;
      }
      return undefined;
    },
    { toClassOnly: true },
  );
}
