document.addEventListener('DOMContentLoaded', function () {
  const domainInput = document.getElementById('domainInput');
  const addDomainButton = document.getElementById('addDomainButton');
  const excludedDomainsList = document.getElementById('excludedDomainsList');
  const timeLimitInput = document.getElementById('timeLimitInput');
  const setTimeLimitButton = document.getElementById('setTimeLimitButton');

  // Load existing excluded domains and time limit (in minutes)
  chrome.storage.sync.get({ excludedDomains: [], timeLimit: 3 }, (result) => {
    const excludedDomains = result.excludedDomains || [];
    const timeLimit = result.timeLimit || 3;

    // Display the saved time limit
    timeLimitInput.value = timeLimit;

    // Populate excluded domains list
    excludedDomains.forEach(domain => addDomainToList(domain));
  });

  // Add domain to the exclusion list
  addDomainButton.addEventListener('click', () => {
    const domain = domainInput.value.trim();
    if (domain) {
      chrome.storage.sync.get({ excludedDomains: [] }, (result) => {
        const excludedDomains = result.excludedDomains || [];
        if (!excludedDomains.includes(domain)) {
          excludedDomains.push(domain);
          chrome.storage.sync.set({ excludedDomains }, () => {
            addDomainToList(domain);
            domainInput.value = '';
          });
        }
      });
    }
  });

  // Add domain to the DOM list
  function addDomainToList(domain) {
    const li = document.createElement('li');
    li.textContent = domain;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      removeDomain(domain);
      li.remove();
    });

    li.appendChild(removeButton);
    excludedDomainsList.appendChild(li);
  }

  // Remove domain from the exclusion list
  function removeDomain(domain) {
    chrome.storage.sync.get({ excludedDomains: [] }, (result) => {
      let excludedDomains = result.excludedDomains || [];
      excludedDomains = excludedDomains.filter(d => d !== domain);
      chrome.storage.sync.set({ excludedDomains });
    });
  }

  // Set tab closing time limit (in minutes)
  setTimeLimitButton.addEventListener('click', () => {
    const timeLimit = parseInt(timeLimitInput.value, 10);
    if (timeLimit > 0) {
      chrome.storage.sync.set({ timeLimit }, () => {
        alert(`Tab closing time limit set to ${timeLimit} minutes.`);
      });
    }
  });
});
