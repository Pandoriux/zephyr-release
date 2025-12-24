import { ZoneId } from '@js-joda/core';
import '@js-joda/timezone';
import console from "node:console";

// 1. Get the full list
const allZones = ZoneId.getAvailableZoneIds();

// 2. Define the "Standard" Continental Prefixes to EXCLUDE
const commonPrefixes = [
    "Africa/",
    "America/",
    "Antarctica/",
    "Arctic/",
    "Asia/",
    "Atlantic/",
    "Australia/",
    "Europe/",
    "Indian/",
    "Pacific/", "US/", "Mexico/", "Brazil/", "Canada/", "Chile/"
];

// 3. Filter: Keep only those that DO NOT start with any common prefix
const specialZones = allZones.filter(zone => {
    // Returns true if the zone does NOT start with any of the prefixes
    return !commonPrefixes.some(prefix => zone.startsWith(prefix));
});

// 4. Sort for easier reading
specialZones.sort();

console.log(`\n--- Special / Unusual Timezones (${specialZones.length}) ---`);
console.log(specialZones);

// // Optional: Categorize them to see what they usually are
// const etcZones = specialZones.filter(z => z.startsWith("Etc/"));
// const systemVZones = specialZones.filter(z => z.startsWith("SystemV/"));
// const usZones = specialZones.filter(z => z.startsWith("US/"));
// const others = specialZones.filter(z => 
//     !z.startsWith("Etc/") && !z.startsWith("SystemV/") && !z.startsWith("US/")
// );

// console.log("\n--- Breakdown ---");
// console.log("Etc/* (Administrative):", etcZones.length);
// console.log("SystemV/* (Legacy Unix):", systemVZones.length);
// console.log("US/* (Old Aliases):", usZones.length);
// console.log("Others (Short codes, Nations, etc):", others);