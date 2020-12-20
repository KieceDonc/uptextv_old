const watcher = require('../watcher')

var button = null
var isFollowing = false
var callback_onFollow = new Array()
var callback_onUnfollow = new Array()
var callback_onReady = new Array()

watcher.on('load.followbar',()=>{
  button = getFollowButton()
  
  isFollowing = (button!=null)

  if(!isFollowing){
    button = getUnfollowButton()
  }  

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-a-target') {
        isFollowing = !(button.dataset.aTarget === 'follow-button') 
        if(isFollowing){
          callback_onFollow.forEach((callback)=>{
            callback()
          })
        }else{
          callback_onUnfollow.forEach((callback)=>{
            callback()
          })
        }
      }
    });
  });
  observer.observe(button, {
    attributes: true, childList: false, characterData: false
  });

  callback_onReady.forEach((callback)=>{
    callback()
  })
}) 


function getFollowButton(){
  return document.querySelectorAll('[data-a-target="follow-button"]')[0]
}

function getUnfollowButton(){
  return document.querySelectorAll('[data-a-target="unfollow-button"]')[0]
}

module.exports = {

  onReady(callback){
    callback_onReady.push(callback)
  },

  onFollow(callback){
    callback_onFollow.push(callback)
  },

  onUnfollow(callback){
    callback_onUnfollow.push(callback)
  },

  isFollowing(){
    return isFollowing
  }
}