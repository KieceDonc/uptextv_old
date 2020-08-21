const uptexAPI = require('./uptex-api')
const debug = require('../../utils/debug')
const pin_icon_mouse_over_url = "https://uptextv.com/pe/pin-icon.svg"

var sideGroupsModule

class pinButton{
    constructor(_sideGroupsModule){
        sideGroupsModule = _sideGroupsModule
        if(shouldSetup()){
            setup()
        }
    }
}

// check if pin button exist
function shouldSetup(){
    let button = document.getElementById('pin-button')
    return button==null
}

// this code add the pin button
// twitch standard to look like button follow / notification : 
// button use to add streamer id = 'pin-button'
function setup(){
    let buttonID = "pin-button"
    let parentdiv = document.getElementsByClassName("tw-align-items-center tw-flex tw-full-height tw-overflow-hidden")[0]
  
    if(parentdiv!=null){
  
      let div0 = document.createElement("div")
      div0.className= "follow-btn__notification-toggle-container follow-btn__notification-toggle-container--visible tw-mg-l-1"
  
      let div1 = document.createElement("div")
  
      let div2 = document.createElement("div") // ADD MOUSE OVER / LEFT
      div2.addEventListener("mouseover",function(){
        changePinButtonBackgroundColorToBlue()
      })
      div2.addEventListener("mouseleave",function(){
        if(!isMenuToPinSetup()){
            changePinButtonBackgroundColorToNormal()
        }
      })
  
      let div3 = document.createElement("div")
      div3.className="tw-border-radius-medium tw-c-background-base tw-inline-flex tw-overflow-hidden"
  
      let button0 = document.createElement("button") // HANDLE PIN / UNPIN / ADD TO SIDE SECTION / DELETE FROM SIDE SECTION
      button0.id=buttonID
      button0.className="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--secondary tw-full-width tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative"
      button0.addEventListener('click', function(){
        buttonTreatment()
      })
  
      let div4 = document.createElement("div")
      div4.className="tw-align-items-center tw-core-button-label tw-flex tw-flex-grow-0"
    
      let div5 = document.createElement("div")
      div5.className="tw-flex-grow-0"
  
      let div6 = document.createElement("div")
      div6.className="tw-align-items-center tw-flex tw-justify-content-center"
  
      let div7 = document.createElement("div")
      div7.className="tw-align-items-center tw-flex tw-justify-content-center tw-mg-r-0"
      div7.style="transform: translateX(0px) scale(1); transition: transform 300ms ease 0s;"
  
      let div8 = document.createElement("div")
      div8.className="tw-animation tw-animation--bounce-in tw-animation--duration-long tw-animation--fill-mode-both tw-animation--timing-ease"
  
      let div9 = document.createElement("div")
      div9.className="tw-align-items-center tw-flex tw-justify-content-center"
  
      let figure0 = document.createElement("figure")
      figure0.className="tw-svg"
  
      let img0 = document.createElement("img")
      img0.className="tw-svg__asset tw-svg__asset--inherit tw-svg__asset--notificationbell"
      img0.src= pin_icon_mouse_over_url//browser.runtime.getURL("../src/assets/icon/icon-pin-mouse-over.svg");
  
      let span0 = document.createElement("span")
      span0.style="opacity: 1; transform: translateX(0px); transition: all 300ms ease 300ms;"
  
      parentdiv.appendChild(div0)
      div0.appendChild(div1)
      div1.appendChild(div2)
      div2.appendChild(div3)
      div3.appendChild(button0)
      button0.append(div4)
      div4.appendChild(div5)
      div5.appendChild(div6)
      div6.appendChild(div7)
      div7.appendChild(div8)
      div8.appendChild(div9)
      div9.appendChild(figure0)
      figure0.appendChild(img0)
      div8.appendChild(span0)
    }
}

// title of function prelly clear
function changePinButtonBackgroundColorToBlue(){
    document.getElementById('pin-button').style.backgroundColor='#007aa3'
}

// title of function prelly clear
function changePinButtonBackgroundColorToNormal(){
    let style = getComputedStyle(document.body);
    document.getElementById('pin-button').style.backgroundColor=style.getPropertyValue("--color-background-base")
}

