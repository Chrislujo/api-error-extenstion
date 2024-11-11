# API Error Detector Extension

API Error Detector is a lightweight Chrome extension designed to simplify the process of monitoring API errors directly within your browser. Instead of manually inspecting network requests in the browser's DevTools, this extension highlights and displays failed API responses, allowing for faster troubleshooting and debugging.

## Features

- **Real-time Error Detection**: Monitors both fetch and XMLHttpRequest calls for API errors
- **Visual Feedback**: Shows a color-coded floating div on the page indicating error severity:

  - Red: Server errors (500+)
  - Yellow: Client errors (400-499)
  - Blue: Redirects (300-399)
  - Gray: Network errors
  - Green: Success

- **Error History**: Maintains a log of the last 100 errors in the popup interface
- **Desktop Notifications**: Sends system notifications when API errors occur
- **Error Details**: Displays status codes, URLs, and timestamps for each error
- **Interactive UI**: Click the floating div to temporarily hide it
- **Test Functionality**: Built-in test buttons to verify extension functionality

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

The extension works automatically after installation:

1. A small floating div appears on web pages showing the current API monitor status
2. Click the extension icon to view the error history
3. Use the "Clear Errors" button to reset the error log
4. Test buttons available to verify the extension's functionality

## Permissions Required

- `webRequest`: Monitor web requests
- `notifications`: Show desktop notifications
- `storage`: Store error history
- `activeTab`: Access current tab information
- `<all_urls>`: Monitor requests across all websites

## Technical Details

The extension uses multiple methods to ensure comprehensive error detection:

- Fetch API monitoring
- XMLHttpRequest interception
- Performance API observation

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use and modify for your own projects.
