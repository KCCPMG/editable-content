/**
 * @jest-environment jsdom
 */
import {describe, expect, jest, test, beforeEach} from '@jest/globals';
import { setSelection, wrapInElement, unwrapSelectionFromQuery, unwrapRangeFromQuery, deleteEmptyElementsByQuery, nodeIsDescendentOf, selectionIsDescendentOfNode, selectionIsCoveredBy, generateQuery, createWrapper, getSelectionChildNodes, resetSelectionToTextNodes, getRangeChildNodes } from './utils';


const startingHTML = 
`<div>
  <strong id="strong-1">Strong Text</strong>
  <i id="italics-1">Italics Text</i>
  Orphan Text
  <strong id="strong-2">
    Strong Text
    <i id="italics-2">
      Strong and Italics Text
    </i>
    More Strong Text
  </strong>
</div>`
.replaceAll(/\n */g, ''); // avoid empty text nodes from human-readable version above


const alternateHTML = `
<div>
  <strong>First Strong Text</strong>
  <strong>Second Strong Text</strong>
  <strong>Third Strong Text</strong>
  <strong>
    Fourth Strong Text 
    <i>Italics In Fourth Strong Text </i>
    <u>Underline in Fourth Strong Text </u>
  </strong>
  <strong>Fifth Strong Text</strong>
  <i>Italics After Fifth Strong Text</i>
  <strong>Sixth Strong Text</strong>
</div>`.replaceAll(/\n */g, '');


const alternateHTMLwithUnbreakable = `
<div>
  <strong>First Strong Text</strong>
  <strong>Second Strong Text</strong>
  <strong>Third Strong Text</strong>
  <strong>
    Fourth Strong Text 
    <i>Italics In Fourth Strong Text </i>
    <u>Underline in Fourth Strong Text </u>
  </strong>
  <strong data-unbreakable>Fifth Strong Text - Unbreakable</strong>
  <i>Italics After Fifth Strong Text</i>
  <strong>Sixth Strong Text</strong>
</div>`.replaceAll(/\n */g, '');


