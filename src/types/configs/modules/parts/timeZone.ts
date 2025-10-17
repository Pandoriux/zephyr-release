import * as v from "@valibot/valibot";

const supportedIanaTimeZones = Intl.supportedValuesOf("timeZone");

export const TimeZoneSchema = v.picklist(["UTC", ...supportedIanaTimeZones]);

type _TimeZoneInput = v.InferInput<typeof TimeZoneSchema>;
type _TimeZoneOutput = v.InferOutput<typeof TimeZoneSchema>;
