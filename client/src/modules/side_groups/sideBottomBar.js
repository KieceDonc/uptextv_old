const debug = require('../../utils/debug')
const uptextvAPI = require('../../utils/uptextv-api')
const uptextvIMG = require('../../utils/uptextv-image').get()
const darkmode = require('../../watchers/darkmode.js')

let sideGroupsModule

class sideBottomBar{

    //buttons=[new AddButton,new DeleteButton,new ReorderButton,new PremiumButton,new SettingsButton]

    constructor(_sideGroupsModule){
        sideGroupsModule=_sideGroupsModule
        this.addButton=new AddButton
        this.setup()
    }

    shouldSetup(){
        let toFind = document.getElementById('sideBottomBar')
        if(toFind){
            return false
        }else{
            return true
        }
    }

    /**
     * search by id sideNav and append this thing on the second child. Like
     * <div id="sideNav">
     *  <div>
     *      <div> // you must append on this child
     */
    setup(){
        if(this.shouldSetup()){
            let sideNav = document.getElementsByClassName('side-nav-content')[0]

            if(sideNav==null){
                sideNav = document.getElementById('sideNav').firstChild
            }

            if(sideNav){
                
                let sideBottomBar = document.createElement('div')
                sideBottomBar.id="sideBottomBar"
                sideBottomBar.className="side-nav-search-input tw-border-t tw-pd-1"
                sideBottomBar.style.maxHeight = document.getElementsByClassName('side-nav-search-input')[0].offsetHeight // search input offsetHeight


                sideNav.firstChild.appendChild(sideBottomBar)
                this.addButton.setup(sideBottomBar)
            }else{
                debug.error('error while trying to find sideNav id in sideBottomBar. SideNav is null')
            }
        }
    }
}

/**
 * handle all process of the add button
 */
class AddButton{

    // call on setup of sideBottomBar 
    // use to create in html / css the button to add group
    setup(sideBottomBarDiv){
        let div1 = document.createElement('div')
        div1.className='tw-search-input'

        let div2 = document.createElement('div')
        div2.className='tw-relative'

        let button0 = document.createElement('button')
        button0.className='tw-block tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-font-size-6 tw-full-width tw-input tw-pd-l-1 tw-pd-r-1 tw-pd-y-05'
        button0.addEventListener('click',()=>{
            this.moveSideNavToTop() 
            this.onClick()
        })

        let p0 = document.createElement('p')
        p0.style.textAlign='center'
        p0.innerText='Add a new group'

        sideBottomBarDiv.appendChild(div1)
        div1.appendChild(div2)
        div2.appendChild(button0)
        button0.appendChild(p0)
    }