const mdnDocPageHTML = `
<div id="root"><ul id="nav-access" class="a11y-nav"><li><a id="skip-main" href="#content">Skip to main content</a></li><li><a id="skip-search" href="#top-nav-search-input">Skip to search</a></li><li><a id="skip-select-language" href="#languages-switcher-button">Skip to select language</a></li></ul><div class="page-wrapper  category-api document-page"><div class="top-banner visible" style="--place-top-background-light: #011a45; --place-top-color-light: #FFFFFF; --place-top-cta-background-light: #FFFFFF; --place-top-cta-color-light: #1a202c; --place-top-background-dark: #011a45; --place-top-color-dark: #FFFFFF; --place-top-cta-background-dark: #FFFFFF; --place-top-cta-color-dark: #1a202c;"><section class="place top container"><p class="pong-box"><a class="pong" data-glean="pong: pong->click top-banner" href="/pong/click?code=aHR0cHM6Ly9zcnYuYnV5c2VsbGFkcy5jb20vYWRzL2NsaWNrL3gvR1RORDQyN1dDQUJENEszTUNBWTRZS1FVQ0VTSUxLN01DQUFJRVozSkNBQkQ1NTNFQzZZREUyM0tDNkJJVEtRWUZUU0k0MjNJRlRCSUVLN0VDVFNEUEs3TEhFWUk1MjNVQ0U3RFAySkVDVE5DWUJaNTJL.U2ZwEUvM%2FWOamrXF9Qb6D%2BPEHJhlMPzrwlCy%2BX%2BxoDo%3D&amp;version=2" target="_blank" rel="sponsored noreferrer"><img src="/pimg/aHR0cHM6Ly9zdGF0aWM0LmJ1eXNlbGxhZHMubmV0L3V1LzIvMTU4NTkwLzE3Mzk5Nzk4NDQtaWstd2hpdGUtbG9nby1wbmcucG5n.Ylrls2jHwyTBsqjxF4XgR4D3m%2BySLpiNw0B8ITl0yps%3D" aria-hidden="false" alt="ImageKit" height="50"><span>Image &amp; Video API: Real-time resizing, overlays, auto optimization, upload, storage &amp; global CDN. Try forever free plan!</span></a><a class="pong-cta" data-glean="pong: pong->click top-banner" href="/pong/click?code=aHR0cHM6Ly9zcnYuYnV5c2VsbGFkcy5jb20vYWRzL2NsaWNrL3gvR1RORDQyN1dDQUJENEszTUNBWTRZS1FVQ0VTSUxLN01DQUFJRVozSkNBQkQ1NTNFQzZZREUyM0tDNkJJVEtRWUZUU0k0MjNJRlRCSUVLN0VDVFNEUEs3TEhFWUk1MjNVQ0U3RFAySkVDVE5DWUJaNTJL.U2ZwEUvM%2FWOamrXF9Qb6D%2BPEHJhlMPzrwlCy%2BX%2BxoDo%3D&amp;version=2" target="_blank" rel="sponsored noreferrer">Create free account</a><a href="/en-US/advertising" class="pong-note" data-glean="pong: pong->about" target="_blank" rel="noreferrer">Ad</a></p><a class="no-pong" data-glean="pong: pong->plus" href="/en-US/plus?ref=nope">Don't want to see ads?</a></section></div><div class="sticky-header-container"><header class="top-navigation 
      
      "><div class="container "><div class="top-navigation-wrap"><a href="/en-US/" class="logo" aria-label="MDN homepage"><svg id="mdn-docs-logo" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 694.9 104.4" style="enable-background:new 0 0 694.9 104.4" xml:space="preserve" role="img"><title>MDN Web Docs</title><path d="M40.3 0 11.7 92.1H0L28.5 0h11.8zm10.4 0v92.1H40.3V0h10.4zM91 0 62.5 92.1H50.8L79.3 0H91zm10.4 0v92.1H91V0h10.4z" class="logo-m"></path><path d="M627.9 95.6h67v8.8h-67v-8.8z" class="logo-_"></path><path d="M367 42h-4l-10.7 30.8h-5.5l-10.8-26h-.4l-10.5 26h-5.2L308.7 42h-3.8v-5.6H323V42h-6.5l6.8 20.4h.4l10.3-26h4.7l11.2 26h.5l5.7-20.3h-6.2v-5.6H367V42zm34.9 20c-.4 3.2-2 5.9-4.7 8.2-2.8 2.3-6.5 3.4-11.3 3.4-5.4 0-9.7-1.6-13.1-4.7-3.3-3.2-5-7.7-5-13.7 0-5.7 1.6-10.3 4.7-14s7.4-5.5 12.9-5.5c5.1 0 9.1 1.6 11.9 4.7s4.3 6.9 4.3 11.3c0 1.5-.2 3-.5 4.7h-25.6c.3 7.7 4 11.6 10.9 11.6 2.9 0 5.1-.7 6.5-2 1.5-1.4 2.5-3 3-4.9l6 .9zM394 51.3c.2-2.4-.4-4.7-1.8-6.9s-3.8-3.3-7-3.3c-3.1 0-5.3 1-6.9 3-1.5 2-2.5 4.4-2.8 7.2H394zm51 2.4c0 5-1.3 9.5-4 13.7s-6.9 6.2-12.7 6.2c-6 0-10.3-2.2-12.7-6.7-.1.4-.2 1.4-.4 2.9s-.3 2.5-.4 2.9h-7.3c.3-1.7.6-3.5.8-5.3.3-1.8.4-3.7.4-5.5V22.3h-6v-5.6H416v27c1.1-2.2 2.7-4.1 4.7-5.7 2-1.6 4.8-2.4 8.4-2.4 4.6 0 8.4 1.6 11.4 4.7 3 3.2 4.5 7.6 4.5 13.4zm-7.7.6c0-4.2-1-7.4-3-9.5-2-2.2-4.4-3.3-7.4-3.3-3.4 0-6 1.2-8 3.7-1.9 2.4-2.9 5-3 7.7V57c0 3 1 5.6 3 7.7s4.5 3.1 7.6 3.1c3.6 0 6.3-1.3 8.1-3.9 1.8-2.7 2.7-5.9 2.7-9.6zm69.2 18.5h-13.2v-7.2c-1.2 2.2-2.8 4.1-4.9 5.6-2.1 1.6-4.8 2.4-8.3 2.4-4.8 0-8.7-1.6-11.6-4.9-2.9-3.2-4.3-7.7-4.3-13.3 0-5 1.3-9.6 4-13.7 2.6-4.1 6.9-6.2 12.8-6.2 5.7 0 9.8 2.2 12.3 6.5V22.3h-8.6v-5.6h15.8v50.6h6v5.5zM493.2 56v-4.4c-.1-3-1.2-5.5-3.2-7.3s-4.4-2.8-7.2-2.8c-3.6 0-6.3 1.3-8.2 3.9-1.9 2.6-2.8 5.8-2.8 9.6 0 4.1 1 7.3 3 9.5s4.5 3.3 7.4 3.3c3.2 0 5.8-1.3 7.8-3.8 2.1-2.6 3.1-5.3 3.2-8zm53.1-1.4c0 5.6-1.8 10.2-5.3 13.7s-8.2 5.3-13.9 5.3-10.1-1.7-13.4-5.1c-3.3-3.4-5-7.9-5-13.5 0-5.3 1.6-9.9 4.7-13.7 3.2-3.8 7.9-5.7 14.2-5.7s11 1.9 14.1 5.7c3 3.7 4.6 8.1 4.6 13.3zm-7.7-.2c0-4-1-7.2-3-9.5s-4.8-3.5-8.2-3.5c-3.6 0-6.4 1.2-8.3 3.7s-2.9 5.6-2.9 9.5c0 3.7.9 6.8 2.8 9.4 1.9 2.6 4.6 3.9 8.3 3.9 3.6 0 6.4-1.3 8.4-3.8 1.9-2.6 2.9-5.8 2.9-9.7zm45 5.8c-.4 3.2-1.9 6.3-4.4 9.1-2.5 2.9-6.4 4.3-11.8 4.3-5.2 0-9.4-1.6-12.6-4.8-3.2-3.2-4.8-7.7-4.8-13.7 0-5.5 1.6-10.1 4.7-13.9 3.2-3.8 7.6-5.7 13.2-5.7 2.3 0 4.6.3 6.7.8 2.2.5 4.2 1.5 6.2 2.9l1.5 9.5-5.9.7-1.3-6.1c-2.1-1.2-4.5-1.8-7.2-1.8-3.5 0-6.1 1.2-7.7 3.7-1.7 2.5-2.5 5.7-2.5 9.6 0 4.1.9 7.3 2.7 9.5 1.8 2.3 4.4 3.4 7.8 3.4 5.2 0 8.2-2.9 9.2-8.8l6.2 1.3zm34.7 1.9c0 3.6-1.5 6.5-4.6 8.5s-7 3-11.7 3c-5.7 0-10.6-1.2-14.6-3.6l1.2-8.8 5.7.6-.2 4.7c1.1.5 2.3.9 3.6 1.1s2.6.3 3.9.3c2.4 0 4.5-.4 6.5-1.3 1.9-.9 2.9-2.2 2.9-4.1 0-1.8-.8-3.1-2.3-3.8s-3.5-1.3-5.8-1.7-4.6-.9-6.9-1.4c-2.3-.6-4.2-1.6-5.7-2.9-1.6-1.4-2.3-3.5-2.3-6.3 0-4.1 1.5-6.9 4.6-8.5s6.4-2.4 9.9-2.4c2.6 0 5 .3 7.2.9 2.2.6 4.3 1.4 6.1 2.4l.8 8.8-5.8.7-.8-5.7c-2.3-1-4.7-1.6-7.2-1.6-2.1 0-3.7.4-5.1 1.1-1.3.8-2 2-2 3.8 0 1.7.8 2.9 2.3 3.6 1.5.7 3.4 1.2 5.7 1.6 2.2.4 4.5.8 6.7 1.4 2.2.6 4.1 1.6 5.7 3 1.4 1.6 2.2 3.7 2.2 6.6zM197.6 73.2h-17.1v-5.5h3.8V51.9c0-3.7-.7-6.3-2.1-7.9-1.4-1.6-3.3-2.3-5.7-2.3-3.2 0-5.6 1.1-7.2 3.4s-2.4 4.6-2.5 6.9v15.6h6v5.5h-17.1v-5.5h3.8V51.9c0-3.8-.7-6.4-2.1-7.9-1.4-1.5-3.3-2.3-5.6-2.3-3.2 0-5.5 1.1-7.2 3.3-1.6 2.2-2.4 4.5-2.5 6.9v15.8h6.9v5.5h-20.2v-5.5h6V42.4h-6.1v-5.6h13.4v6.4c1.2-2.1 2.7-3.8 4.7-5.2 2-1.3 4.4-2 7.3-2s5.3.7 7.5 2.1c2.2 1.4 3.7 3.5 4.5 6.4 1.1-2.5 2.7-4.5 4.9-6.1s4.8-2.4 7.9-2.4c3.5 0 6.5 1.1 8.9 3.3s3.7 5.6 3.7 10.2v18.2h6.1v5.5zm42.5 0h-13.2V66c-1.2 2.2-2.8 4.1-4.9 5.6-2.1 1.6-4.8 2.4-8.3 2.4-4.8 0-8.7-1.6-11.6-4.9-2.9-3.2-4.3-7.7-4.3-13.3 0-5 1.3-9.6 4-13.7 2.6-4.1 6.9-6.2 12.8-6.2s9.8 2.2 12.3 6.5V22.7h-8.6v-5.6h15.8v50.6h6v5.5zm-13.3-16.8V52c-.1-3-1.2-5.5-3.2-7.3s-4.4-2.8-7.2-2.8c-3.6 0-6.3 1.3-8.2 3.9-1.9 2.6-2.8 5.8-2.8 9.6 0 4.1 1 7.3 3 9.5s4.5 3.3 7.4 3.3c3.2 0 5.8-1.3 7.8-3.8 2.1-2.6 3.1-5.3 3.2-8zm61.5 16.8H269v-5.5h6V51.9c0-3.7-.7-6.3-2.2-7.9-1.4-1.6-3.4-2.3-5.7-2.3-3.1 0-5.6 1-7.4 3s-2.8 4.4-2.9 7v15.9h6v5.5h-19.3v-5.5h6V42.4h-6.2v-5.6h13.6V43c2.6-4.6 6.8-6.9 12.7-6.9 3.6 0 6.7 1.1 9.2 3.3s3.7 5.6 3.7 10.2v18.2h6v5.4h-.2z" class="logo-text"></path></svg></a><button title="Open main menu" type="button" class="button action has-icon main-menu-toggle" aria-haspopup="menu" aria-label="Open main menu" aria-expanded="false"><span class="button-wrap"><span class="icon icon-menu "></span><span class="visually-hidden">Open main menu</span></span></button></div><div class="top-navigation-main"><nav class="main-nav" aria-label="Main menu"><ul class="main-menu"><li class="top-level-entry-container active"><button type="button" id="references-button" class="top-level-entry menu-toggle" aria-controls="references-menu" aria-expanded="false">References</button><a href="/en-US/docs/Web" class="top-level-entry">References</a><ul id="references-menu" class="submenu references hidden inline-submenu-lg" aria-labelledby="references-button"><li class="apis-link-container mobile-only "><a href="/en-US/docs/Web" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">Overview / Web Technology</div><p class="submenu-item-description">Web technology reference for developers</p></div></a></li><li class="html-link-container "><a href="/en-US/docs/Web/HTML" class="submenu-item "><div class="submenu-icon html"></div><div class="submenu-content-container"><div class="submenu-item-heading">HTML</div><p class="submenu-item-description">Structure of content on the web</p></div></a></li><li class="css-link-container "><a href="/en-US/docs/Web/CSS" class="submenu-item "><div class="submenu-icon css"></div><div class="submenu-content-container"><div class="submenu-item-heading">CSS</div><p class="submenu-item-description">Code used to describe document style</p></div></a></li><li class="javascript-link-container "><a href="/en-US/docs/Web/JavaScript" class="submenu-item "><div class="submenu-icon javascript"></div><div class="submenu-content-container"><div class="submenu-item-heading">JavaScript</div><p class="submenu-item-description">General-purpose scripting language</p></div></a></li><li class="http-link-container "><a href="/en-US/docs/Web/HTTP" class="submenu-item "><div class="submenu-icon http"></div><div class="submenu-content-container"><div class="submenu-item-heading">HTTP</div><p class="submenu-item-description">Protocol for transmitting web resources</p></div></a></li><li class="apis-link-container "><a href="/en-US/docs/Web/API" class="submenu-item "><div class="submenu-icon apis"></div><div class="submenu-content-container"><div class="submenu-item-heading">Web APIs</div><p class="submenu-item-description">Interfaces for building web applications</p></div></a></li><li class="apis-link-container "><a href="/en-US/docs/Mozilla/Add-ons/WebExtensions" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">Web Extensions</div><p class="submenu-item-description">Developing extensions for web browsers</p></div></a></li><li class=" "><a href="/en-US/docs/Web/Accessibility" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">Accessibility</div><p class="submenu-item-description">Build web projects usable for all</p></div></a></li><li class="apis-link-container desktop-only "><a href="/en-US/docs/Web" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">Web Technology</div><p class="submenu-item-description">Web technology reference for developers</p></div></a></li></ul></li><li class="top-level-entry-container "><button type="button" id="learn-button" class="top-level-entry menu-toggle" aria-controls="learn-menu" aria-expanded="false">Learn</button><a href="/en-US/docs/Learn_web_development" class="top-level-entry">Learn</a><ul id="learn-menu" class="submenu learn hidden inline-submenu-lg" aria-labelledby="learn-button"><li class="apis-link-container mobile-only "><a href="/en-US/docs/Learn_web_development" class="submenu-item "><div class="submenu-icon learn"></div><div class="submenu-content-container"><div class="submenu-item-heading">Overview / MDN Learning Area</div><p class="submenu-item-description">Learn web development</p></div></a></li><li class="apis-link-container desktop-only "><a href="/en-US/docs/Learn_web_development" class="submenu-item "><div class="submenu-icon learn"></div><div class="submenu-content-container"><div class="submenu-item-heading">MDN Learning Area</div><p class="submenu-item-description">Learn web development</p></div></a></li><li class="html-link-container "><a href="/en-US/docs/Learn_web_development/Core/Structuring_content" class="submenu-item "><div class="submenu-icon html"></div><div class="submenu-content-container"><div class="submenu-item-heading">HTML</div><p class="submenu-item-description">Learn to structure web content with HTML</p></div></a></li><li class="css-link-container "><a href="/en-US/docs/Learn_web_development/Core/Styling_basics" class="submenu-item "><div class="submenu-icon css"></div><div class="submenu-content-container"><div class="submenu-item-heading">CSS</div><p class="submenu-item-description">Learn to style content using CSS</p></div></a></li><li class="javascript-link-container "><a href="/en-US/docs/Learn_web_development/Core/Scripting" class="submenu-item "><div class="submenu-icon javascript"></div><div class="submenu-content-container"><div class="submenu-item-heading">JavaScript</div><p class="submenu-item-description">Learn to run scripts in the browser</p></div></a></li><li class=" "><a href="/en-US/docs/Learn_web_development/Core/Accessibility" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">Accessibility</div><p class="submenu-item-description">Learn to make the web accessible to all</p></div></a></li></ul></li><li class="top-level-entry-container "><button type="button" id="mdn-plus-button" class="top-level-entry menu-toggle" aria-controls="mdn-plus-menu" aria-expanded="false">Plus</button><a href="/en-US/plus" class="top-level-entry">Plus</a><ul id="mdn-plus-menu" class="submenu mdn-plus hidden inline-submenu-lg" aria-labelledby="mdn-plus-button"><li class=" "><a href="/en-US/plus" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">Overview</div><p class="submenu-item-description">A customized MDN experience</p></div></a></li><li class=" "><a href="/en-US/plus/ai-help" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">AI Help</div><p class="submenu-item-description">Get real-time assistance and support</p></div></a></li><li class=" "><a href="/en-US/plus/updates" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">Updates</div><p class="submenu-item-description">All browser compatibility updates at a glance</p></div></a></li><li class=" "><a href="/en-US/plus/docs/features/overview" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">Documentation</div><p class="submenu-item-description">Learn how to use MDN Plus</p></div></a></li><li class=" "><a href="/en-US/plus/docs/faq" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">FAQ</div><p class="submenu-item-description">Frequently asked questions about MDN Plus</p></div></a></li></ul></li><li class="top-level-entry-container "><a class="top-level-entry menu-link" href="/en-US/curriculum/">Curriculum <sup class="new">New</sup></a></li><li class="top-level-entry-container "><a class="top-level-entry menu-link" href="/en-US/blog/">Blog</a></li><li class="top-level-entry-container "><button type="button" id="tools-button" class="top-level-entry menu-toggle" aria-controls="tools-menu" aria-expanded="false">Tools</button><ul id="tools-menu" class="submenu tools hidden inline-submenu-lg" aria-labelledby="tools-button"><li class=" "><a href="/en-US/play" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">Playground</div><p class="submenu-item-description">Write, test and share your code</p></div></a></li><li class=" "><a href="/en-US/observatory" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">HTTP Observatory</div><p class="submenu-item-description">Scan a website for free</p></div></a></li><li class=" "><a href="/en-US/plus/ai-help" class="submenu-item "><div class="submenu-icon"></div><div class="submenu-content-container"><div class="submenu-item-heading">AI Help</div><p class="submenu-item-description">Get real-time assistance and support</p></div></a></li></ul></li></ul></nav><div class="header-search"><form action="/en-US/search" class="search-form search-widget" id="top-nav-search-form" role="search"><label id="top-nav-search-label" for="top-nav-search-input" class="visually-hidden">Search MDN</label><input aria-activedescendant="" aria-autocomplete="list" aria-controls="top-nav-search-menu" aria-expanded="false" aria-labelledby="top-nav-search-label" autocomplete="off" id="top-nav-search-input" role="combobox" type="search" class="search-input-field" name="q" placeholder="   " required="" value=""><button type="button" class="button action has-icon clear-search-button"><span class="button-wrap"><span class="icon icon-cancel "></span><span class="visually-hidden">Clear search input</span></span></button><button type="submit" class="button action has-icon search-button"><span class="button-wrap"><span class="icon icon-search "></span><span class="visually-hidden">Search</span></span></button><div id="top-nav-search-menu" role="listbox" aria-labelledby="top-nav-search-label"></div></form></div><div class="theme-switcher-menu"><button type="button" class="button action has-icon theme-switcher-menu small" aria-haspopup="menu"><span class="button-wrap"><span class="icon icon-theme-os-default "></span>Theme</span></button></div><ul class="auth-container"><li><a href="/users/fxa/login/authenticate/?next=%2Fen-US%2Fdocs%2FWeb%2FAPI%2FRange%2FisPointInRange" class="login-link" rel="nofollow">Log in</a></li><li><a href="/users/fxa/login/authenticate/?next=%2Fen-US%2Fdocs%2FWeb%2FAPI%2FRange%2FisPointInRange" target="_self" rel="nofollow" class="button primary mdn-plus-subscribe-link"><span class="button-wrap">Sign up for free</span></a></li></ul></div></div></header><div class="article-actions-container"><div class="container"><button type="button" class="button action has-icon sidebar-button" aria-label="Expand sidebar" aria-expanded="false" aria-controls="sidebar-quicklinks"><span class="button-wrap"><span class="icon icon-sidebar "></span></span></button><nav class="breadcrumbs-container" aria-label="Breadcrumb"><ol typeof="BreadcrumbList" vocab="https://schema.org/" aria-label="breadcrumbs"><li property="itemListElement" typeof="ListItem"><a href="/en-US/docs/Web" class="breadcrumb" property="item" typeof="WebPage"><span property="name">References</span></a><meta property="position" content="1"></li><li property="itemListElement" typeof="ListItem"><a href="/en-US/docs/Web/API" class="breadcrumb" property="item" typeof="WebPage"><span property="name">Web APIs</span></a><meta property="position" content="2"></li><li property="itemListElement" typeof="ListItem"><a href="/en-US/docs/Web/API/Range" class="breadcrumb" property="item" typeof="WebPage"><span property="name">Range</span></a><meta property="position" content="3"></li><li property="itemListElement" typeof="ListItem"><a href="/en-US/docs/Web/API/Range/isPointInRange" class="breadcrumb-current-page" property="item" typeof="WebPage"><span property="name">isPointInRange()</span></a><meta property="position" content="4"></li></ol></nav><div class="article-actions"><button type="button" class="button action has-icon article-actions-toggle" aria-label="Article actions"><span class="button-wrap"><span class="icon icon-ellipses "></span><span class="article-actions-dialog-heading">Article Actions</span></span></button><ul class="article-actions-entries"><li class="article-actions-entry"><div class="languages-switcher-menu open-on-focus-within"><button id="languages-switcher-button" type="button" class="button action small has-icon languages-switcher-menu" aria-haspopup="menu"><span class="button-wrap"><span class="icon icon-language "></span>English (US)</span></button><div class="hidden"><ul class="submenu language-menu  " aria-labelledby="language-menu-button"><li class=" "><form class="submenu-item locale-redirect-setting"><div class="group"><label class="switch"><input type="checkbox" name="locale-redirect"><span class="slider"></span><span class="label">Remember language</span></label><a href="https://github.com/orgs/mdn/discussions/739" rel="external noopener noreferrer" target="_blank" title="Enable this setting to automatically switch to this language when it's available. (Click to learn more.)"><span class="icon icon-question-mark "></span></a></div><section class="glean-thumbs"><span class="question">Is this useful?</span><button title="This feature is useful." type="button" class="button action has-icon thumbs"><span class="button-wrap"><span class="icon icon-thumbs-up "></span><span class="visually-hidden">This feature is useful.</span></span></button><button title="This feature is not useful." type="button" class="button action has-icon thumbs"><span class="button-wrap"><span class="icon icon-thumbs-down "></span><span class="visually-hidden">This feature is not useful.</span></span></button></section></form></li><li class=" "><a data-locale="de" href="/de/docs/Web/API/Range/isPointInRange" class="button submenu-item"><span>Deutsch</span><span title="Diese Übersetzung ist Teil eines Experiments."><span class="icon icon-experimental "></span></span></a></li><li class=" "><a data-locale="ja" href="/ja/docs/Web/API/Range/isPointInRange" class="button submenu-item"><span>日本語</span></a></li></ul></div></div></li></ul></div></div></div></div><div class="main-wrapper"><div class="sidebar-container"><aside id="sidebar-quicklinks" class="sidebar"><button type="button" class="button action backdrop" aria-label="Collapse sidebar"><span class="button-wrap"></span></button><nav aria-label="Related Topics" class="sidebar-inner"><header class="sidebar-actions"><section class="sidebar-filter-container"><div class="sidebar-filter "><label id="sidebar-filter-label" class="sidebar-filter-label" for="sidebar-filter-input"><span class="icon icon-filter"></span><span class="visually-hidden">Filter sidebar</span></label><input id="sidebar-filter-input" autocomplete="off" class="sidebar-filter-input-field false" type="text" placeholder="Filter" value=""><button type="button" class="button action has-icon clear-sidebar-filter-button"><span class="button-wrap"><span class="icon icon-cancel "></span><span class="visually-hidden">Clear filter input</span></span></button></div></section></header><div class="sidebar-inner-nav"><div class="in-nav-toc"><div class="document-toc-container"><section class="document-toc"><header><h2 class="document-toc-heading">In this article</h2></header><ul class="document-toc-list"><li class="document-toc-item "><a class="document-toc-link" href="#syntax" aria-current="true">Syntax</a></li><li class="document-toc-item "><a class="document-toc-link" href="#examples">Examples</a></li><li class="document-toc-item "><a class="document-toc-link" href="#specifications">Specifications</a></li><li class="document-toc-item "><a class="document-toc-link" href="#browser_compatibility">Browser compatibility</a></li><li class="document-toc-item "><a class="document-toc-link" href="#see_also">See also</a></li></ul></section></div></div><div class="sidebar-body"><ol><li class="section"><a href="/en-US/docs/Web/API/Document_Object_Model">Document Object Model (DOM)</a></li><li class="section"><a href="/en-US/docs/Web/API/Range"><code>Range</code></a></li><li class="toggle"><details open=""><summary>Constructor</summary><ol><li><a href="/en-US/docs/Web/API/Range/Range"><code>Range()</code></a></li></ol></details></li><li class="toggle"><details open=""><summary>Instance properties</summary><ol><li><a href="/en-US/docs/Web/API/Range/collapsed"><code>collapsed</code></a></li><li><a href="/en-US/docs/Web/API/Range/commonAncestorContainer"><code>commonAncestorContainer</code></a></li><li><a href="/en-US/docs/Web/API/Range/endContainer"><code>endContainer</code></a></li><li><a href="/en-US/docs/Web/API/Range/endOffset"><code>endOffset</code></a></li><li><a href="/en-US/docs/Web/API/Range/startContainer"><code>startContainer</code></a></li><li><a href="/en-US/docs/Web/API/Range/startOffset"><code>startOffset</code></a></li></ol></details></li><li class="toggle"><details open=""><summary>Instance methods</summary><ol><li><a href="/en-US/docs/Web/API/Range/cloneContents"><code>cloneContents()</code></a></li><li><a href="/en-US/docs/Web/API/Range/cloneRange"><code>cloneRange()</code></a></li><li><a href="/en-US/docs/Web/API/Range/collapse"><code>collapse()</code></a></li><li><a href="/en-US/docs/Web/API/Range/compareBoundaryPoints"><code>compareBoundaryPoints()</code></a></li><li><a href="/en-US/docs/Web/API/Range/compareNode"><code>compareNode()</code></a><abbr class="icon icon-nonstandard" title="Non-standard. Check cross-browser support before using.">
<span class="visually-hidden">Non-standard</span>
</abbr><abbr class="icon icon-deprecated" title="Deprecated. Not for use in new websites.">
<span class="visually-hidden">Deprecated</span>
</abbr></li><li><a href="/en-US/docs/Web/API/Range/comparePoint"><code>comparePoint()</code></a></li><li><a href="/en-US/docs/Web/API/Range/createContextualFragment"><code>createContextualFragment()</code></a></li><li><a href="/en-US/docs/Web/API/Range/deleteContents"><code>deleteContents()</code></a></li><li><a href="/en-US/docs/Web/API/Range/detach"><code>detach()</code></a></li><li><a href="/en-US/docs/Web/API/Range/extractContents"><code>extractContents()</code></a></li><li><a href="/en-US/docs/Web/API/Range/getBoundingClientRect"><code>getBoundingClientRect()</code></a></li><li><a href="/en-US/docs/Web/API/Range/getClientRects"><code>getClientRects()</code></a></li><li><a href="/en-US/docs/Web/API/Range/insertNode"><code>insertNode()</code></a></li><li><a href="/en-US/docs/Web/API/Range/intersectsNode"><code>intersectsNode()</code></a></li><li><em><a href="/en-US/docs/Web/API/Range/isPointInRange" aria-current="page"><code>isPointInRange()</code></a></em></li><li><a href="/en-US/docs/Web/API/Range/selectNode"><code>selectNode()</code></a></li><li><a href="/en-US/docs/Web/API/Range/selectNodeContents"><code>selectNodeContents()</code></a></li><li><a href="/en-US/docs/Web/API/Range/setEnd"><code>setEnd()</code></a></li><li><a href="/en-US/docs/Web/API/Range/setEndAfter"><code>setEndAfter()</code></a></li><li><a href="/en-US/docs/Web/API/Range/setEndBefore"><code>setEndBefore()</code></a></li><li><a href="/en-US/docs/Web/API/Range/setStart"><code>setStart()</code></a></li><li><a href="/en-US/docs/Web/API/Range/setStartAfter"><code>setStartAfter()</code></a></li><li><a href="/en-US/docs/Web/API/Range/setStartBefore"><code>setStartBefore()</code></a></li><li><a href="/en-US/docs/Web/API/Range/surroundContents"><code>surroundContents()</code></a></li><li><a href="/en-US/docs/Web/API/Range/toString"><code>toString()</code></a></li></ol></details></li><li class="toggle"><details open=""><summary>Inheritance</summary><ol><li><a href="/en-US/docs/Web/API/AbstractRange"><code>AbstractRange</code></a></li></ol></details></li><li class="toggle"><details open=""><summary>Related pages for DOM</summary><ol><li><a href="/en-US/docs/Web/API/AbortController"><code>AbortController</code></a></li><li><a href="/en-US/docs/Web/API/AbortSignal"><code>AbortSignal</code></a></li><li><a href="/en-US/docs/Web/API/AbstractRange"><code>AbstractRange</code></a></li><li><a href="/en-US/docs/Web/API/Attr"><code>Attr</code></a></li><li><a href="/en-US/docs/Web/API/CDATASection"><code>CDATASection</code></a></li><li><a href="/en-US/docs/Web/API/CharacterData"><code>CharacterData</code></a></li><li><a href="/en-US/docs/Web/API/Comment"><code>Comment</code></a></li><li><a href="/en-US/docs/Web/API/CustomEvent"><code>CustomEvent</code></a></li><li><a href="/en-US/docs/Web/API/DOMError"><code>DOMError</code></a><abbr class="icon icon-deprecated" title="Deprecated. Not for use in new websites.">
<span class="visually-hidden">Deprecated</span>
</abbr></li><li><a href="/en-US/docs/Web/API/DOMException"><code>DOMException</code></a></li><li><a href="/en-US/docs/Web/API/DOMImplementation"><code>DOMImplementation</code></a></li><li><a href="/en-US/docs/Web/API/DOMParser"><code>DOMParser</code></a></li><li><a href="/en-US/docs/Web/API/DOMPoint"><code>DOMPoint</code></a></li><li><a href="/en-US/docs/Web/API/DOMPointReadOnly"><code>DOMPointReadOnly</code></a></li><li><a href="/en-US/docs/Web/API/DOMRect"><code>DOMRect</code></a></li><li><a href="/en-US/docs/Web/API/DOMTokenList"><code>DOMTokenList</code></a></li><li><a href="/en-US/docs/Web/API/Document"><code>Document</code></a></li><li><a href="/en-US/docs/Web/API/DocumentFragment"><code>DocumentFragment</code></a></li><li><a href="/en-US/docs/Web/API/DocumentType"><code>DocumentType</code></a></li><li><a href="/en-US/docs/Web/API/Element"><code>Element</code></a></li><li><a href="/en-US/docs/Web/API/Event"><code>Event</code></a></li><li><a href="/en-US/docs/Web/API/EventTarget"><code>EventTarget</code></a></li><li><a href="/en-US/docs/Web/API/HTMLCollection"><code>HTMLCollection</code></a></li><li><a href="/en-US/docs/Web/API/MutationObserver"><code>MutationObserver</code></a></li><li><a href="/en-US/docs/Web/API/MutationRecord"><code>MutationRecord</code></a></li><li><a href="/en-US/docs/Web/API/NamedNodeMap"><code>NamedNodeMap</code></a></li><li><a href="/en-US/docs/Web/API/Node"><code>Node</code></a></li><li><a href="/en-US/docs/Web/API/NodeIterator"><code>NodeIterator</code></a></li><li><a href="/en-US/docs/Web/API/NodeList"><code>NodeList</code></a></li><li><a href="/en-US/docs/Web/API/ProcessingInstruction"><code>ProcessingInstruction</code></a></li><li><a href="/en-US/docs/Web/API/StaticRange"><code>StaticRange</code></a></li><li><a href="/en-US/docs/Web/API/Text"><code>Text</code></a></li><li><a href="/en-US/docs/Web/API/TextDecoder"><code>TextDecoder</code></a></li><li><a href="/en-US/docs/Web/API/TextEncoder"><code>TextEncoder</code></a></li><li><a href="/en-US/docs/Web/API/TimeRanges"><code>TimeRanges</code></a></li><li><a href="/en-US/docs/Web/API/TreeWalker"><code>TreeWalker</code></a></li><li><a href="/en-US/docs/Web/API/XMLDocument"><code>XMLDocument</code></a></li></ol></details></li></ol></div></div><section class="place side"></section></nav></aside><div class="toc-container"><aside class="toc"><nav><div class="document-toc-container"><section class="document-toc"><header><h2 class="document-toc-heading">In this article</h2></header><ul class="document-toc-list"><li class="document-toc-item "><a class="document-toc-link" href="#syntax" aria-current="true">Syntax</a></li><li class="document-toc-item "><a class="document-toc-link" href="#examples">Examples</a></li><li class="document-toc-item "><a class="document-toc-link" href="#specifications">Specifications</a></li><li class="document-toc-item "><a class="document-toc-link" href="#browser_compatibility">Browser compatibility</a></li><li class="document-toc-item "><a class="document-toc-link" href="#see_also">See also</a></li></ul></section></div></nav></aside><section class="place side"></section></div></div><main id="content" class="main-content  "><article class="main-page-content" lang="en-US"><header><h1>Range: isPointInRange() method</h1><details class="baseline-indicator high"><summary><span class="indicator" role="img" aria-label="Baseline Check"></span><div class="status-title">Baseline<!-- --> <span class="not-bold">Widely available</span></div><div class="browsers"><span class="engine" title="Supported in Chrome and Edge"><span class="browser chrome supported" role="img" aria-label="Chrome check"></span><span class="browser edge supported" role="img" aria-label="Edge check"></span></span><span class="engine" title="Supported in Firefox"><span class="browser firefox supported" role="img" aria-label="Firefox check"></span></span><span class="engine" title="Supported in Safari"><span class="browser safari supported" role="img" aria-label="Safari check"></span></span></div><span class="icon icon-chevron "></span></summary><div class="extra"><p>This feature is well established and works across many devices and browser versions. It’s been available across browsers since<!-- --> <!-- -->April 2017<!-- -->.</p><ul><li><a href="/en-US/docs/Glossary/Baseline/Compatibility" data-glean="baseline_link_learn_more" target="_blank" class="learn-more">Learn more</a></li><li><a href="#browser_compatibility" data-glean="baseline_link_bcd_table">See full compatibility</a></li><li><a href="https://survey.alchemer.com/s3/7634825/MDN-baseline-feedback?page=%2Fen-US%2Fdocs%2FWeb%2FAPI%2FRange%2FisPointInRange&amp;level=high" data-glean="baseline_link_feedback" class="feedback-link" target="_blank" rel="noreferrer">Report feedback</a></li></ul></div></details></header><div class="section-content"><p>The <strong><code>isPointInRange()</code></strong> method of the <a href="/en-US/docs/Web/API/Range"><code>Range</code></a> interface determines whether a specified point is within the <a href="/en-US/docs/Web/API/Range"><code>Range</code></a>. The point is specified by a reference node and an offset within that node. It is equivalent to calling <a href="/en-US/docs/Web/API/Range/comparePoint"><code>Range.comparePoint()</code></a> and checking if the result is <code>0</code>.</p></div><section aria-labelledby="syntax"><h2 id="syntax"><a href="#syntax">Syntax</a></h2><div class="section-content"><div class="code-example"><div class="example-header"><span class="language-name">js</span><button type="button" class="icon copy-icon"><span class="visually-hidden">Copy to Clipboard</span></button><span class="copy-icon-message visually-hidden" role="alert"></span></div><pre class="brush: js notranslate"><code><span class="token function">isPointInRange</span><span class="token punctuation">(</span>referenceNode<span class="token punctuation">,</span> offset<span class="token punctuation">)</span>
</code></pre></div></div></section><section aria-labelledby="parameters"><h3 id="parameters"><a href="#parameters">Parameters</a></h3><div class="section-content"><dl>
<dt id="referencenode"><a href="#referencenode"><code>referenceNode</code></a></dt>
<dd>
<p>The <a href="/en-US/docs/Web/API/Node"><code>Node</code></a> that the <code>offset</code> is relative to.</p>
</dd>
<dt id="offset"><a href="#offset"><code>offset</code></a></dt>
<dd>
<p>An integer greater than or equal to zero describing the position inside <code>referenceNode</code> of the point to be checked. If <code>referenceNode</code> is a <a href="/en-US/docs/Web/API/Node"><code>Node</code></a> of type <a href="/en-US/docs/Web/API/Text"><code>Text</code></a>, <a href="/en-US/docs/Web/API/Comment"><code>Comment</code></a>, or <a href="/en-US/docs/Web/API/CDATASection"><code>CDATASection</code></a>, then <code>offset</code> is the number of characters from the start of <code>referenceNode</code>. For other <a href="/en-US/docs/Web/API/Node"><code>Node</code></a> types, <code>offset</code> is the number of child nodes from the start of the <code>referenceNode</code>.</p>
</dd>
</dl></div></section><section aria-labelledby="return_value"><h3 id="return_value"><a href="#return_value">Return value</a></h3><div class="section-content"><p>A boolean.</p></div></section><section aria-labelledby="examples"><h2 id="examples"><a href="#examples">Examples</a></h2><div class="section-content"><div class="code-example"><div class="example-header"><span class="language-name">js</span><button type="button" class="icon copy-icon"><span class="visually-hidden">Copy to Clipboard</span></button><span class="copy-icon-message visually-hidden" role="alert"></span></div><pre class="brush: js notranslate"><code><span class="token keyword">const</span> text <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Text</span><span class="token punctuation">(</span><span class="token string">"0123456789"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> thisRange <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Range</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
thisRange<span class="token punctuation">.</span><span class="token function">setStart</span><span class="token punctuation">(</span>text<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
thisRange<span class="token punctuation">.</span><span class="token function">setEnd</span><span class="token punctuation">(</span>text<span class="token punctuation">,</span> <span class="token number">6</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

thisRange<span class="token punctuation">.</span><span class="token function">isPointInRange</span><span class="token punctuation">(</span>text<span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span>
thisRange<span class="token punctuation">.</span><span class="token function">isPointInRange</span><span class="token punctuation">(</span>text<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// false</span>
thisRange<span class="token punctuation">.</span><span class="token function">isPointInRange</span><span class="token punctuation">(</span>text<span class="token punctuation">,</span> <span class="token number">6</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span>
thisRange<span class="token punctuation">.</span><span class="token function">isPointInRange</span><span class="token punctuation">(</span>text<span class="token punctuation">,</span> <span class="token number">7</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// false</span>
</code></pre></div></div></section><h2 id="specifications"><a href="#specifications">Specifications</a></h2><table class="standard-table"><thead><tr><th scope="col">Specification</th></tr></thead><tbody><tr><td><a href="https://dom.spec.whatwg.org/#dom-range-ispointinrange">DOM<!-- --> <br><small># <!-- -->dom-range-ispointinrange</small></a></td></tr></tbody></table><h2 id="browser_compatibility"><a href="#browser_compatibility">Browser compatibility</a></h2><lazy-compat-table></lazy-compat-table><section aria-labelledby="see_also"><h2 id="see_also"><a href="#see_also">See also</a></h2><div class="section-content"><ul>
<li><a href="/en-US/docs/Web/API/Document_Object_Model">The DOM interfaces index</a></li>
</ul></div></section></article><aside class="article-footer"><div class="article-footer-inner"><div class="svg-container"><svg xmlns="http://www.w3.org/2000/svg" width="162" height="162" viewBox="0 0 162 162" fill="none" role="none"><mask id="b" fill="#fff"><path d="M97.203 47.04c8.113-7.886 18.004-13.871 28.906-17.492a78 78 0 0 1 33.969-3.39c11.443 1.39 22.401 5.295 32.024 11.411s17.656 14.28 23.476 23.86c5.819 9.579 9.269 20.318 10.083 31.385a69.85 69.85 0 0 1-5.387 32.44c-4.358 10.272-11.115 19.443-19.747 26.801-8.632 7.359-18.908 12.709-30.034 15.637l-6.17-21.698c7.666-2.017 14.746-5.703 20.694-10.773 5.948-5.071 10.603-11.389 13.606-18.467a48.14 48.14 0 0 0 3.712-22.352c-.561-7.625-2.938-15.025-6.948-21.625s-9.544-12.226-16.175-16.44-14.181-6.904-22.065-7.863a53.75 53.75 0 0 0-23.405 2.336c-7.513 2.495-14.327 6.62-19.918 12.053z"></path></mask><path stroke="url(#a)" stroke-dasharray="6, 6" stroke-width="2" d="M97.203 47.04c8.113-7.886 18.004-13.871 28.906-17.492a78 78 0 0 1 33.969-3.39c11.443 1.39 22.401 5.295 32.024 11.411s17.656 14.28 23.476 23.86c5.819 9.579 9.269 20.318 10.083 31.385a69.85 69.85 0 0 1-5.387 32.44c-4.358 10.272-11.115 19.443-19.747 26.801-8.632 7.359-18.908 12.709-30.034 15.637l-6.17-21.698c7.666-2.017 14.746-5.703 20.694-10.773 5.948-5.071 10.603-11.389 13.606-18.467a48.14 48.14 0 0 0 3.712-22.352c-.561-7.625-2.938-15.025-6.948-21.625s-9.544-12.226-16.175-16.44-14.181-6.904-22.065-7.863a53.75 53.75 0 0 0-23.405 2.336c-7.513 2.495-14.327 6.62-19.918 12.053z" mask="url(#b)" style="stroke:url(#a)" transform="translate(-63.992 -25.587)"></path><ellipse cx="8.066" cy="111.597" fill="var(--background-tertiary)" rx="53.677" ry="53.699" transform="matrix(.71707 -.697 .7243 .6895 0 0)"></ellipse><g clip-path="url(#c)" transform="translate(-63.992 -25.587)"><path fill="#9abff5" d="m144.256 137.379 32.906 12.434a4.41 4.41 0 0 1 2.559 5.667l-9.326 24.679a4.41 4.41 0 0 1-5.667 2.559l-8.226-3.108-2.332 6.17c-.466 1.233-.375 1.883-1.609 1.417l-2.253-.527c-.411-.155-.95-.594-1.206-1.161l-4.734-10.484-12.545-4.741a4.41 4.41 0 0 1-2.559-5.667l9.325-24.679a4.41 4.41 0 0 1 5.667-2.559m9.961 29.617 8.227 3.108 3.264-8.638-.498-6.768-4.113-1.555.548 7.258-4.319-1.632zm-12.339-4.663 8.226 3.108 3.264-8.637-.498-6.769-4.113-1.554.548 7.257-4.319-1.632z"></path></g><g clip-path="url(#d)" transform="translate(-63.992 -25.587)"><path fill="#81b0f3" d="M135.35 60.136 86.67 41.654c-3.346-1.27-7.124.428-8.394 3.775L64.414 81.938c-1.27 3.347.428 7.125 3.774 8.395l12.17 4.62-3.465 9.128c-.693 1.826-1.432 2.457.394 3.15l3.014 1.625c.609.231 1.637.274 2.477-.104l15.53-6.983 18.56 7.047c3.346 1.27 7.124-.428 8.395-3.775l13.862-36.51c1.27-3.346-.428-7.124-3.775-8.395M95.261 83.207l-12.17-4.62 4.852-12.779 7.19-7.017 6.085 2.31-7.725 7.51 6.389 2.426zm18.255 6.93-12.17-4.62 4.852-12.778 7.189-7.017 6.085 2.31-7.725 7.51 6.39 2.426z"></path></g><defs><clipPath id="c"><path fill="#fff" d="m198.638 146.586-65.056-24.583-24.583 65.057 65.056 24.582z"></path></clipPath><clipPath id="d"><path fill="#fff" d="m66.438 14.055 96.242 36.54-36.54 96.243-96.243-36.54z"></path></clipPath><linearGradient id="a" x1="97.203" x2="199.995" y1="47.04" y2="152.793" gradientUnits="userSpaceOnUse"><stop stop-color="#086DFC"></stop><stop offset="0.246" stop-color="#2C81FA"></stop><stop offset="0.516" stop-color="#5497F8"></stop><stop offset="0.821" stop-color="#80B0F6"></stop><stop offset="1" stop-color="#9ABFF5"></stop></linearGradient></defs></svg></div><h2>Help improve MDN</h2><fieldset class="feedback"><label>Was this page helpful to you?</label><div class="button-container"><button type="button" class="button primary has-icon yes"><span class="button-wrap"><span class="icon icon-thumbs-up "></span>Yes</span></button><button type="button" class="button primary has-icon no"><span class="button-wrap"><span class="icon icon-thumbs-down "></span>No</span></button></div></fieldset><a class="contribute" href="https://github.com/mdn/content/blob/main/CONTRIBUTING.md" title="This will take you to our contribution guidelines on GitHub." target="_blank" rel="noopener noreferrer">Learn how to contribute</a>.<p class="last-modified-date">This page was last modified on<!-- --> <time datetime="2025-03-20T23:15:08.000Z">Mar 20, 2025</time> by<!-- --> <a href="/en-US/docs/Web/API/Range/isPointInRange/contributors.txt" rel="nofollow">MDN contributors</a>.</p><div id="on-github" class="on-github"><a href="https://github.com/mdn/content/blob/main/files/en-us/web/api/range/ispointinrange/index.md?plain=1" title="Folder: en-us/web/api/range/ispointinrange (Opens in a new tab)" target="_blank" rel="noopener noreferrer">View this page on GitHub</a> <!-- -->•<!-- --> <a href="https://github.com/mdn/content/issues/new?template=page-report.yml&amp;mdn-url=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FRange%2FisPointInRange&amp;metadata=%3C%21--+Do+not+make+changes+below+this+line+--%3E%0A%3Cdetails%3E%0A%3Csummary%3EPage+report+details%3C%2Fsummary%3E%0A%0A*+Folder%3A+%60en-us%2Fweb%2Fapi%2Frange%2Fispointinrange%60%0A*+MDN+URL%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FRange%2FisPointInRange%0A*+GitHub+URL%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fblob%2Fmain%2Ffiles%2Fen-us%2Fweb%2Fapi%2Frange%2Fispointinrange%2Findex.md%0A*+Last+commit%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fcommit%2F2c0de98b0607ef262d9ef0877259ba41aaf53e6d%0A*+Document+last+modified%3A+2025-03-20T23%3A15%3A08.000Z%0A%0A%3C%2Fdetails%3E" title="This will take you to GitHub to file a new issue." target="_blank" rel="noopener noreferrer">Report a problem with this content</a></div></div></aside></main></div><div class="bottom-banner-container" style="--place-banner-width: 728px; --place-hp-main-background: #181422; --place-bottom-banner-background: #181422; --place-bottom-banner-color: #FFFFFF;"><section class="place bottom-banner"><a class="pong" data-glean="pong: pong->click bottom-banner" href="/pong/click?code=aHR0cHM6Ly9zcnYuYnV5c2VsbGFkcy5jb20vYWRzL2NsaWNrL3gvR1RORDQyN1dDQUJEVDI3SkZUWUxZS1FVQ0VTSUwyM0VDV1lETFozSkNBQkQ1MjdZRlQ3SVZLSktDNkJJVEtRWUZUU0k0MjNJRlRCSUVLN0VDVFNEUEs3TEhFWUk1MjNVQ0U3RFAySkVDVE5DWUJaNTJL.trFUDeFiIfQjo%2FMhoIeH7u5rpGsC%2F2yknoiiBfwGCNk%3D&amp;version=2" target="_blank" rel="sponsored noreferrer"><img src="/pimg/aHR0cHM6Ly9zdGF0aWM0LmJ1eXNlbGxhZHMubmV0L3V1LzIvMTYyNjkwLzE3NDU1MzE0MzQtR2l0TGFiLUFJLUd1aWRlXzE0NTYuanBn.8MW5NaLbH8tYeBlLhZOcS5Zv4MaqNGZtYKIXbT9ghjQ%3D" alt="GitLab" width="728" height="90"></a><a href="/en-US/advertising" class="pong-note" data-glean="pong: pong->about" target="_blank" rel="noreferrer">Ad</a></section></div></div><footer id="nav-footer" class="page-footer"><div class="page-footer-grid"><div class="page-footer-logo-col"><a href="/" class="mdn-footer-logo" aria-label="MDN homepage"><svg width="48" height="17" viewBox="0 0 48 17" fill="none" xmlns="http://www.w3.org/2000/svg"><title id="mdn-footer-logo-svg">MDN logo</title><path d="M20.04 16.512H15.504V10.416C15.504 9.488 15.344 8.824 15.024 8.424C14.72 8.024 14.264 7.824 13.656 7.824C12.92 7.824 12.384 8.064 12.048 8.544C11.728 9.024 11.568 9.64 11.568 10.392V14.184H13.008V16.512H8.472V10.416C8.472 9.488 8.312 8.824 7.992 8.424C7.688 8.024 7.232 7.824 6.624 7.824C5.872 7.824 5.336 8.064 5.016 8.544C4.696 9.024 4.536 9.64 4.536 10.392V14.184H6.6V16.512H0V14.184H1.44V8.04H0.024V5.688H4.536V7.32C5.224 6.088 6.32 5.472 7.824 5.472C8.608 5.472 9.328 5.664 9.984 6.048C10.64 6.432 11.096 7.016 11.352 7.8C11.992 6.248 13.168 5.472 14.88 5.472C15.856 5.472 16.72 5.776 17.472 6.384C18.224 6.992 18.6 7.936 18.6 9.216V14.184H20.04V16.512Z" fill="currentColor"></path><path d="M33.6714 16.512H29.1354V14.496C28.8314 15.12 28.3834 15.656 27.7914 16.104C27.1994 16.536 26.4154 16.752 25.4394 16.752C24.0154 16.752 22.8954 16.264 22.0794 15.288C21.2634 14.312 20.8554 12.984 20.8554 11.304C20.8554 9.688 21.2554 8.312 22.0554 7.176C22.8554 6.04 24.0634 5.472 25.6794 5.472C26.5594 5.472 27.2794 5.648 27.8394 6C28.3994 6.352 28.8314 6.8 29.1354 7.344V2.352H26.9754V0H32.2314V14.184H33.6714V16.512ZM29.1354 11.04V10.776C29.1354 9.88 28.8954 9.184 28.4154 8.688C27.9514 8.176 27.3674 7.92 26.6634 7.92C25.9754 7.92 25.3674 8.176 24.8394 8.688C24.3274 9.2 24.0714 10.008 24.0714 11.112C24.0714 12.152 24.3114 12.944 24.7914 13.488C25.2714 14.032 25.8394 14.304 26.4954 14.304C27.3114 14.304 27.9514 13.96 28.4154 13.272C28.8954 12.584 29.1354 11.84 29.1354 11.04Z" fill="currentColor"></path><path d="M47.9589 16.512H41.9829V14.184H43.4229V10.416C43.4229 9.488 43.2629 8.824 42.9429 8.424C42.6389 8.024 42.1829 7.824 41.5749 7.824C40.8389 7.824 40.2709 8.056 39.8709 8.52C39.4709 8.968 39.2629 9.56 39.2469 10.296V14.184H40.6869V16.512H34.7109V14.184H36.1509V8.04H34.5909V5.688H39.2469V7.344C39.9669 6.096 41.1269 5.472 42.7269 5.472C43.7509 5.472 44.6389 5.776 45.3909 6.384C46.1429 6.992 46.5189 7.936 46.5189 9.216V14.184H47.9589V16.512Z" fill="currentColor"></path></svg></a><p>Your blueprint for a better internet.</p><ul class="social-icons"><li><a href="https://bsky.app/profile/developer.mozilla.org" target="_blank" rel="me noopener noreferrer"><span class="icon icon-bluesky"></span><span class="visually-hidden">MDN on Bluesky</span></a></li><li><a href="https://mastodon.social/@mdn" target="_blank" rel="me noopener noreferrer"><span class="icon icon-mastodon"></span><span class="visually-hidden">MDN on Mastodon</span></a></li><li><a href="https://twitter.com/mozdevnet" target="_blank" rel="noopener noreferrer"><span class="icon icon-twitter-x"></span><span class="visually-hidden">MDN on X (formerly Twitter)</span></a></li><li><a href="https://github.com/mdn/" target="_blank" rel="noopener noreferrer"><span class="icon icon-github-mark-small"></span><span class="visually-hidden">MDN on GitHub</span></a></li><li><a href="/en-US/blog/rss.xml" target="_blank"><span class="icon icon-feed"></span><span class="visually-hidden">MDN Blog RSS Feed</span></a></li></ul></div><div class="page-footer-nav-col-1"><h2 class="footer-nav-heading">MDN</h2><ul class="footer-nav-list"><li class="footer-nav-item"><a href="/en-US/about">About</a></li><li class="footer-nav-item"><a href="/en-US/blog/">Blog</a></li><li class="footer-nav-item"><a href="https://www.mozilla.org/en-US/careers/listings/?team=ProdOps" target="_blank" rel="noopener noreferrer">Careers</a></li><li class="footer-nav-item"><a href="/en-US/advertising">Advertise with us</a></li></ul></div><div class="page-footer-nav-col-2"><h2 class="footer-nav-heading">Support</h2><ul class="footer-nav-list"><li class="footer-nav-item"><a class="footer-nav-link" href="https://support.mozilla.org/products/mdn-plus">Product help</a></li><li class="footer-nav-item"><a class="footer-nav-link" href="/en-US/docs/MDN/Community/Issues">Report an issue</a></li></ul></div><div class="page-footer-nav-col-3"><h2 class="footer-nav-heading">Our communities</h2><ul class="footer-nav-list"><li class="footer-nav-item"><a class="footer-nav-link" href="/en-US/community">MDN Community</a></li><li class="footer-nav-item"><a class="footer-nav-link" href="https://discourse.mozilla.org/c/mdn/236" target="_blank" rel="noopener noreferrer">MDN Forum</a></li><li class="footer-nav-item"><a class="footer-nav-link" href="/discord" target="_blank" rel="noopener noreferrer">MDN Chat</a></li></ul></div><div class="page-footer-nav-col-4"><h2 class="footer-nav-heading">Developers</h2><ul class="footer-nav-list"><li class="footer-nav-item"><a class="footer-nav-link" href="/en-US/docs/Web">Web Technologies</a></li><li class="footer-nav-item"><a class="footer-nav-link" href="/en-US/docs/Learn">Learn Web Development</a></li><li class="footer-nav-item"><a class="footer-nav-link" href="/en-US/plus">MDN Plus</a></li><li class="footer-nav-item"><a href="https://hacks.mozilla.org/" target="_blank" rel="noopener noreferrer">Hacks Blog</a></li></ul></div><div class="page-footer-moz"><a href="https://www.mozilla.org/" class="footer-moz-logo-link" target="_blank" rel="noopener noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="137" height="32" fill="none" viewBox="0 0 267.431 62.607"><path fill="currentColor" d="m13.913 23.056 5.33 25.356h2.195l5.33-25.356h14.267v38.976h-7.578V29.694h-2.194l-7.264 32.337h-7.343L9.418 29.694H7.223v32.337H-.354V23.056Zm47.137 9.123c9.12 0 14.423 5.385 14.423 15.214s-5.33 15.214-14.423 15.214c-9.12 0-14.423-5.385-14.423-15.214 0-9.855 5.304-15.214 14.423-15.214m0 24.363c4.285 0 6.428-2.196 6.428-7.032v-4.287c0-4.836-2.143-7.032-6.428-7.032s-6.428 2.196-6.428 7.032v4.287c0 4.836 2.143 7.032 6.428 7.032m18.473-.157 15.47-18.01h-15.26v-5.647h24.352v5.646L88.616 56.385h15.704v5.646H79.523Zm29.318-23.657h11.183V62.03h-7.578V38.375h-3.632v-5.646zm3.605-9.672h7.578v5.646h-7.578zm13.17 0h11.21v38.976h-7.578v-33.33h-3.632zm16.801 0H153.6v38.976h-7.577v-33.33h-3.632v-5.646zm29.03 9.123c4.442 0 7.394 2.143 8.231 5.881h2.194v-5.332h9.276v5.646h-3.632v18.011h3.632v5.646h-4.442c-3.135 0-4.834-1.699-4.834-4.836V56.7h-2.194c-.81 3.738-3.789 5.881-8.23 5.881-6.978 0-11.916-5.829-11.916-15.214 0-9.384 4.938-15.187 11.915-15.187m2.3 24.363c4.284 0 6.192-2.196 6.192-7.032v-4.287c0-4.836-1.908-7.032-6.193-7.032-4.18 0-6.193 2.196-6.193 7.032v4.287c0 4.836 2.012 7.032 6.193 7.032m48.34 5.489h-7.577V0h7.577zm6.585-29.643h32.165v-2.196l-21.295-7.634v-6.143l21.295-7.633V6.588h-25.345V0h32.165v12.522l-17.35 5.881V20.6l17.35 5.882v12.521h-38.985zm0-25.801h6.794v6.796h-6.794z"></path></svg></a><ul class="footer-moz-list"><li class="footer-moz-item"><a href="https://www.mozilla.org/privacy/websites/" class="footer-moz-link" target="_blank" rel="noopener noreferrer">Website Privacy Notice</a></li><li class="footer-moz-item"><a href="https://www.mozilla.org/privacy/websites/#cookies" class="footer-moz-link" target="_blank" rel="noopener noreferrer">Cookies</a></li><li class="footer-moz-item"><a href="https://www.mozilla.org/about/legal/terms/mozilla" class="footer-moz-link" target="_blank" rel="noopener noreferrer">Legal</a></li><li class="footer-moz-item"><a href="https://www.mozilla.org/about/governance/policies/participation/" class="footer-moz-link" target="_blank" rel="noopener noreferrer">Community Participation Guidelines</a></li></ul></div><div class="page-footer-legal"><p id="license" class="page-footer-legal-text">Visit<!-- --> <a href="https://www.mozilla.org" target="_blank" rel="noopener noreferrer">Mozilla Corporation’s</a> <!-- -->not-for-profit parent, the<!-- --> <a target="_blank" rel="noopener noreferrer" href="https://foundation.mozilla.org/">Mozilla Foundation</a>.<br>Portions of this content are ©1998–<!-- -->2025<!-- --> by individual mozilla.org contributors. Content available under<!-- --> <a href="/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license">a Creative Commons license</a>.</p></div></div></footer></div>
`.replaceAll(/\n */g, '');


