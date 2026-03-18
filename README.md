# persist-chatgpt-conversation-extension

A Chrome extension to copy ChatGPT conversations to clipboard in Markdown format.

## Usage

1. Open a ChatGPT conversation page (`https://chatgpt.com/c/...` or `https://chatgpt.com/g/.../c/...`)
2. Click the "Copy Conversation" button at the bottom left
3. The conversation is copied to your clipboard in Markdown format

## Output Format

```markdown
# Conversation Title

## User

User's message

## Assistant

Assistant's response
```

## Installation

### Development

```bash
pnpm install
pnpm build
```

1. Open `chrome://extensions` in Chrome
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project folder

### Release

Download `package.zip` from [Releases](https://github.com/mkusaka/persist-chatgpt-conversasion-extension/releases), extract it, and load it as above.

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm watch

# Format
pnpm format

# Type check
pnpm typecheck

# Test
pnpm test

# Create package
pnpm package
```

## License

MIT
