$(document).ready(function(){
  var global_persona_id='null',
  fieldId=1;
  mainUrl="https://private-anon-9d8454cac8-smaplypersonastest.apiary-mock.com/personas/"+global_persona_id,

   text_html='<div class="persona__container container"><div class="persona__header__section handle"><div class="persona__header__text" contenteditable="true">Heading</div><div class="persona__trash__icon"><i class="fa fa-trash"></i></div></div><div class="persona__body__section" contenteditable="true"><div contenteditable="true">Enter Text</div></div></div>',
   image_html='<div class="persona__container container"><div class="persona__header__section handle"><div class="persona__header__text">Image</div><div class="persona__trash__icon"><i class="fa fa-trash"></i></div></div><div class="persona__body__section"><div class="image__section"><i class="far fa-image fa-10x image_placeholder" ></i> </div></div></div>';

  //Sticky Header
    window.onscroll = function () { stickHeader() };
    var header = document.getElementById("main__header");
    var sticky = header.offsetTop;
    function stickHeader() {
        if (window.pageYOffset > sticky) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }
    }

// calling request to get columns info
getFromServer('persona',successfulRequest,errorRequest);
//append elements html 

//Sortable events
  $(".sortable").sortable({
    handle: ".handle", 
    start: function(e, ui) {
      $(this).attr('data-previndex', ui.item.index());
  },
  update: function(e, ui) {
      var new_id = ui.item.index();
      var previous_id = $(this).attr('data-previndex');
      $(this).removeAttr('data-previndex');
      
      var title=(ui.item).attr('title'),
      column_id=(ui.item).attr('data-columnid'),
      type=(ui.item).attr('field-type'),
     dataVal= title=="text field"?(ui.item).find('.persona__body__section div').html():(ui.item).find('.persona__body__section div img').attr('src');
      var data={
        "id": new_id,
        "title": title,
        "field_type": type,
        "data": dataVal,
        "column_id": column_id,
        "prev_id": previous_id,
        "next_id": null
      }
     
      postToServer('presona_field',"PUT",data,successfulRequest,errorRequest);
  }
});
  $( ".sortable" ).disableSelection();
  //draggable events
  $('.draggable').draggable({
    revert: "invalid",
    stack: ".draggable",
    helper: 'clone'
  });
  $('.droppable').droppable({
    accept: ".draggable",
    drop: function (event, ui) {
      var droppable = $(this),
      // var draggable = ui.draggable;
       data={
         field_type : ui.draggable.attr('field-type'),
        title:ui.draggable.attr('title'), 
        column_id : $(this).attr("column-id"),
        next_id : null,
        prev_id : 3
      }
       
      
       add_dragged_element( droppable,data)
    
    }
  });
//add element at drop of dragged elements
function add_dragged_element(droppable,data){
  console.log('checkin s')
  var type=data.field_type;
  console.log(type);
  switch(type) {
    case 'short_text': case  'long_text':
    
      postToServer('presona_field',"POST",data,successfulRequest,errorRequest,text_html,droppable)
      droppable.prepend(text_html);// This should be done inside callback when request is successful but doing here as the request is not successful some time. 
     
      break;
      case 'image':
          // $(image_html).detach().css({top: 0,left: 0}).appendTo(droppable);
        postToServer('presona_field',"POST",data,successfulRequest,errorRequest,image_html,droppable)
        droppable.prepend(image_html);// This should be done inside callback when request is successful but doing here as the request is not successful some time. 
       
      break;
      case 'image_gallery':
     
      break;
      case 'number':
       droppable.prepend(text_html);
      break;
  
  }

}

//delete element
$('body').delegate('.delete_element','click',function(){
  deleteFromServer($(this),successfulRequest,errorRequest);
})


$('body').delegate('.image_placeholder','click',function(){
 // add image here
})


  $('body').delegate('#real_persona_name, #persona_initials', 'keyup', function () {
    var persona_name,persona_init;
    if($(this).attr('id')=="real_persona_name"){
      persona_name=$(this).html();
      persona_init = (persona_name.substr(0, 3)).toUpperCase();
    }
    else{
      persona_init =$(this).html();
      persona_name = $('#real_persona_name').html();
    } 
    if(persona_name.length==0){
      $('#persona_initials').parents('.shortname__cont').addClass('empty');
      $('#real_persona_name').parents('.desc__cont').addClass('empty');
    }
    else{
      $('#persona_initials').parents('.shortname__cont').removeClass('empty');
      $('#real_persona_name').parents('.desc__cont').removeClass('empty');
    }
    if(persona_init.length==0){
      $('#persona_initials').parents('.shortname__cont').addClass('empty');
    }  
    else{
      $('#persona_initials').parents('.shortname__cont').removeClass('empty');
    }
    color = $('.main__content__header .avatar__cont').css('background-color');
    $('#persona_initials ').html(persona_init);
    var data = {
      id: global_persona_id,
      name: persona_name,
      initials: persona_init,
      color: color,
      avatar: "star"
    }
    postToServer('persona', "PUT", data, successfulRequest, errorRequest)
  });

  // Persona name and initials settings 
$('#persona_initials').keydown(function(event) {
 if($(this).text().length==3 && event.keyCode!=8 ){
  event.preventDefault();
 }
});

//successfull callback
function successfulRequest(type,data){
  if(type=="delete"){
    data.parents('.persona__container').remove();
    console.log('Request has been successfully submitted !!!');
    return;
  }
  if(data){
    //type persona setting elements
    if(type=="persona"){
      global_persona_id=data.id;
      mainUrl="https://private-anon-9d8454cac8-smaplypersonastest.apiary-mock.com/personas/"+global_persona_id;
      $('#header_real_persona_name, #real_persona_name').text(data.name);
      $('.avatar__cont ').css('background-color',data.color);
      var persona_initials=(data.name).substr(0,3);
      $('#persona_initials').text(persona_initials);
      if(data.name.length==0){
        $('#persona_initials').parents('.shortname__cont').addClass('empty');
        $('#real_persona_name').parents('.desc__cont').addClass('empty');
        
      }
      getFromServer("columns",successfulRequest,errorRequest);
    }
    //columns id setting
    else if(type=="columns"){
      $('.main__content__body .main__content__body__left').attr('column-id', data[0].id);
      $('.main__content__body .main__content__body__right').attr('column-id', data[1].id);
      getFromServer('fields', successfulRequest, errorRequest)
    }
    //field data setting
    else if(type=="fields"){
      Object.keys(data).forEach(function(key) {
        var id=data[key].id,
      field_type=data[key].field_type,
      title=data[key].title,
      dataVal=data[key].data,
      column_id=data[key].column_id,
      
      prev_id=data[key].prev_id,
      next_id=data[key].next_id;
      console.log('columng id ',column_id)
      var element='<div class="persona__container container" data-id='+id+' data-previd='+prev_id+'  data_columnid='+column_id+' data-nextid="'+next_id+'" field-type="'+field_type+'" title='+title+'><div class="persona__header__section handle"><div class="persona__header__text">'+title+'</div><div class="persona__trash__icon"><i class="fa fa-trash delete_element"></i></div></div><div class="persona__body__section"><div>'+dataVal+'</div></div></div>';
      $(document).find("[column-id='" + column_id + "']").append(element); 
      });
    }
   console.log('Request has been successfully submitted !!!');
  }

  
}
function errorRequest(){
  console.log('An error occured while submitting request');
}

// http requests
function getFromServer(type,callback,err_callback){
  var url;
  if(type=="persona"){
    url=mainUrl+'null'
  }
  else if (type == 'columns') {
    url = mainUrl + "/columns";
  }
  else if (type == "fields") {
    url = mainUrl + "/fields";
  }
  var request = $.ajax({
    url: url,
    method: "GET",
    contentType: "application/json"
  });

  request.done(function(data){
    callback(type,data);
  })
  //request.done(callback);
  request.fail(err_callback);
}

function postToServer(type,method,data,callback,err_callback){
  var url;
  if(type=="persona"){
    url=mainUrl;
  }
  else{
    if (method == "POST") {
    url = mainUrl + "/fields";
  }
  else if (method == "PUT") {
    url = mainUrl + '/fields/' + fieldId
  }
  }
  
  var request = $.ajax({
    url: url,
    method: method,
    data: data,
    contentType: "application/json"
  });
  request.done(callback);
  request.fail(err_callback);
}

function deleteFromServer($this,callback,err_callback){
  var id=$this.parents('.container').attr('data-id');
  var url=mainUrl+'/fields/'+id;
  console.log(url);
  var request = $.ajax({
    url: url,
    method: "DELETE",
    contentType: "application/json"
  });

  request.done(function(data){
    data=$this;
    callback('delete',data);
  })
  //request.done(callback);
  request.fail(err_callback);
}

})