describe("basic test", () => {
  test("basic test", () => {
    expect(2).toBe(2);
  })

  test("jsdom example", () => {
    const div = document.createElement("div");
    document.body.append(div);
    expect(document.querySelector("div")).toBe(div);
    expect(div).toBeInstanceOf(HTMLDivElement);
  })


  test("confirmHTML is working", () => {
    document.body.innerHTML = startingHTML;
    expect(document.body.innerHTML).toBe(startingHTML);
  })

});


describe("test getRangeChildNodes", function() {

  const htmlAsNode = new DOMParser()
    .parseFromString(startingHTML, "text/html").body;

  const containingDiv = htmlAsNode.childNodes[0];

  const firstStrong = containingDiv.childNodes[0];
  const firstStrongText = firstStrong.childNodes[0];

  const firstItalics = containingDiv.childNodes[1];
  const firstItalicsText = firstItalics.childNodes[0];

  const orphanText = containingDiv.childNodes[2];

  const secondStrong = containingDiv.childNodes[3];
  const secondStrongFirstText = secondStrong.childNodes[0];
  const secondStrongFirstItalics = secondStrong.childNodes[1];
  const secondStrongFirstItalicsText = secondStrongFirstItalics.childNodes[0];
  const secondStrongSecondText = secondStrong.childNodes[2];



  test("make sure nodes are what they should be", function() {
    expect(firstStrong.textContent).toBe("Strong Text");
    expect(firstStrong.nodeType).toBe(Node.ELEMENT_NODE);
    expect((firstStrong as Element).tagName).toBe("STRONG");

    expect(firstStrongText.textContent).toBe("Strong Text");
    expect(firstStrongText.nodeType).toBe(Node.TEXT_NODE);

    expect(firstItalics.textContent).toBe("Italics Text");
    expect(firstItalics.nodeType).toBe(Node.ELEMENT_NODE);
    expect((firstItalics as Element).tagName).toBe("I");

    expect(firstItalicsText.textContent).toBe("Italics Text");
    expect(firstItalicsText.nodeType).toBe(Node.TEXT_NODE);

    expect(orphanText.textContent).toBe("Orphan Text");
    expect(orphanText.nodeType).toBe(Node.TEXT_NODE);

    expect(secondStrong.textContent).toBe("Strong TextStrong and Italics TextMore Strong Text");
    expect(secondStrong.nodeType).toBe(Node.ELEMENT_NODE);
    expect((secondStrong as Element).tagName).toBe("STRONG");

    expect(secondStrongFirstText.textContent).toBe("Strong Text");
    expect(secondStrongFirstText.nodeType).toBe(Node.TEXT_NODE);

    expect(secondStrongFirstItalics.textContent).toBe("Strong and Italics Text");
    expect(secondStrongFirstItalics.nodeType).toBe(Node.ELEMENT_NODE);
    expect((secondStrongFirstItalics as Element).tagName).toBe("I");

    expect(secondStrongFirstItalicsText.textContent).toBe("Strong and Italics Text");
    expect(secondStrongFirstItalicsText.nodeType).toBe(Node.TEXT_NODE);   

    expect(secondStrongSecondText.textContent).toBe("More Strong Text");
    expect(secondStrongSecondText.nodeType).toBe(Node.TEXT_NODE);   


  }) 

  test("get nodes covering text within strongText", function() {
    const range = new Range();
    range.setStart(firstStrongText, 0);
    range.setEnd(firstStrongText, 11);
    const nodes = getRangeChildNodes(range, htmlAsNode);
    expect(nodes.length).toBe(1);
    expect(nodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes[0].textContent).toBe("Strong Text");
  })

  test("get nodes covering text across nodes", function() {
    const range = new Range();
    range.setStart(firstStrongText, 7);
    range.setEnd(orphanText, 6);
    expect(range.toString()).toBe("TextItalics TextOrphan");
    const nodes = getRangeChildNodes(range, htmlAsNode);
    expect(nodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes[1].nodeType).toBe(Node.ELEMENT_NODE);
    expect(nodes[2].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes[3].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes[0]).toBe(firstStrongText);
    expect(nodes[1]).toBe(firstItalics);
    expect(nodes[2]).toBe(firstItalicsText);
    expect(nodes[3]).toBe(orphanText);
    expect(nodes.length).toBe(4);
  })

  test("get nodes when range starts in non-text node", function() {
    const range = new Range();
    range.setStart(containingDiv, 1);
    range.setEnd(orphanText, 6);
    expect(range.toString()).toBe("Italics TextOrphan");
    const nodes = getRangeChildNodes(range, containingDiv);
    expect(nodes[0]).toBe(firstItalics);
    expect(nodes[1]).toBe(firstItalicsText);
    expect(nodes[2]).toBe(orphanText);
    expect(nodes.length).toBe(3);
  })

  test("get nodes when range ends in non-text node", function() {
    const range = new Range();
    range.setStart(containingDiv, 1);
    range.setEnd(containingDiv, 3);
    expect(range.toString()).toBe("Italics TextOrphan Text");
    const nodes = getRangeChildNodes(range, containingDiv);
    expect(nodes[0]).toBe(firstItalics);
    expect(nodes[1]).toBe(firstItalicsText);
    expect(nodes[2]).toBe(orphanText);
    expect(nodes.length).toBe(3);
  })

  test("get nodes when range ends in non-text node 2", function() {
    const range = new Range();
    range.setStart(firstStrongText, 2);
    range.setEnd(containingDiv, 2);
    expect(range.toString()).toBe("rong TextItalics Text");
    const nodes = getRangeChildNodes(range, containingDiv);
    expect(nodes[0]).toBe(firstStrongText);
    expect(nodes[1]).toBe(firstItalics);
    expect(nodes[2]).toBe(firstItalicsText);
    expect(nodes.length).toBe(3);
  })

})


