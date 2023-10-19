// ==UserScript==
// @name         Discord New Message Extractor
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extract and print the newest message on Discord along with channel and room IDs
// @author       Rowboat
// @match        https://discord.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    let recentMessages = [];
    let roomId = null; // Formerly channelId
    let channelId = null; // Formerly guildId

    function sendToServer(message, channelId, roomId) {
        GM_xmlhttpRequest({
            method: "POST",
            url: "http://localhost:5000/receive-message",
            data: JSON.stringify({ message: message, channelId: channelId, roomId: roomId }),
            headers: {
                "Content-Type": "application/json"
            },
            onload: function(response) {
                console.log(response.responseText);
            },
            onerror: function(error) {
                console.error('Error:', error);
            }
        });
    }

    function extractLatestMessage() {
        let divs = Array.from(document.querySelectorAll('div'));
        let messageContainers = divs.filter(div => {
            let classList = Array.from(div.classList);
            return classList.some(className => /^messageContent-\w+$/.test(className));
        });

        if (messageContainers.length > 0) {
            let latestMessageContainer = messageContainers[messageContainers.length - 1];
            let message = Array.from(latestMessageContainer.querySelectorAll('span')).map(span => span.textContent).join('');

            if (!recentMessages.includes(message)) {
                sendToServer(message, channelId, roomId);
                recentMessages.push(message);
                console.log(`Sending message: ${message}, channelId: ${channelId}, roomId: ${roomId}`);

                if (recentMessages.length > 5) {
                    recentMessages.shift();
                }
            }
        } else {
            console.log('Message container not found.');
        }
    }

    function updateChannelAndRoomIds() {
        let matches = /\/channels\/(\d+)\/(\d+)/.exec(window.location.pathname);
        if (matches) {
            channelId = matches[1];
            roomId = matches[2];
        }
    }

    let observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                extractLatestMessage();
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Intercept and listen for URL changes using the History API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
        originalPushState.apply(this, arguments);
        updateChannelAndRoomIds();
    };

    history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        updateChannelAndRoomIds();
    };

    // Initial check
    updateChannelAndRoomIds();

})();
