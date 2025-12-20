// Background service worker for persist-chatgpt-conversation extension

chrome.runtime.onInstalled.addListener(() => {
  console.log("persist-chatgpt-conversation extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle messages from content script
  console.log("Message received:", message);
  sendResponse({ status: "ok" });
});