describe("test setSelection", function() {

  test("set Selection on text inside italics node", function() {
    const italics = document.querySelector("i");
    expect(italics).not.toBeNull();
    const selection = setSelection(italics!, 0, italics!, italics!.childNodes.length);
    expect(selection?.toString()).toEqual(italics!.textContent);
  })

  test("set Selection on limited text inside italics node", function() {
    const italics = document.querySelector("i#italics-2");
    expect(italics).not.toBeNull();
    const italicsText = italics!.childNodes[0];
    const selection = setSelection(italicsText!, 7, italicsText!, 18);

    const range = new Range();
    range.setStart(italicsText, 7);
    range.setEnd(italicsText, 18);
    
    range.setStart(italicsText, 0);
    range.setEnd(italicsText, 7);

    expect(selection).not.toBeNull();
    expect(selection!.anchorNode?.nodeName).toBe("#text");
    expect(selection!.anchorNode).toBe(selection!.focusNode);
    expect(selection!.toString()).toEqual("and Italics")

  })

});


describe("test resetSelectionToTextNodes", function() {

  beforeEach(function() {
    document.body.innerHTML = mdnDocPageHTML;
  })


  const idealRangeText = "An integer greater than or equal to zero describing the position inside referenceNode of the point to be checked. If referenceNode is a Node of type Text, Comment, or CDATASection, then offset is the number of characters from the start of referenceNode. For other Node types, offset is the number of child nodes from the start of the referenceNode.";


  test("Set selection range to cover bounding p", function() {

    const selection = window.getSelection();
    expect(selection).not.toBeNull();
    const range = selection!.getRangeAt(0);
    const p = document.querySelector("#content > article > section:nth-child(4) > div > dl > dd:nth-child(4) > p");
    expect(p).not.toBeNull();
    range.setStartBefore(p!);
    range.setEndAfter(p!);

    const returnedSelection = resetSelectionToTextNodes();

    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.endContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.toString()).toEqual(idealRangeText);

  })


  test("set selection range to starting with text, ending covering bounding p", function() {

    const selection = window.getSelection();
    expect(selection).not.toBeNull();
    const range = selection!.getRangeAt(0);
    const p = document.querySelector("#content > article > section:nth-child(4) > div > dl > dd:nth-child(4) > p");
    expect(p).not.toBeNull();

    expect(p!.hasChildNodes()).toBe(true);
    expect(p!.childNodes[0].nodeType).toBe(Node.TEXT_NODE);

    range.setStart(p!.childNodes[0], 0);
    // console.log([range.startContainer, range.startContainer.textContent]);
    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);
    range.setEndAfter(p!);
    // console.log([range.endContainer, range.endContainer.textContent]);

    const returnedSelection = resetSelectionToTextNodes();

    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.endContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.toString()).toEqual(idealRangeText);

  })

  test("set selection to start with covering bounding p, end with text", function() {
    const selection = window.getSelection();
    expect(selection).not.toBeNull();
    const range = selection!.getRangeAt(0);
    const p = document.querySelector("#content > article > section:nth-child(4) > div > dl > dd:nth-child(4) > p");
    expect(p).not.toBeNull();
    range.setStart(p!.childNodes[0], 0);
    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);

    const lastTextNode = p!.childNodes[p!.childNodes.length-1];
    expect(lastTextNode).not.toBeNull();
    expect(lastTextNode.nodeType).toBe(Node.TEXT_NODE);
    range.setEnd(lastTextNode, lastTextNode!.textContent!.length);

    const returnedSelection = resetSelectionToTextNodes();

    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.endContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.toString()).toEqual(idealRangeText);
  })


  test("set selection to text at both ends", function() {
    const selection = window.getSelection();
    expect(selection).not.toBeNull();
    const range = selection!.getRangeAt(0);
    const p = document.querySelector("#content > article > section:nth-child(4) > div > dl > dd:nth-child(4) > p");
    expect(p).not.toBeNull();
    range.setStart(p!.childNodes[0], 0);
    const lastTextNode = p!.childNodes[p!.childNodes.length-1];
    expect(lastTextNode).not.toBeNull();
    expect(lastTextNode.nodeType).toBe(Node.TEXT_NODE);
    range.setEnd(lastTextNode, lastTextNode!.textContent!.length);

    const returnedSelection = resetSelectionToTextNodes();

    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.endContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.toString()).toEqual(idealRangeText);
  })
})



