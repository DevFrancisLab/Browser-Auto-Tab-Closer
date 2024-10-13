chrome.alarms.create("checkOldTabs", { periodInMinutes: 1 }); // Runs every 1 minute

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkOldTabs") {
    closeOldTabs();
  }
});

function closeOldTabs() {
  chrome.tabs.query({}, (tabs) => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds

    // Fetch excluded domains and time limit (in minutes) from storage
    chrome.storage.sync.get({ excludedDomains: [], timeLimit: 480 }, (result) => {
      const excludedDomains = result.excludedDomains || [];
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
