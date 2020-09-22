let elementToObserve = document.getElementById('sideNav').children[0]

let callback_list_collaspe = new Array()
let callback_list_expend = new Array()

let classToWatch = 'side-nav--collapsed'

//class="collapse-toggle tw-flex tw-justify-content-center tw-mg-y-05 tw-pd-y-05" 

// https://stackoverflow.com/questions/10612024/event-trigger-on-a-class-change
const collaspe_observer = new MutationObserver((mutations) => {
    mutations.forEach(mu => {
      if (mu.type !== "attributes" && mu.attributeName !== "class") return;
      let classList = mu.target.classList
      let founded = false
      let cmpt = 0
      do{
        let currentClassName = classList[cmpt]
        if(currentClassName===classToWatch){
            founded=true
        }
        cmpt++
      }while(!founded&&cmpt<classList.length)
      if(founded){
        callback_list_collaspe.forEach((callback_collaspe)=>{
            callback_collaspe()
        })
      }else{
        callback_list_expend.forEach((callback_expend)=>{
            callback_expend()
          })
      }
    });
});

collaspe_observer.observe(elementToObserve, {attributes: true})

module.exports = {
    onCollaspe(fct){
        callback_list_collaspe.push(fct)
    },

    onExpend(fct){
        callback_list_expend.push(fct)
    }
}

    