describe("test wrapInElement", function() {

  beforeEach(function() {
    document.body.innerHTML = startingHTML;
  })

  test("wrap element in element", function() {
    const italics = document.querySelector("i#italics-1");
    const anchor = document.createElement("a");
    const italicsTextContent = italics?.textContent;
    
    expect(italics).not.toBeNull();
    expect(italics?.parentNode).not.toBeNull();

    const parentNode = italics!.parentNode;
    const allSiblings = Array.from(parentNode!.childNodes);

    const startContainerOffset = allSiblings.findIndex(n => n ===italics);
    const endContainerOffset = startContainerOffset + 1;
    const selection = setSelection(parentNode!, startContainerOffset, parentNode!, endContainerOffset);
    expect(selection).not.toBeNull();
    expect(selection!.anchorNode).toBe(selection!.focusNode)
    expect(selection).not.toBeNull();

    const selectionTextContent = selection!.toString();
    expect(selectionTextContent).toBe(italicsTextContent);

    wrapInElement(selection!, anchor, document.body);


    const reestablishedItalics = document.querySelector("i#italics-1");
    expect(anchor!.parentNode).toBe(reestablishedItalics);
    // make sure italics textContent is unchanged
    expect(italics!.textContent).toBe(italicsTextContent);
    expect(anchor.textContent).toBe(italicsTextContent);

  })

  test("wrap text in element", function(){
    const italics = document.querySelector("i#italics-2");
    expect(italics).not.toBeNull();
    const italicsText = italics!.childNodes[0];
    const selection = setSelection(italicsText!, 7, italicsText!, 18);
    expect(selection).not.toBeNull();

    const underlineElement = document.createElement('u');
    wrapInElement(selection!, underlineElement, document.body);

    expect(underlineElement.parentNode).toBe(italics);
    expect(underlineElement.textContent).toEqual(selection!.toString());
    expect(italics!.childNodes.length).toBe(3);
    expect(italics!.childNodes[1]).toBe(underlineElement);

  })


  test("wraps text in element but leaves unbreakable tag outside", function() {
    document.body.innerHTML = alternateHTMLwithUnbreakable;



    const underline = document.querySelector("u");
    const lastItalics = document.querySelector("div > i");
    expect(underline).not.toBeNull();
    expect(lastItalics).not.toBeNull();
    const underlineText = underline!.childNodes[0];
    const lastItalicsText = lastItalics!.childNodes[0];
    expect(underlineText).not.toBeNull();
    expect(lastItalicsText).not.toBeNull();

    const selection = setSelection(underlineText!, 8, lastItalicsText!, 7);
    const selectionText = selection!.toString();
    expect(selectionText).not.toBeNull();
    // expect(selectionText).toBe("")
    expect(selectionText).toBe("e in Fourth Strong Text Fifth Strong Text - UnbreakableItalics");

    const anchorElement = document.createElement('a');
    const div = document.querySelector("div");
    expect(div).not.toBeNull();
    wrapInElement(selection!, anchorElement, div!);

    expect(document.body.innerHTML).toBe(`
      <div>
        <strong>First Strong Text</strong>
        <strong>Second Strong Text</strong>
        <strong>Third Strong Text</strong>
        <strong>
          Fourth Strong Text 
          <i>Italics In Fourth Strong Text </i>
          <u>Underlin</u>
        </strong>
        <a>
          <strong>
            <u>e in Fourth Strong Text </u>
          </strong>
        </a>
        <strong data-unbreakable="">Fifth Strong Text - Unbreakable</strong>
        <a>
          <i>Italics</i>
        </a>
        <i> After Fifth Strong Text</i>
        <strong>Sixth Strong Text</strong>
      </div>`.replaceAll(/\n */g, ''));


  })

  // `<div>
  //   <strong>First Strong Text</strong>
  //   <strong>Second Strong Text</strong>
  //   <strong>Third Strong Text</strong>
  //   <strong>
  //     Fourth Strong Text 
  //     <i>Italics In Fourth Strong Text </i>
  //     <u>Underlin</u>
  //   </strong>
  //   <strong>
  //     <u>e in Fourth Strong Text </u>
  //   </strong>
  //   <strong unbreakable=\"\">Fifth Strong Text - Unbreakable</strong>
  //   <i>Italics</i>
  //   <i> After Fifth Strong Text</i>
  //   <strong>Sixth Strong Text</strong>
  // </div>`

});


