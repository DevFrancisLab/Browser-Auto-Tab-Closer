# Tab Auto-Manager Chrome Extension

This Chrome extension automatically closes inactive tabs after a specified period of time. It helps users manage browser tabs and keep their workspace uncluttered. Tabs that are playing audio, active, or belong to a pre-configured list of streaming sites (like YouTube, Netflix, etc.) are excluded from auto-closing. Users can also whitelist specific tabs from closure via a prompt.

## Features
- Automatically closes inactive tabs after a specified amount of time.
- Excludes active tabs, tabs playing audio, and tabs from a list of streaming sites.
- Allows users to whitelist specific tabs from auto-closure via a prompt.
- Customizable time limit for tab closure.
- Streaming sites loaded from an external JSON file.

## How It Works
1. The extension tracks the last time a tab was accessed or updated.
2. If a tab has been inactive for longer than the specified time limit (default is 8 hours), it will be automatically closed, unless it meets exclusion criteria.
3. Tabs playing audio or from an excluded domain (such as YouTube, Netflix, etc.) are ignored and won't be closed.
4. Users can also be prompted to whitelist specific tabs before automatic closure.

## Excluded Streaming Sites
Tabs from the following streaming sites are excluded from auto-closing by default:
- youtube.com
- netflix.com
- hulu.com
- twitch.tv
- vimeo.com
- disneyplus.com
- primevideo.com
- zoom.us
- teams.microsoft.com
- meet.google.com
- dailymotion.com
- spotify.com
- apple.com
- facebook.com
- screenrecorder.com

These domains are loaded from the `streaming_sites.json` file.

## Installation

### Step 1: Clone or Download the Repository
First, clone or download this repository to your local machine:

```bash
git clone https://github.com/DevFrancisLab/Browser-Auto-Tab-Closer.git
Step 2: Load the Extension in Chrome
Open Chrome and navigate to chrome://extensions/.
Enable Developer Mode in the top-right corner.
Click the Load unpacked button.
Select the directory where you cloned or downloaded this repository.
The extension should now appear in your list of installed extensions.
Step 3: Set Up Time Limits (Optional)
You can configure the time limit for closing inactive tabs in the extension’s options:

Right-click the extension icon in the toolbar.
Select Options.
Set the desired time limit (in minutes) for tab closure.
Step 4: Manage Excluded Domains (Optional)
To customize the list of excluded domains:

Open the streaming_sites.json file located in the project folder.
Add or remove domains as needed.
Reload the extension in Chrome by navigating back to chrome://extensions/ and clicking the Reload button.
Usage
Once installed, the extension will automatically start monitoring and closing inactive tabs according to the set time limit. You will also be prompted when tabs are about to be closed, giving you the option to whitelist them if needed.

Key Points:
Audio Playback: Tabs playing audio are never closed.
Active Tab: The currently active tab is never closed.
Streaming Sites: Tabs from domains in streaming_sites.json are not closed.
Contributing
If you'd like to contribute to this project, feel free to fork the repository and submit a pull request with your changes.

License
This project is licensed under the MIT License.
