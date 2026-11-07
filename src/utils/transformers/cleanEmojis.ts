import { visit } from "unist-util-visit";

// Target out-of-place emojis (keeping 🔴 and 🟢 for PnL indicators)
const TARGET_EMOJIS =
  /[\u{1F4D3}\u{1F50D}\u{26A1}\u{1F4CB}\u{1F6E0}\u{26A0}\u{1F4CA}\u{1F4A1}\u{1F680}\u{1F4C8}\u{1F3F7}\u{1F4BC}]/gu;

export function remarkCleanEmojis() {
  return (tree: unknown) => {
    // 1. Remove leading red circle from any heading (e.g. ## 🔴 Recent Realized Trades)
    visit(tree, "heading", (node: any) => {
      visit(node, "text", (textNode: any) => {
        if (typeof textNode.value === "string") {
          textNode.value = textNode.value.replace(/^🔴\s*/, "");
        }
      });
    });

    // 2. Remove all out-of-place icon emojis everywhere else, preserving 🔴 and 🟢 for PnL
    visit(tree, "text", (node: any) => {
      if (typeof node.value === "string") {
        node.value = node.value.replace(TARGET_EMOJIS, "");
      }
    });
  };
}