describe("test deleteEmptyElementsByQuery", function() {

  test("delete empty elements, leave valid elements 1", function() {
    document.body.innerHTML = "<div><strong></strong><i></i><i><strong></strong></i><strong><i></i></strong><strong><i>Valid Text</i></strong></div>";
    deleteEmptyElementsByQuery("i", document.querySelector("div")!);
    expect(document.body.innerHTML).toBe("<div><strong></strong><i><strong></strong></i><strong></strong><strong><i>Valid Text</i></strong></div>")
  })


  test("delete empty elements, leave valid elements 2", function() {
    document.body.innerHTML = "<div><strong></strong><i></i><i><strong></strong></i><strong><i></i></strong><strong><i>Valid Text</i></strong></div>";
    deleteEmptyElementsByQuery("strong", document.querySelector("div")!);
    expect(document.body.innerHTML).toBe("<div><i></i><i></i><strong><i></i></strong><strong><i>Valid Text</i></strong></div>");
  })

})


describe("test getSelectionChildNodes", function() {
  beforeEach(() => {
    document.body.innerHTML = startingHTML;
  })

  test("Check selection across elements", function() {
    const strong = document.querySelector("strong#strong-1");

    const limitingContainer = document.querySelector("div") 
    const orphanTextNode = limitingContainer?.childNodes[2];

    expect(strong).not.toBeNull();
    expect(orphanTextNode).not.toBeNull();
    const strongText = strong!.childNodes[0];
    expect(strongText).not.toBeNull();

    expect(orphanTextNode!.nodeType).toBe(Node.TEXT_NODE);

    const selection = setSelection(strongText!, 5, orphanTextNode!, 7);

    const result = getSelectionChildNodes(selection!, limitingContainer!);

    expect(result instanceof Array).toBe(true);
    expect(result.length).toBe(4);
    expect(result[0].textContent).toBe("Strong Text")
    expect(result[1].textContent).toBe("Italics Text")
    expect(result[2].textContent).toBe("Italics Text")
    expect(result[3].textContent).toBe("Orphan Text")
  })
})


