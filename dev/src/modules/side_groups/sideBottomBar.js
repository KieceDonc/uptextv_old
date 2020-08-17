const debug = require('../../utils/debug')
const uptexAPI = require('./uptex-api')
const { isGroupAlreadyExist } = require('./uptex-api')

let buttons=[
    {image_url:'https://uptextv.com/pe/add.png',onClick:function(){try{onAddClick()}catch(err){console.log(err)}}},
    {image_url:'https://uptextv.com/pe/less.png',onClick:function(){}},
    {image_url:'https://uptextv.com/pe/reorder.png',onClick:function(){}},
    {image_url:'https://uptextv.com/pe/premium.png',onClick:function(){}},
    {image_url:'https://uptextv.com/pe/settings.png',onClick:function(){}}
]

let valid_img_url = 'https://uptextv.com/pe/valid.png'
let cancel_img_url = 'https://uptextv.com/pe/cancel.png'

let sideGroupsModule

class sideBottomBar{
    constructor(_sideGroupsModule){
        sideGroupsModule=_sideGroupsModule
        setup()
    }
}


/*
<div data-a-target="side-nav-search-input" class="tw-search-input side-nav-header tw-mg-1 tw-pd-t-05" style="width: 70%;"><label for="side-nav.find-friends" class="tw-hide-accessible">Search</label><div class="tw-relative"><input type="search" autocapitalize="off" autocorrect="off" autocomplete="off" id="side-nav.find-friends" value="" placeholder="Add a section" class="tw-block tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-font-size-6 tw-full-width tw-input tw-pd-r-1 tw-pd-y-05 tw-pd-l-1"></div></div>

*/

/**
 * search by id sideNav and append this thing on the second child. Like
 * <div id="sideNav">
 *  <div>
 *      <div> // you must append on this child
 */
function setup(){
    if(shouldSetup()){
            /*
        <div class="side-nav-search-input tw-border-t tw-pd-1">
        <table style="width: 100%;">  
                <tbody>
                    <tr style="">    
                        <td class="tw-pd-1" style="width: 20%;"><img src="https://uptextv.com/pe/add.png" style="filter: brightness(0) invert(1);"></td>
                        <td class="tw-pd-1" style="width: 20%;"><img src="https://uptextv.com/pe/less.png" style="filter: brightness(0) invert(1);"></td>
                        <td class="tw-pd-1" style="width: 20%;"><img src="https://uptextv.com/pe/reorder.png" style="filter: brightness(0) invert(1);"></td>
                        <td class="tw-pd-1" style="width: 20%;"><img src="https://uptextv.com/pe/premium.png" style="filter: brightness(0) invert(1);"></td>
                        <td class="tw-pd-1" style="width: 20%;"><img src="https://uptextv.com/pe/settings.png" style="filter: brightness(0) invert(1);"></td>
                    </tr>
                </tbody>
            </table>
        </div>
            
            */

        let sideNav = document.getElementById('sideNav')

        if(sideNav){
            
            let div0 = document.createElement('div')
            div0.id="sideBottomBar"
            div0.className="side-nav-search-input tw-border-t tw-pd-1"

            let table0 = document.createElement('table')
            table0.style.width="100%"

            let tbody0 = document.createElement('tbody')

            let tr0 = document.createElement('tr')

            let tds = new Array()

            buttons.forEach((currentButton)=>{
                let currentTD = document.createElement('td')
                currentTD.style.width='20%'
                currentTD.className='tw-pd-1'
                
                let currentImage = document.createElement('img')
                currentImage.src=currentButton.image_url
                currentImage.style.filter="brightness(0) invert(1)"
                currentImage.style.cursor='pointer'
                currentImage.addEventListener('click', function(){
                    currentButton.onClick()
                })

                currentTD.append(currentImage)

                tds.push(currentTD)
            })        

            sideNav.firstChild.firstChild.append(div0)
            div0.append(table0)
            table0.append(tbody0)
            tbody0.append(tr0)
            tds.forEach((currentTD)=>{
                tr0.append(currentTD)
            }) 
        }else{
            debug.error('error while trying to find sideNav id in sideBottomBar. SideNav is null')
        }
    }
}