// call when user click on pin button 
function buttonTreatment(){
    if(isMenuToPinSetup()){
        deleteMenuToPin()
        changePinButtonBackgroundColorToNormal()
    }else{
        addMenuToPin()
        changePinButtonBackgroundColorToBlue()
    }
}

function isMenuToPinSetup(){
    return document.getElementById('menu-to-pin')!=null
}

function addMenuToPin(){
    let coords = document.getElementById('pin-button').getBoundingClientRect()

    // it's seems like their is a security
    // you need to have an empty div and modify it later

    /*
    <div class="tooltip-layer" style="transform: translate(1265px, 386px); width: 40px; height: 30px;">
        <div aria-describedby="78bed2e1b312703011f9d904af2a1698" class="tw-inline-flex tw-relative tw-tooltip-wrapper tw-tooltip-wrapper--show">
            <div style="width: 40px; height: 30px;">
            </div>
            <div class="tw-tooltip tw-tooltip--align-center tw-tooltip--up" data-a-target="tw-tooltip-label" role="tooltip" id="78bed2e1b312703011f9d904af2a1698">
                to replace
            </div>
        </div>
    </div>

    temp0.getBoundingClientRect()

DOMRect { x: 1315.2166748046875, y: 386, width: 40, height: 30, top: 386, right: 1355.2166748046875, bottom: 416, left: 1315.2166748046875 }
    */

    let div0 = document.createElement('div')
    let root = document.getElementById('root')
    root.children[0].append(div0)

    div0.className="tooltip-layer"
    div0.id="menu-to-pin"

    let div0_translate_x = Math.round(coords.x)
    let div0_translate_y = Math.round(coords.y)
    let div0_width = Math.round(coords.width)
    let div0_height = Math.round(coords.height)
    div0_translate_x+=div0_width/2
    div0_translate_y-=div0_height/2
    div0.style.transform="translate("+div0_translate_x+"px, "+div0_translate_y+"px)"
    div0.style.width = div0_width
    div0.style.height = div0_height

    let div1 = document.createElement('div')
    div1.className="tw-inline-flex tw-relative tw-tooltip-wrapper tw-tooltip-wrapper--show"

    let div2 = document.createElement('div')
    div2.style.width = div0_width
    div2.style.height = div0_height

    let div3 = document.createElement('div')
    div3.className="tw-tooltip tw-tooltip--align-center tw-tooltip--up"

    div0.append(div1)
    div1.append(div2)
    div1.append(div3)
    sideGroupsModule.getGroupsSection().forEach((currentGroupSection)=>{
        let currentGroupID = currentGroupSection.getCurrentGroupID()
        let currentGroupID_normal = currentGroupSection.getCurrentGroupID_normal()

        /*
        <div>
            <input type="checkbox" style="vertical-align:middle;"/>
            <label>pinned streamers</label>
        </div>
        */

        let div_current_group = document.createElement('div')
        div_current_group.id = currentGroupID
        div_current_group.style.margin='0.25rem'

        let input_current_group = document.createElement('input') // checkbox of the current group ( permit to add / delete streamer from current group )
        input_current_group.type='checkbox'
        input_current_group.style.verticalAlign='middle'
        input_current_group.style.pointerEvents='all'
        let currentStreamerIndexInCurrentGroupSection = currentGroupSection.getStreamerIndex(sideGroupsModule.getStreamerID()) 
        // return -1 if streamer isn't in list in current group section
        if(currentStreamerIndexInCurrentGroupSection!=-1){ 
            input_current_group.checked="checked"
        }
        input_current_group.addEventListener('change', (event) => { // detect if checked to unchecked or unchecked to checked
            if (event.target.checked) { // need to add streamer
                currentGroupSection.addStreamer(sideGroupsModule.getStreamerID())
            } else { // need to delete streamer
                currentGroupSection.deleteStreamer(sideGroupsModule.getStreamerID())
            }
        })

        let label_current_group = document.createElement('label')
        label_current_group.innerHTML = currentGroupID_normal
        label_current_group.style.marginLeft='0.125rem'

        div_current_group.append(input_current_group)
        div_current_group.append(label_current_group)
        div3.append(div_current_group)
    })
}

function deleteMenuToPin(){
    document.getElementById('menu-to-pin').remove()
}

module.exports = {
    setup:function(_sideGroupsModule){
        return new pinButton(_sideGroupsModule)
    }
}