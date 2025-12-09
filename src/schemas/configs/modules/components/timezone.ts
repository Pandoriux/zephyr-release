import "@js-joda/timezone";
import { ZoneId } from "@js-joda/core";
import * as v from "@valibot/valibot";

// const supportedIanaTimeZones = Intl.supportedValuesOf("timeZone");
const supportedIanaTimeZones = ZoneId.getAvailableZoneIds();

// export const TimeZoneSchema = v.picklist(["UTC", ...supportedIanaTimeZones]);
export const TimeZoneSchema = v.picklist(supportedIanaTimeZones);

type _TimeZoneInput = v.InferInput<typeof TimeZoneSchema>;
type _TimeZoneOutput = v.InferOutput<typeof TimeZoneSchema>;
