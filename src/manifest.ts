import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

export default defineManifest({
  name: "persist-chatgpt-conversation",
  version: packageJson.version,
  description: "Persist ChatGPT conversations",
  manifest_version: 3,
  background: {
    service_worker: "src/background.ts",
  },
  content_scripts: [
    {
      matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"],
      run_at: "document_end",
      js: ["src/content.ts"],
    },
  ],
  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png",
  },
});
