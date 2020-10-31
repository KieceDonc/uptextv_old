const src_url = 'https://uptextv.com/extension/'

/**
 * basically handle the url of each img here
 */
let imgs = {
  add: src_url+'add.png',
  back_arrow : src_url+'back_arrow.png',
  bottom_arrow : src_url+'bottom_arrow.png',
  cancel : src_url+'cancel.png',
  hide : src_url+'hide.png',
  less : src_url+'less.png',
  pin_icon : src_url+'pin-icon.svg',
  premium : src_url+'premium.png',
  reorder : src_url+'reorder.png',
  settings : src_url+'settings.png',
  show : src_url+'show.png',
  top_arrow : src_url+'top_arrow.png',
  trash : src_url+'trash.svg',
  valid : src_url+'valid.png',
  color_picker : src_url+'color_picker.png'
}

module.exports = {
  get(){
    return imgs
  }
}