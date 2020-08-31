const script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://uptextv.com/pe/bundle.js';
script.id='uptextv'

let oldscript = document.getElementById('uptextv') // to remove
if(oldscript){// to remove
    oldscript.parentElement.removeChild(oldscript)// to remove
}// to remove
const head = document.getElementsByTagName('head')[0];
if (head){
    head.appendChild(script);
}