    // call when user click on '+' buton in the side bottom bar
    // it basically add a temp title / input so user can decide the name of the new group
    // after that he can valid / cancel is action ( add a new groupSection or cancel the adding )
    onClick(){
        let checkIfAddGroupIdTemporaryExist = document.getElementById('add_group_title_id')
        if(!checkIfAddGroupIdTemporaryExist){

            let parent = document.getElementsByClassName('side-nav-section')[0].parentElement
            let mainDiv = document.createElement('div')
            mainDiv.className='side-nav-section'

            if(parent){
                parent.prepend(mainDiv)

                // new group title in html
                // new group title id = add_group_id_temporary

                /*
                <div class="side-nav-header tw-mg-1 tw-pd-t-05">
                    <h5 class="tw-font-size-6 tw-semibold tw-upcase">Default name
                    </h5>
                </div>
                */

                // input in html 

                /*
                <div class="tw-search-input side-nav-header tw-mg-1 tw-pd-t-05" style="width: 70%;">
                    <div class="tw-relative">
                        <input type="search" autocapitalize="off" autocorrect="off" autocomplete="off" class="tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-font-size-6 tw-input tw-pd-r-1 tw-pd-y-05 tw-pd-l-1" placeholder="Add a group">
                    </div>
                </div>
                */

                // we create title
                let title_div0 = document.createElement('div')
                title_div0.className='side-nav-header tw-mg-1 tw-pd-t-05'

                let title_h5 = document.createElement('h5')
                title_h5.className="tw-font-size-6 tw-semibold tw-upcase"
                title_h5.innerText="Default name"
                title_h5.id='add_group_title_id'

                title_div0.append(title_h5)

                let input_div0 = document.createElement('div')
                input_div0.className='tw-search-input side-nav-header tw-mg-1 tw-pd-t-05'

                let input_div1 = document.createElement('div')
                input_div1.className= "tw-relative"

                let input_input = document.createElement('input')
                input_input.className="tw-input tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-font-size-6tw-input tw-pd-r-1 tw-pd-y-05 tw-pd-l-1"
                input_input.type='search'
                input_input.autocapitalize='off'
                input_input.autocomplete='off'
                input_input.style.width='70%'
                input_input.placeholder='Add a group'
                input_input.addEventListener('input',function(){ // listen when the input change and so then change the group section title in consequence
                    if(input_input.value.length>0){
                        title_h5.innerText=input_input.value
                    }else{
                        title_h5.innerText="Default name"
                    }
                })


                mainDiv.prepend(input_div0) // YOU FIRST PREEND INPITDIV0 AND THEM TITLEDIV0
                mainDiv.prepend(title_div0)
                input_div0.append(input_div1)
                input_div1.append(input_input)

                mainDiv.append(title_div0)
                mainDiv.append(input_div0)

                // you need to add element above first so you can get input_input.weight and so get your image weight ( 85 % of inpu_input.weight )
                /*
                <div class="tw-search-input side-nav-header tw-mg-1 tw-pd-t-05" style="width: 70%;">
                    <div class="tw-relative" style="display: inline-block;">
                        <input type="search" autocapitalize="off" autocorrect="off" autocomplete="off" placeholder="Add a group" class="tw-block tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-font-size-6 tw-input tw-pd-r-1 tw-pd-y-05 tw-pd-l-1" style="width: 85%;">




                    <img src="https://uptextv.com/pe/valid.png" style="width: 12%; filter: brightness(0) invert(1);vertical-align: middle;" class="">
                    <img src="https://uptextv.com/pe/cancel.png" style="width: 1rem;filter: brightness(0) invert(1);"></div>
                    </div>
                */
            
                let input_imgs_height = parseFloat(input_input.offsetHeight)*0.8+'px' // 80 % of input_input width

                let input_valid_img = document.createElement('img')
                input_valid_img.src=uptextvIMG.valid
                if(darkmode.isInDarkMode()){
                    input_valid_img.style.filter='brightness(0) invert(1)'
                }
                input_valid_img.style.width = input_imgs_height
                input_valid_img.style.verticalAlign='middle'
                input_valid_img.style.cursor='pointer'
                input_valid_img.style.marginLeft='0.5rem'
                input_valid_img.style.marginRight='0.5rem'
                input_valid_img.addEventListener('click', ()=>{
                    this.onInputValidClick(input_input,mainDiv)
                })
    
                let input_cancel_img = document.createElement('img')
                input_cancel_img.src=uptextvIMG.cancel
                if(darkmode.isInDarkMode()){
                    input_cancel_img.style.filter='brightness(0) invert(1)'
                }
                input_cancel_img.style.width = input_imgs_height
                input_cancel_img.style.verticalAlign='middle'
                input_cancel_img.style.cursor='pointer'
                input_cancel_img.addEventListener('click',()=>{
                    this.onInputCancelClick(mainDiv)
                })

                input_div1.append(input_valid_img)
                input_div1.append(input_cancel_img)

                darkmode.onDarkMode(()=>{
                    input_valid_img.style.filter='brightness(0) invert(1)'
                    input_cancel_img.style.filter='brightness(0) invert(1)'
                })

                darkmode.onLightMode(()=>{
                    input_valid_img.style.filter=''
                    input_cancel_img.style.filter=''
                })
            }
        }else{
            debug.log('user is trying to add a new group but a temporary group already exist ( sideBottomBar )')
        }
    }

    /* Then user click on 'add group' the input will be on the top of the side nav
     * You have a problem, sideNav is a custom scrollable div and user could have scroll so he won't see the input
     * You solve the problem by moving scroll to 0,0
     */
    moveSideNavToTop(){
        let scrollableDivElement = document.getElementsByClassName('simplebar-scroll-content')[0]
        scrollableDivElement.scroll({top:0,left:0,behavior:"smooth"}) 
    }

    // call when a temporary side group is create and user valid his action
    // first you need to check if this name is valid ( name / not already in db, etc ) and when add a groupSection
    onInputValidClick(input,inputMainDiv){
        if(input.value.length>0){
            let groupCryptedID = getGroupCryptedID(input.value)
            uptextvAPI.isGroupAlreadyExist(groupCryptedID,sideGroupsModule.getUserID()).then((isGroupExist)=>{
                if(isGroupExist){
                    this.onInvalidInput('This group name is already taken, you must choose an other one',inputMainDiv)
                }else{
                    sideGroupsModule.addNewGroupSection(groupCryptedID)
                    inputMainDiv.remove()
                }
            }).catch((err)=>{
                debug.error('error while trying to check if side group already exist or not', err)
            })
        }else{
            this.onInvalidInput('Your group name must be at least contain one letter',inputMainDiv)
        }
    }

    // call when a temporary side group is create and user cancel his action
    // first you need to delete temporary group
    onInputCancelClick(inputMainDiv){
        inputMainDiv.remove()
    }

    // you detect an invalid group name for some reason
    // you handle it here 
    onInvalidInput(err,inputMainDiv){
        let p0 = document.getElementById('add_group_err')
        if(p0){ // checking is p already exist
            p0.innerText = err
        }else{
            p0 = document.createElement('p')
            p0.className='tw-c-text-alt-2 tw-font-size-6 tw-line-height-heading'
            p0.id = 'add_group_err'
            p0.innerText = err
            p0.style.marginTop='0.5rem'
            inputMainDiv.children[1].append(p0)
        }
    }
}

// from ttt to 156_156_156 
// plz refer to ascii table
function getGroupCryptedID(groupID){
    let final = ''
    for(let x=0;x<groupID.length;x++){
        final+=groupID.charCodeAt(x)+'_'
    }
    return final.substring(0,final.length-1)
}

module.exports = {
    setup(_sideGroupsModule){
        return new sideBottomBar(_sideGroupsModule)
    }
}