describe("test unwrapSelectionFromQuery", function() {

  beforeEach(() => {
    document.body.innerHTML = startingHTML;
  })

  test("promotes text out of italics", function() {
    const italics = document.querySelector("i#italics-2");
    const italicsTextContent = italics?.textContent;
    expect(italics).not.toBeNull();
    expect(italics?.parentNode).not.toBeNull();
    const parentNode = italics!.parentNode;

    expect(italics!.childNodes.length).toBe(1);
    const italicsTextNode = italics!.childNodes[0];

    expect(italicsTextContent).toEqual(italicsTextNode!.textContent);

    const selection = setSelection(italicsTextNode!, 0, italicsTextNode!, italicsTextContent!.length);

    expect(selection).not.toBeNull();

    const limitingContainer = document.querySelector("div")

    expect(limitingContainer).not.toBeNull();
    unwrapSelectionFromQuery(selection!, "i", limitingContainer!);

    expect(italics!.textContent!.length).toEqual(0);

    const range = selection!.getRangeAt(0);
    expect(range).not.toBeNull();

    expect(selection!.anchorNode).toBe(selection!.focusNode);
    expect(selection!.anchorNode!.nodeType).toBe(Node.TEXT_NODE);

    expect(document.querySelectorAll("i#italics-2").length).toBe(0);
  })

  test("promote text in italics out of strong", function() {
    const italics = document.querySelector("i#italics-2");
    const italicsTextContent = italics?.textContent;
    expect(italics).not.toBeNull();
    expect(italics?.parentNode).not.toBeNull();
    const parentNode = italics!.parentNode;

    expect(italics!.childNodes.length).toBe(1);
    const italicsTextNode = italics!.childNodes[0];

    expect(italicsTextContent).toEqual(italicsTextNode!.textContent);

    const selection = setSelection(italicsTextNode!, 0, italicsTextNode!, italicsTextContent!.length);

    expect(selection).not.toBeNull();

    const limitingContainer = document.querySelector("div")

    expect(limitingContainer).not.toBeNull();
    unwrapSelectionFromQuery(selection!, "strong", limitingContainer!);

    expect(document.body.innerHTML).toBe(
      `<div>
        <strong id="strong-1">Strong Text</strong>
        <i id="italics-1">Italics Text</i>
        Orphan Text
        <strong id="strong-2">
          Strong Text
        </strong>
        <i id="italics-2">
          Strong and Italics Text
        </i>
        <strong id="strong-2">
          More Strong Text
        </strong>
      </div>`.replaceAll(/\n */g, ''));
  })
});


describe("test unwrapRangeFromQuery", function() {
  beforeEach(() => {
    document.body.innerHTML = startingHTML;
  })

  test("promotes text out of italics", function() {
    const italics = document.querySelector("i#italics-2");
    const italicsTextContent = italics?.textContent;
    expect(italics).not.toBeNull();
    expect(italics?.parentNode).not.toBeNull();
    const parentNode = italics!.parentNode;

    expect(italics!.childNodes.length).toBe(1);
    const italicsTextNode = italics!.childNodes[0];

    expect(italicsTextContent).toEqual(italicsTextNode!.textContent);

    const selection = setSelection(italicsTextNode!, 0, italicsTextNode!, italicsTextContent!.length);

    expect(selection).not.toBeNull();

    const limitingContainer = document.querySelector("div")

    expect(limitingContainer).not.toBeNull();
    const range = selection!.getRangeAt(0);
    expect(range).not.toBeNull();
    unwrapRangeFromQuery(range, "i", limitingContainer!);

    expect(italics!.textContent!.length).toEqual(0);

    // const range = selection!.getRangeAt(0);
    expect(range).not.toBeNull();

    expect(selection!.anchorNode).toBe(selection!.focusNode);
    expect(selection!.anchorNode!.nodeType).toBe(Node.TEXT_NODE);

    expect(document.querySelectorAll("i#italics-2").length).toBe(0);
  })

  test("promote text in italics out of strong", function() {
    const italics = document.querySelector("i#italics-2");
    const italicsTextContent = italics?.textContent;
    expect(italics).not.toBeNull();
    expect(italics?.parentNode).not.toBeNull();
    const parentNode = italics!.parentNode;

    expect(italics!.childNodes.length).toBe(1);
    const italicsTextNode = italics!.childNodes[0];

    expect(italicsTextContent).toEqual(italicsTextNode!.textContent);

    const selection = setSelection(italicsTextNode!, 0, italicsTextNode!, italicsTextContent!.length);

    expect(selection).not.toBeNull();

    const limitingContainer = document.querySelector("div")

    expect(limitingContainer).not.toBeNull();
    const range = selection!.getRangeAt(0);
    expect(range).not.toBeNull();
    unwrapRangeFromQuery(range, "strong", limitingContainer!);

    expect(document.body.innerHTML).toBe(
      `<div>
        <strong id="strong-1">Strong Text</strong>
        <i id="italics-1">Italics Text</i>
        Orphan Text
        <strong id="strong-2">
          Strong Text
        </strong>
        <i id="italics-2">
          Strong and Italics Text
        </i>
        <strong id="strong-2">
          More Strong Text
        </strong>
      </div>`.replaceAll(/\n */g, ''));
  })
})


describe("test unwrapSelectionFromQuery - alternateHTML", function() {
  
  beforeEach(() => {
    document.body.innerHTML = alternateHTML;
  })

  test("unwrapSelectionFromQuery", function() {
    const limitingContainer = document.querySelector("div");
    expect(limitingContainer).not.toBeNull();

    const firstStrong = document.querySelector("strong:nth-of-type(1)");
    const thirdStrong = document.querySelector("strong:nth-of-type(3)");

    expect(firstStrong).not.toBeNull();
    expect(thirdStrong).not.toBeNull();

    const firstStrongText = firstStrong!.childNodes[0];
    const thirdStrongText = thirdStrong!.childNodes[0];

    expect(firstStrongText).not.toBeNull();
    expect(thirdStrongText).not.toBeNull();

    const selection = setSelection(firstStrongText, 5, thirdStrongText, 7);
    expect(selection).not.toBeNull();

    unwrapSelectionFromQuery(selection!, "strong", limitingContainer!);

    expect(document.body.innerHTML).toBe(`
    <div>
      <strong>First</strong> Strong Text
      Second Strong Text
      Third S<strong>trong Text</strong>
      <strong>
        Fourth Strong Text 
        <i>Italics In Fourth Strong Text </i>
        <u>Underline in Fourth Strong Text </u>
      </strong>
      <strong>Fifth Strong Text</strong>
      <i>Italics After Fifth Strong Text</i>
      <strong>Sixth Strong Text</strong>
    </div>`.replaceAll(/\n */g, '')
    )
  })

})


describe("test nodeIsDescendentOf", function() {

  beforeEach(() => {
    document.body.innerHTML = startingHTML;
  })

  test("test ancestors of italics-2", function() {
    const italics = document.querySelector("i#italics-2");
    const limitingContainer = document.querySelector("div");

    expect(italics).not.toBeNull();
    expect(limitingContainer).not.toBeNull();

    expect(nodeIsDescendentOf(italics!, "strong#strong-2", limitingContainer!)).toBe(true);
    expect(nodeIsDescendentOf(italics!, "strong", limitingContainer!)).toBe(true);
    
    expect(nodeIsDescendentOf(italics!, "div", limitingContainer!)).toBe(false);
    expect(nodeIsDescendentOf(italics!, "i#italics-1", limitingContainer!)).toBe(false);
    expect(nodeIsDescendentOf(italics!, "i", limitingContainer!)).toBe(false);
    expect(nodeIsDescendentOf(italics!, "strong#strong-1", limitingContainer!)).toBe(false);
    expect(nodeIsDescendentOf(italics!, "a", limitingContainer!)).toBe(false);

  })
})


