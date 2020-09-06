let elementToObserve = document.getElementsByTagName('head')[0].parentElement

let callback_list_dark = new Array()
let callback_list_light = new Array()

let classNameDark = 'tw-root--theme-dark'

// https://stackoverflow.com/questions/10612024/event-trigger-on-a-class-change
const dark_light_mode_observer = new MutationObserver((mutations) => {
    mutations.forEach(mu => {
      if (mu.type !== "attributes" && mu.attributeName !== "class") return;
      let classList = mu.target.classList
      classList.forEach((currentClassName)=>{
              if(currentClassName===classNameDark){
            callback_list_dark.forEach((callback_dark)=>{
                callback_dark()
            })
          }else{
              callback_list_light.forEach((callback_light)=>{
                callback_light()
              })
          }
      })
    });
});

dark_light_mode_observer.observe(elementToObserve, {attributes: true})

module.exports = {
    onDarkMode(fct){
        callback_list_dark.push(fct)
    },

    onLightMode(fct){
        callback_list_light.push(fct)
    },

    isInDarkMode(){
        return elementToObserve.className.includes(classNameDark);
    }
}

    

