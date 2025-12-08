import console from "node:console";

console.log(String.raw`This\nis\newline.`);
console.log(JSON.stringify(`This\nis\newline.`))