describe("test selectionIsDescendentOfNode", function() {

  beforeEach(() => {
    document.body.innerHTML = startingHTML;
  })
  
  test("test selection is descendent of node", function() {
    const div = document.querySelector("div");
    const strong = document.querySelector("strong#strong-1");
    const textNode = strong!.childNodes[0];

    const selection = setSelection(textNode!, 4, textNode!, 8);

    expect(selection).not.toBeNull();

    expect(
      selectionIsDescendentOfNode(selection!, strong!)
    ).toBe(true);

    expect(
      selectionIsDescendentOfNode(selection!, div!)
    ).toBe(true);

    const badStrong = document.querySelector("strong#strong-2");
    const badItalics = document.querySelector("i#italics-1");

    expect(
      selectionIsDescendentOfNode(selection!, badStrong!)
    ).toBe(false);

    expect(
      selectionIsDescendentOfNode(selection!, badItalics!)
    ).toBe(false);
  })


  test("selection is split across nodes", function() {
    const div = document.querySelector("div");
    const strong = document.querySelector("strong#strong-1");
    const strongTextNode = strong!.childNodes[0];
    const italics = document.querySelector("i#italics-1");
    const italicsTextNode = italics!.childNodes[0]

    const selection = setSelection(strongTextNode!, 4, italicsTextNode!, 3);

    expect(selection).not.toBeNull();

    expect(
      selectionIsDescendentOfNode(selection!, strong!)
    ).toBe(false);

    expect(
      selectionIsDescendentOfNode(selection!, italics!)
    ).toBe(false);

    expect(
      selectionIsDescendentOfNode(selection!, div!)
    ).toBe(true);

    const badStrong = document.querySelector("strong#strong-2");
    const badItalics = document.querySelector("i#italics-1");

    expect(
      selectionIsDescendentOfNode(selection!, badStrong!)
    ).toBe(false);

    expect(
      selectionIsDescendentOfNode(selection!, badItalics!)
    ).toBe(false);

  })
})


describe("test selectionIsCoveredBy", function() {

  beforeEach(() => {
    document.body.innerHTML = startingHTML;
  });
  

  test("selection is covered by - 1", function() {
    const limitingContainer = document.querySelector("div");

    const strong = document.querySelector("strong#strong-2");
    const strongText = strong!.childNodes[0];
    const secondStrongText = strong!.childNodes[2];

    expect(strong).not.toBeNull();
    expect(strongText).not.toBeNull();
    expect(secondStrongText).not.toBeNull();

    const selection = setSelection(strongText, 5, secondStrongText, 5);

    expect(selectionIsCoveredBy(selection!, "strong", limitingContainer!)).toBe(true);
    expect(selectionIsCoveredBy(selection!, "strong#strong-2", limitingContainer!)).toBe(true);
    expect(selectionIsCoveredBy(selection!, "i", limitingContainer!)).toBe(false);
  })

  test("selection is covered by - 2", function() {
    const limitingContainer = document.querySelector("div");

    const strong = document.querySelector("strong#strong-1");
    const strongText = strong!.childNodes[0];
    const italics = document.querySelector("i#italics-1");
    const italicsText = italics!.childNodes[0];

    expect(strong).not.toBeNull();
    expect(strongText).not.toBeNull();
    expect(italics).not.toBeNull();
    expect(italicsText).not.toBeNull();

    const selection = setSelection(strongText, 5, italicsText, 5);
    expect(selectionIsCoveredBy(selection!, "strong", limitingContainer!)).toBe(false);
    expect(selectionIsCoveredBy(selection!, "i", limitingContainer!)).toBe(false);
    expect(selectionIsCoveredBy(selection!, "strong#strong-1", limitingContainer!)).toBe(false);
    expect(selectionIsCoveredBy(selection!, "i#italics-1", limitingContainer!)).toBe(false);
  })
  
})

describe("test selectionIsCoveredBy - alternate HTML", function() {

  beforeEach(function() {
    document.body.innerHTML = alternateHTML;
  });

  test("selection in range of siblings of same type", function() {
    const limitingContainer = document.querySelector("div");
    expect(limitingContainer).not.toBeNull();

    const firstStrong = document.querySelector("strong:nth-of-type(1)");
    const thirdStrong = document.querySelector("strong:nth-of-type(3)");

    expect(firstStrong).not.toBeNull();
    expect(thirdStrong).not.toBeNull();

    const firstStrongText = firstStrong!.childNodes[0];
    const thirdStrongText = thirdStrong!.childNodes[0];

    expect(firstStrongText).not.toBeNull();
    expect(thirdStrongText).not.toBeNull();

    const selection = setSelection(firstStrongText, 5, thirdStrongText, 7);
    expect(selection).not.toBeNull();

    expect(selectionIsCoveredBy(selection!, "strong", limitingContainer!)).toBe(true);
    expect(selectionIsCoveredBy(selection!, "italics", limitingContainer!)).toBe(false)

  })

  test("range of siblings contains element children", function() {

    const limitingContainer = document.querySelector("div");
    expect(limitingContainer).not.toBeNull();

    const fourthStrong = document.querySelector("strong:nth-of-type(4)");
    const fifthStrong = document.querySelector("strong:nth-of-type(5)");

    expect(fourthStrong).not.toBeNull();
    expect(fifthStrong).not.toBeNull();

    const fourthStrongText = fourthStrong!.childNodes[0];
    const fifthStrongText = fifthStrong!.childNodes[0];

    expect(fourthStrongText).not.toBeNull();
    expect(fifthStrongText).not.toBeNull();

    const selection = setSelection(fourthStrongText, 7, fifthStrongText, 4)

    expect(selectionIsCoveredBy(selection!, "strong", limitingContainer!)).toBe(true);
    expect(selectionIsCoveredBy(selection!, "italics", limitingContainer!)).toBe(false);


  })

  test("range set within element", function() {
    const limitingContainer = document.querySelector("div");
    expect(limitingContainer).not.toBeNull();

    const firstStrong = document.querySelector("strong:nth-of-type(1)");
    
    expect(firstStrong).not.toBeNull();
    
    const firstStrongText = firstStrong!.childNodes[0];

    expect(firstStrongText).not.toBeNull();

    const selection = setSelection(firstStrongText, 3, firstStrongText, 8);
    expect(selectionIsCoveredBy(selection!, 'strong', limitingContainer!)).toBe(true);
  })

  test("across siblings which are not of same type", function() {
    const limitingContainer = document.querySelector("div");
    expect(limitingContainer).not.toBeNull();

    const fourthStrong = document.querySelector("strong:nth-of-type(4)");
    const sixthStrong = document.querySelector("strong:nth-of-type(6)");
    
    expect(fourthStrong).not.toBeNull();
    expect(sixthStrong).not.toBeNull();

    const fourthStrongText = fourthStrong!.childNodes[0];
    const sixthStrongText = sixthStrong!.childNodes[0];

    expect(fourthStrongText).not.toBeNull();
    expect(sixthStrongText).not.toBeNull();
    expect(sixthStrongText.textContent).toBe("Sixth Strong Text");

    const selection = setSelection(fourthStrongText, 4, sixthStrongText, 10);

    expect(selectionIsCoveredBy(selection!, 'strong', limitingContainer!)).toBe(false);
    expect(selectionIsCoveredBy(selection!, 'i', limitingContainer!)).toBe(false);
  })
})


describe("test generateQuery", function() {

  test("generateQuery on #strong-1", function() {
    document.body.innerHTML = startingHTML;
    const idealQuery = "strong#strong-1"
    const generatedQuery = generateQuery({
      element: "strong",
      id: "strong-1"
    });
    expect(generatedQuery).toEqual(idealQuery);
    
    const strong = document.querySelector(generatedQuery);
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe("Strong Text");
  })

  test("generateQuery on #strong-1 with wrong class name", function() {
    document.body.innerHTML = startingHTML;
    const idealQuery = "strong#strong-1"
    const generatedQuery = generateQuery({
      element: "strong",
      classList: [
        "fake-class",
        "bad-class"
      ],
      id: "strong-1"
    });
    expect(generatedQuery).not.toEqual(idealQuery);
    expect(generatedQuery).toEqual("strong.fake-class.bad-class#strong-1");
    
    const strong = document.querySelector(generatedQuery);
    expect(strong).toBeNull();
  })

  test("generateQuery with attributes and unbreakable", function() {
    const generatedQuery = generateQuery({
      element: "strong",
      classList: [
        "fake-class",
        "bad-class"
      ],
      id: "strong-1",
      unbreakable: true,
      attributes: {
        "test-attribute": "17",
        "test-attribute-two": "test-attribute-two-value"
      }
    });

    expect(generatedQuery).toBe(`strong.fake-class.bad-class#strong-1[data-unbreakable][test-attribute="17"][test-attribute-two="test-attribute-two-value"]`)
  })


})


describe("test createWrapper", function() {

  test("create empty strong element", function() {
    const wrapper = createWrapper({
      element: "strong",
      id: "strong-1"
    }, document);

    expect(wrapper.classList.length).toBe(0);
    expect(wrapper instanceof HTMLElement).toBe(true);
    expect(wrapper.childNodes.length).toBe(0);
    expect(wrapper.nodeName).toBe("STRONG");
    expect(wrapper.id).toBe("strong-1");
  })

  test("create strong element with classes", function() {
    const wrapper = createWrapper({
      element: "strong",
      classList: [
        "strong-wrapper",
        "wrapper-strong"
      ]
    }, document);

    expect(wrapper instanceof HTMLElement).toBe(true);
    expect(wrapper.childNodes.length).toBe(0);
    expect(wrapper.nodeName).toBe("STRONG");
    expect(wrapper.classList.length).toBe(2);
    expect(wrapper.classList.contains("strong-wrapper")).toBe(true);
    expect(wrapper.classList.contains("wrapper-strong")).toBe(true);
  })

  test("create strong element with unbreakable attribute", function() {
    const wrapper = createWrapper({
      element: "strong",
      unbreakable: true
    }, document);

    expect(wrapper instanceof HTMLElement).toBe(true);
    expect(wrapper.childNodes.length).toBe(0);
    expect(wrapper.nodeName).toBe("STRONG");
    expect(wrapper.getAttribute('fake-attribute')).toBeNull();
    // expect(wrapper.getAttribute('unbreakable')).not.toBeNull();
    expect(wrapper.getAttribute('data-unbreakable')).toBe('');
  })

  test("create strong element with unbreakable and other attributes", function() {
    const wrapper = createWrapper({
      element: "strong",
      unbreakable: true,
      attributes: {
        "test-one": "true",
        "test-two": undefined,
        "test-three": "testvalue"
      }

    }, document);

    expect(wrapper instanceof HTMLElement).toBe(true);
    expect(wrapper.childNodes.length).toBe(0);
    expect(wrapper.nodeName).toBe("STRONG");
    expect(wrapper.getAttribute('fake-attribute')).toBeNull();
    // expect(wrapper.getAttribute('unbreakable')).not.toBeNull();
    expect(wrapper.getAttribute('data-unbreakable')).toBe('');
    expect(wrapper.getAttribute('test-one')).toBe('true');
    expect(wrapper.getAttribute('test-two')).toBe('');
    expect(wrapper.getAttribute('test-three')).toBe('testvalue');
  })

  test("ensure that unbreakable named argument overrides unbreakable in attributes argument", function() {
    const wrapper = createWrapper({
      element: "strong",
      unbreakable: true,
      attributes: {
        "data-unbreakable": "test-value-to-be-overidden"
      }
    }, document);

    expect(wrapper instanceof HTMLElement).toBe(true);
    expect(wrapper.childNodes.length).toBe(0);
    expect(wrapper.nodeName).toBe("STRONG");
    expect(wrapper.getAttribute('fake-attribute')).toBeNull();
    // expect(wrapper.getAttribute('unbreakable')).not.toBeNull();
    expect(wrapper.getAttribute('data-unbreakable')).toBe('');
  })

})