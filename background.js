// Create an alarm that runs every 1 minute
chrome.alarms.create("checkOldTabs", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkOldTabs") {
    closeOldTabs();
  }
});

// Function to load excluded domains from JSON file and merge with stored excluded domains
function loadExcludedDomains(callback) {
  fetch(chrome.runtime.getURL('streaming_sites.json'))
    .then((response) => response.json())
    .then((json) => {
      const streamingSites = json.streamingSites || [];
      
      // Get the stored excluded domains
      chrome.storage.sync.get({ excludedDomains: [] }, (result) => {
        const storedExcludedDomains = result.excludedDomains || [];
        
        // Merge and remove duplicates
        const mergedExcludedDomains = [...new Set([...storedExcludedDomains, ...streamingSites])];
        
        // Save the merged domains back to storage
        chrome.storage.sync.set({ excludedDomains: mergedExcludedDomains }, () => {
          callback(mergedExcludedDomains); // Continue with the merged list
        });
      });
    })
    .catch((error) => {
      console.error('Error loading streaming sites:', error);
      // Use the existing excluded domains in case of an error
      chrome.storage.sync.get({ excludedDomains: [] }, (result) => {
        callback(result.excludedDomains || []);
      });
    });
}

function closeOldTabs() {
  chrome.tabs.query({}, (tabs) => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds

    // Load excluded domains from JSON and storage
    loadExcludedDomains((excludedDomains) => {
      // Fetch time limit (in minutes) from storage
      chrome.storage.sync.get({ timeLimit: 3 }, (result) => {
        const timeLimitInSeconds = result.timeLimit * 60; // Convert minutes to seconds

        chrome.storage.local.get(null, (storedData) => {
          chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
            const activeTabId = activeTabs.length ? activeTabs[0].id : null; // Get the currently active tab

            tabs.forEach((tab) => {
              const url = new URL(tab.url);
              const domain = url.hostname;

              // Skip the active tab and tabs from excluded domains
              if (tab.id === activeTabId || excludedDomains.includes(domain)) {
                console.log(`Tab ${tab.id} is either active or from an excluded domain.`);
                return;
              }

              // Exclude tabs that are currently playing audio
              if (tab.audible) {
                console.log(`Tab ${tab.id} is playing audio, excluding from closure.`);
                return;
              }

              const lastAccessed = storedData[`tab_${tab.id}`];
              if (lastAccessed) {
                const tabAgeInSeconds = now - Math.floor(lastAccessed / 1000);
                const secondsRemaining = timeLimitInSeconds - tabAgeInSeconds;

                if (secondsRemaining <= 0) {
                  console.log(`Tab ${tab.id} with URL "${tab.url}" is being closed.`);
                  chrome.tabs.remove(tab.id);
                } else {
                  console.log(`Tab ${tab.id} with URL "${tab.url}" has ${secondsRemaining} seconds remaining before it will be closed.`);
                }
              } else {
                console.log(`No last access time found for tab ${tab.id} with URL "${tab.url}".`);
              }
            });
          });
        });
      });
    });
  });
}

// Listen for tab activation and update the lastAccessed time
chrome.tabs.onActivated.addListener((activeInfo) => {
  const now = Date.now();
  chrome.storage.local.set({ [`tab_${activeInfo.tabId}`]: now });
  console.log(`Tab ${activeInfo.tabId} was activated. Last accessed time updated.`);
});

// Listen for tab updates (e.g., when the URL changes) and update the lastAccessed time
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const now = Date.now();
    chrome.storage.local.set({ [`tab_${tabId}`]: now });
    console.log(`Tab ${tabId} was updated. Last accessed time updated.`);
  }
});

// Listen for tab removal and clean up the storage
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(`tab_${tabId}`);
  console.log(`Tab ${tabId} was closed and removed from storage.`);
});

