// ==UserScript==
// @name        Youtube Pop-Out Window
// @namespace   http://www.youtube.com
// @include     https://www.youtube.com/watch*
// @version     1
// @grant       none
// ==/UserScript==

const EMBED_URL = 'https://www.youtube.com/embed';
const winOptions = 'resizable=1,scrollbars=0,toolbar=0,location=0';
const ytOptions = 'loop=1&autoplay=1';

main();
window.popout = openPopOut; // expose just in case

function main() {
    addButton('Pop Out', openPopOut);
}

function openPopOut() {
    let query = getQuery();
    let embedUrl = createEmbedUrl(query);

    let player = document.getElementById('movie_player');
    let videoElement = player.getElementsByTagName('video')[0];
    let videoWidth = videoElement.style.width.replace('px', '');
    let videoHeight = videoElement.style.height.replace('px', '');

    player.pauseVideo();
    window.open(embedUrl,
                `youtube-pop-out-${query.v}`,
                `width=${videoWidth},height=${videoHeight},${winOptions}`);
}

function createEmbedUrl(query) {
    var currTime = 'start=' + Math.floor(document.getElementById('movie_player').getCurrentTime());
    if ('list' in query) { // playlist
        return `${EMBED_URL}?listType=playlist&list=${query.list}&index=${parseInt(query.index) - 1}&${ytOptions}&${currTime}`;
    } else { // just a video
        var url = `${EMBED_URL}/${query.v}?${ytOptions}&${currTime}`;
        // workaround to make sure single videos loop
        url = url + `&playlist=${query.v}`;
        return url;
    }
}

function getQuery() {
    let queryString = location.search.slice(1).split('&');
    let query = {};
    for (let i = 0; i < queryString.length; i++) {
        let kv = queryString[i].split('=');
        query[kv[0]] = kv[1];
    }
    return query;
}

function addButton(labelText, onClickHandler) {
    console.log('Adding Button');
    if (document.getElementById('yt-masthead-signin')) {
        console.log('Old Version');
        addButtonOld(labelText, onClickHandler);
    } else {
        console.log('New Version');
        addButtonNew(labelText, onClickHandler);
    }
}

function addButtonOld(labelText, onClickHandler) {
    let container = document.getElementById('yt-masthead-signin');

    let button = document.createElement('button');
    button.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-opacity';
    button.addEventListener('click', onClickHandler);

    let label = document.createElement('span');
    label.className = 'yt-uix-button-content';
    label.textContent = labelText;

    button.appendChild(label);
    container.insertBefore(button, document.getElementById('upload-btn'));
}

function addButtonNew(labelText, onClickHandler) {
    // create the button (a manual clone of the existing sign in button)
    let ytdButtonRenderer = document.createElement('ytd-button-renderer');
    ytdButtonRenderer.className = 'style-scope ytd-masthead style-brand';

    let a = document.createElement('a');
    a.addEventListener('click', onClickHandler);
    ytdButtonRenderer.appendChild(a);

    let paperButton = document.createElement('paper-button');
    paperButton.className = 'style-scope ytd-button-renderer style-brand';
    a.appendChild(paperButton);

    let ytFormattedString = document.createElement('yt-formatted-string');
    ytFormattedString.className = 'style-scope ytd-button-renderer style-default';
    ytFormattedString.textContent = labelText;
    paperButton.appendChild(ytFormattedString);

    // add to the page
    let container = document.getElementById('buttons');
    container.insertBefore(ytdButtonRenderer, container.children[0]);
}
