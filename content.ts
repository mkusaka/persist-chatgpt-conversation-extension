// Content script for persist-chatgpt-conversation extension
// This script runs on ChatGPT pages

import { formatConversation, type ConversationData } from "./lib/conversation"

interface ChatGPTBootstrapData {
  session: {
    accessToken: string
  }
}

function getAccessToken(): string | null {
  const bootstrapScript = document.getElementById("client-bootstrap")
  if (!bootstrapScript) {
    console.error("client-bootstrap script not found")
    return null
  }

  try {
    const data = JSON.parse(
      bootstrapScript.textContent || "",
    ) as ChatGPTBootstrapData
    return data.session?.accessToken ?? null
  } catch (e) {
    console.error("Failed to parse bootstrap data:", e)
    return null
  }
}

function getConversationId(): string | null {
  const match = window.location.pathname.match(/^\/c\/([a-f0-9-]+)$/)
  return match ? match[1] : null
}

async function fetchConversation(
  accessToken: string,
  conversationId: string,
): Promise<ConversationData | null> {
  try {
    const response = await fetch(
      `https://chatgpt.com/backend-api/conversation/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      console.error("Failed to fetch conversation:", response.status)
      return null
    }

    return (await response.json()) as ConversationData
  } catch (e) {
    console.error("Failed to fetch conversation:", e)
    return null
  }
}

async function copyConversation() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    alert("Failed to get access token")
    return
  }

  const conversationId = getConversationId()
  if (!conversationId) {
    alert("Not on a conversation page")
    return
  }

  const data = await fetchConversation(accessToken, conversationId)
  if (!data) {
    alert("Failed to fetch conversation")
    return
  }

  const formatted = formatConversation(data)

  try {
    await navigator.clipboard.writeText(formatted)
    showNotification("Conversation copied to clipboard!")
  } catch (e) {
    console.error("Failed to copy to clipboard:", e)
    alert("Failed to copy to clipboard")
  }
}

function showNotification(message: string) {
  const notification = document.createElement("div")
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #10a37f;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `
  document.body.appendChild(notification)
  setTimeout(() => notification.remove(), 3000)
}

function addCopyButton() {
  // Check if button already exists
  if (document.getElementById("persist-chatgpt-copy-btn")) return

  const button = document.createElement("button")
  button.id = "persist-chatgpt-copy-btn"
  button.textContent = "Copy Conversation"
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: #10a37f;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  `
  button.addEventListener("click", copyConversation)
  button.addEventListener("mouseenter", () => {
    button.style.background = "#0d8a6a"
  })
  button.addEventListener("mouseleave", () => {
    button.style.background = "#10a37f"
  })

  document.body.appendChild(button)
}

function init() {
  console.log("persist-chatgpt-conversation content script loaded")

  // Only add button on conversation pages
  if (getConversationId()) {
    addCopyButton()
  }

  // Watch for URL changes (SPA navigation)
  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      if (getConversationId()) {
        addCopyButton()
      }
    }
  }).observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}
