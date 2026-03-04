import { ZoneId } from "@js-joda/core";
import "@js-joda/timezone";
import console from "node:console";

// 1. Get the full list
const allZones = ZoneId.getAvailableZoneIds();

// Get the array of all unique, canonical IANA time zone IDs
const supportedTimeZones = Intl.supportedValuesOf("timeZone");

console.log(`Total supported time zones: ${supportedTimeZones.length}`);
// console.log(supportedTimeZones);

// const filteredAsia = supportedTimeZones.filter((tz) => tz.startsWith("Asia"));
// console.log(filteredAsia);

console.log(supportedTimeZones.includes("Asia/Ho_Chi_Minh"));
console.log(allZones.includes("Asia/Ho_Chi_Minh"));
