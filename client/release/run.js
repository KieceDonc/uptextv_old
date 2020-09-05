(function uptextv() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chrome.extension.getURL('uptextv.js');
    var head = document.getElementsByTagName('head')[0];
    if (!head) return;
    head.appendChild(script);
})()
