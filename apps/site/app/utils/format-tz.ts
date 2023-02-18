import { format, utcToZonedTime } from "date-fns-tz";

const formatTz = (date: Date, fmt: string, tz: string) => format(utcToZonedTime(date, tz), fmt, { timeZone: tz });

export default formatTz;
