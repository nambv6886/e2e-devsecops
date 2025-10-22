export class CommonUtils {
  public static isNotNullOrUndefined(value: any) {
    return typeof value !== 'undefined' && value != null;
  }

  public static isNullOrUndefined(value: any) {
    return typeof value === 'undefined' || value == null;
  }

  public static diffMilliseconds(date1: Date, date2: Date): number {
    const milisecond = date1.getTime() - date2.getTime();
    return milisecond;
  }

  public static diffTotalSeconds(date1: Date, date2: Date): number {
    const milisecond = CommonUtils.diffMilliseconds(date1, date2);
    return Math.floor(milisecond / 1000);
  }
}
