// ==UserScript==
// @name         Universal SK Redirector
// @namespace    http://tampermonkey.net/
// @version      5.1
// @description  A single script to redirect from YouTube, Reddit, and JTech Forums to custom SK websites. Handles direct visits and Techloq block pages with persistent polling.
// @author       Shalom Karr / YH Studios
// @match        *://www.youtube.com/*
// @match        *://reddit.com/*
// @match        *://forums.jtechforums.org/*
// @match        *://filter.techloq.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CENTRAL CONFIGURATION ---
    const REDIRECT_CONFIG = [
        { type: 'path', sourceDomain: 'forums.jtechforums.org', targetDomain: 'https://jtechwebsite.shalomkarr.workers.dev' },
        { type: 'path', sourceDomain: 'reddit.com', targetDomain: 'https://reddit2.sknews-139.workers.dev' },
        { type: 'youtube', sourceDomain: 'www.youtube.com', targetDomain: 'https://skyoutubebeta.netlify.app' }
    ];

    // Polling Settings for Techloq
    const MAX_TECHLOQ_RETRIES = 1200;
    const TECHLOQ_RETRY_INTERVAL_MS = 250;
    // --- END CONFIGURATION ---

    if (window.top !== window.self) return;

    let techloqAttemptCount = 0;

    // --- REDIRECT HANDLERS ---

    function performPathRedirect(targetDomain, urlObject) {
        const newUrl = `${targetDomain}${urlObject.pathname}${urlObject.search}`;
        window.location.replace(newUrl);
    }

    /**
     * Handles all YouTube redirects with a clear priority, matching the SK dashboard's routing.
     * 1. Playlist ID -> /playlist?source=...
     * 2. Video ID -> /video?source=...
     * 3. Channel Handle -> /channel?source=...
     * 4. Fallback -> Base dashboard URL
     * @param {string} targetDomain - The dashboard's base URL.
     * @param {string} urlString - The full YouTube URL to parse.
     */
    function performYoutubeRedirect(targetDomain, urlString) {
        const playlistPattern = /[?&]list=([a-zA-Z0-9_-]+)/;
        const videoPattern = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const channelPattern = /youtube\.com\/@([^\/?]+)/;

        // 1. Check for Playlist ID
        const playlistId = urlString.match(playlistPattern)?.[1];
        if (playlistId) {
            window.location.replace(`${targetDomain}/playlist?source=${encodeURIComponent(playlistId)}`);
            return;
        }

        // 2. Check for Video ID
        const videoId = urlString.match(videoPattern)?.[1];
        if (videoId) {
            window.location.replace(`${targetDomain}/video?source=${encodeURIComponent(videoId)}`);
            return;
        }

        // 3. Check for Channel Handle (e.g., /@MrBeast)
        const channelHandle = urlString.match(channelPattern)?.[1];
        if (channelHandle) {
            // UPDATED: Redirects to /channel path with 'source' parameter
            window.location.replace(`${targetDomain}/channel?source=${encodeURIComponent(channelHandle)}`);
            return;
        }

        // 4. Fallback for homepage and other pages
        window.location.replace(targetDomain);
    }


    // --- TECHLOQ POLLING LOGIC ---

    function pollForBlockedUrl() {
        let originalUrlStr = '';

        // Method 1: Check the URL's query parameter first.
        try {
            const params = new URLSearchParams(window.location.search);
            const encodedRedirectUrl = params.get('redirectUrl');
            if (encodedRedirectUrl) {
                originalUrlStr = decodeURIComponent(encodedRedirectUrl);
            }
        } catch (e) {
            console.error("Error parsing Techloq URL query parameters:", e);
        }

        // Method 2 (Fallback): Find the URL in the page content (the <a> tag).
        if (!originalUrlStr) {
             const blockedLinkElement = document.querySelector('div.block-url a');
             if (blockedLinkElement && blockedLinkElement.href) {
                 originalUrlStr = blockedLinkElement.href;
             }
        }

        if (originalUrlStr) {
            try {
                const urlObject = new URL(originalUrlStr);
                const hostname = urlObject.hostname.replace(/^www\./, '');

                for (const rule of REDIRECT_CONFIG) {
                    if (hostname.includes(rule.sourceDomain.replace(/^www\./, ''))) {
                        if (rule.type === 'path') {
                            performPathRedirect(rule.targetDomain, urlObject);
                        } else if (rule.type === 'youtube') {
                            performYoutubeRedirect(rule.targetDomain, originalUrlStr);
                        }
                        return; // Success, stop polling.
                    }
                }
            } catch (e) {
                console.error("Error processing the blocked URL:", e);
            }
        }

        // If no match found, continue polling.
        techloqAttemptCount++;
        if (techloqAttemptCount < MAX_TECHLOQ_RETRIES) {
            setTimeout(pollForBlockedUrl, TECHLOQ_RETRY_INTERVAL_MS);
        }
    }


    // --- SCRIPT EXECUTION LOGIC ---

    const currentHostname = window.location.hostname;

    if (currentHostname.includes('filter.techloq.com')) {
        pollForBlockedUrl();
    } else {
        const currentUrl = window.location.href;
        
        for (const rule of REDIRECT_CONFIG) {
            if (currentHostname.includes(rule.sourceDomain)) {
                 if (rule.type === 'path') {
                    performPathRedirect(rule.targetDomain, new URL(currentUrl));
                } else if (rule.type === 'youtube') {
                    performYoutubeRedirect(rule.targetDomain, currentUrl);
                }
                break;
            }
        }
    }

})();
