interface AstNode {
  type?: string;
  value?: string;
  children?: AstNode[];
}

// Target out-of-place emojis (keeping 🔴 and 🟢 for PnL indicators)
const TARGET_EMOJIS =
  /[\u{1F4D3}\u{1F50D}\u{26A1}\u{1F4CB}\u{1F6E0}\u{26A0}\u{1F4CA}\u{1F4A1}\u{1F680}\u{1F4C8}\u{1F3F7}\u{1F4BC}]/gu;

function walkTree(node: AstNode): void {
  if (!node || typeof node !== "object") return;

  // 1. Remove leading red circle from any heading (e.g. ## 🔴 Recent Realized Trades)
  if (node.type === "heading" && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child.type === "text" && typeof child.value === "string") {
        child.value = child.value.replace(/^🔴\s*/, "");
      }
    }
  }

  // 2. Remove all out-of-place icon emojis everywhere else, preserving 🔴 and 🟢 for PnL
  if (node.type === "text" && typeof node.value === "string") {
    node.value = node.value.replace(TARGET_EMOJIS, "");
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkTree(child);
    }
  }
}

export function remarkCleanEmojis() {
  return (tree: AstNode) => {
    walkTree(tree);
  };
}
