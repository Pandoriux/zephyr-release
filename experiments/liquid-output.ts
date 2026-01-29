import { Liquid, type Template } from "liquidjs";

export const liquidEngine = new Liquid({});

const txt = `- {% if scope %}
**{{ scope | strip_newlines }}:** 
{% endif %}sdsdsds`;

const output = await liquidEngine.parseAndRender(txt, {
  tagName: "pan",
  // scope: "",
  YYYY: "2026",
  desc: "this is desc",
});

console.log(output);
console.log("====");
