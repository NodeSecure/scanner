export interface DateProvider {
  now(): number;
}

export class SystemDateProvider implements DateProvider {
  now(): number {
    return Date.now();
  }
}
