// Content script for persist-chatgpt-conversation extension
// This script runs on ChatGPT pages

function init() {
  console.log("persist-chatgpt-conversation content script loaded")
  // TODO: Implement conversation persistence logic
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}