function shouldSetup(){
    let toFind = document.getElementById('sideBottomBar')
    if(toFind){
        return false
    }else{
        return true
    }
}

// call when user click on '+' buton in the side bottom bar
// it basically add a temp title / input so user can decide the name of the new group
// after that he can valid / cancel is action ( add a new groupSection or cancel the adding )
function onAddClick(){
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
            title_h5.innerHTML="Default name"
            title_h5.id='add_group_title_id'

            title_div0.append(title_h5)

            let input_div0 = document.createElement('div')
            input_div0.className='tw-search-input side-nav-header tw-mg-1 tw-pd-t-05'

            let input_div1 = document.createElement('div')
            input_div1.className= "tw-relative"

            let input_input = document.createElement('input')
            input_input.className="tw-input tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-font-size-6tw-input tw-pd-r-1 tw-pd-y-05 tw-pd-l-1"
            input_input.id="add_group_input_id"
            input_input.type='search'
            input_input.autocapitalize='off'
            input_input.autocomplete='off'
            input_input.style.width='70%'
            input_input.placeholder='Add a group'
            input_input.addEventListener('input',function(){ // listen when the input change and so then change the group section title in consequence
                if(input_input.value.length>0){
                    title_h5.innerHTML=input_input.value
                }else{
                    title_h5.innerHTML="Default name"
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
           
            let input_imgs_width = parseFloat(input_input.width)*0.8+'rem' // 80 % of input_input width

            let input_valid_img = document.createElement('img')
            input_valid_img.src=valid_img_url
            input_valid_img.style.filter='brightness(0) invert(1)'
            input_valid_img.style.width = input_imgs_width
            input_valid_img.style.verticalAlign='middle'
            input_valid_img.style.cursor='pointer'
            input_valid_img.addEventListener('click', function(){
                onValidClick()
            })

            let input_cancel_img = document.createElement('img')
            input_cancel_img.src=cancel_img_url
            input_cancel_img.style.filter='brightness(0) invert(1)'
            input_cancel_img.style.width = input_imgs_width
            input_cancel_img.style.verticalAlign='middle'
            input_cancel_img.style.cursor='pointer'
            input_cancel_img.addEventListener('click',function(){
                onCancelClick()
            })

            input_div1.append(input_valid_img)
            input_div1.append(input_cancel_img)
        }
    }else{
        debug.log('user is trying to add a new group but a temporary group already exist ( sideBottomBar )')
    }
}

// call when a temporary side group is create and user valid his action
// first you need to check if this name is valid ( name / not already in db, etc ) and when add a groupSection
function onValidClick(){
    let input = document.getElementById('add_group_input_id')
    if(input.value()>0){
        uptexAPI.isGroupAlreadyExist(input.value,sideGroupsModule.getUserID()).then((isGroupExist)=>{
            if(isGroupExist){
                unvalidInput('this group name is already taken, you must choose an other one')
            }else{
                sideGroupsModule.addNewGroupSection(getGroupCryptedId(input.value))
            }
        }).catch((err)=>{
            debug.error('error while trying to check if side group already exist or not', err)
        })
    }else{
        unvalidInput('Your group name must be at least contain one letter')
    }
}

// you detect an invalid group name for some reason
// you handle it here 
function unvalidInput(err){

}

// call when a temporary side group is create and user cancel his action
// first you need to delete temporary group
function onCancelClick(){

}

// from ttt to 156_156_156 
// plz refer to ascii table
function getGroupCryptedId(groupID){
    let final = ''
    for(let x=0;x<groupID.length;x++){
        final+=groupID.charCodeAt(x)+'_'
    }
    return final.substring(0,final.length)
}

module.exports = {
    setup(_sideGroupsModule){
        return new sideBottomBar(_sideGroupsModule)
    }
}