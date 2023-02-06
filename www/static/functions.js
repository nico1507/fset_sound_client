let api_url = "http://fset-kgb.stuve.uni-ulm.de:8888"
let auth = false;
let ch_buero = 1;
let ch_kueche = 1;
let vol_buero  = -80;
let vol_kueche = -80;
let vol_buero_min = -80;
let vol_kueche_min = -80;
let vol_buero_max = 0;
let vol_kueche_max = 0;
let mute_buero = false;
let mute_kueche = false;
let blink_status = false;
let login = true;
let admin = false;
let locked_buero = false;
let locked_kueche = false;
let locked_display_buero = false;
let locked_display_kueche = false;
let setting_page_active = false;
let username = "";

function admin_priv(){
  admin=document.getElementById("admin_priv").checked;  
}

// general functions
function init(){
  // initialize variables
  vol_buero = -80;
  vol_kueche = -80;
  mute_buero = false;
  mute_kueche = false;

  // set html elements
  set_volume_buero_slider();
  set_volume_kueche_slider();
  show_volume_buero();
  show_volume_kueche();
  set_source_display_buero();
  set_source_display_kueche();
  setInterval(blinker, 700);
  setInterval(api_auto_update, 10000);
  update_lock_buero(locked_buero);
  update_lock_kueche(locked_kueche);
  set_startup_view();
}

function set_startup_view(){
  if(!auth){
    setTimeout(function(){set_login_view()}, 2600);
  }else{
    setTimeout(function(){set_slider_view()}, 2600);
  }
}

function set_clean_view(){
  const pages = document.querySelectorAll(".page");
  pages.forEach(element => {
    element.style.display = 'none';    
  });
}

function set_login_view(){
  change_all_opacities("0");
  set_clean_view();
  set_menu_icon(false);
  document.getElementById("loginpage").style.display = 'block';
  setTimeout(function() {change_opacity_by_id("loginpage", "1")}, 400);
}

function set_slider_view(){
  change_all_opacities("0");
  set_clean_view();
  set_menu_icon(true);
  document.getElementById("sliderpage").style.display = 'block';
  setTimeout(function() {change_opacity_by_id("sliderpage", "1")}, 400);
}

function set_settings_view(){
  change_all_opacities("0");
  set_clean_view();
  set_menu_icon(true);
  document.getElementById("settingspage").style.display = 'block';
  setTimeout(function() {change_opacity_by_id("settingspage", "1")}, 400);
}

function change_opacity_by_id(el_id, op){
  document.getElementById(el_id).style.opacity = op;
}

function change_all_opacities(op){
  const pages = document.querySelectorAll(".page");
  pages.forEach(element => {
    element.style.opacity = op;    
  });
}

function toggle_settings_view(){
  setting_page_active = ! setting_page_active;
  if(setting_page_active){
    document.getElementById("menu_icon").src = "static/img/Slider.svg"
    set_settings_view();
  }else{
    document.getElementById("menu_icon").src = "static/img/Settings.svg"
    set_slider_view();
  }

}

function set_menu_icon(show) {
  if(!show){
    document.getElementById("menu_icon").style.opacity = 0;
    document.getElementById("menu_icon").onclick = function(){};
  }else{
    document.getElementById("menu_icon").style.opacity = 1;
    document.getElementById("menu_icon").onclick = function(){toggle_settings_view();};
  }
}


// login functions
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) == (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

async function loginUser(){
  let user = document.getElementById("login_user_field").value;
  let pw = document.getElementById("login_pw_field").value;
  const res = await api_login(user,pw).then((response) => {setAuth(response)});
  printCookie();

  if(auth){
    set_slider_view();
    username = document.getElementById("login_user_field").value;
    document.getElementById("user_field").innerHTML = "Eingeloggt als: " + username;
  }
}

function setAuth(response){
  if (response === "Login successful!"){
    auth = true;
    api_get_update();
  }else{
    auth = false;
  }
}

function press_login(){
  loginUser();
}

function logoutUser(){
  //dummy
  api_logout();
  document.getElementById("user_field").innerHTML = "Eingeloggt als: ";
  if(!auth){
    //set_login_view();
  }
}

function press_logout(){
  logoutUser();
}

// main page functions
function set_volume_buero(){
  vol_buero = document.getElementById("buero_slider").value;
}

function set_volume_kueche(){
  vol_kueche = document.getElementById("kueche_slider").value;
}

function set_volume_buero_slider(){
  document.getElementById("buero_slider").value = vol_buero;
}

function set_volume_kueche_slider(){
  document.getElementById("kueche_slider").value = vol_kueche;
}

function update_buero_display(){
  document.getElementById("volume_buero").innerHTML = document.getElementById("buero_slider").value + " dB";
}

function update_kueche_display(){
  document.getElementById("volume_kueche").innerHTML = document.getElementById("kueche_slider").value + " dB";
}

function show_volume_buero(){
  document.getElementById("volume_buero").innerHTML = vol_buero.toString() + " dB";
}

function show_volume_kueche(){
  document.getElementById("volume_kueche").innerHTML = vol_kueche.toString() + " dB";
}

function toggle_mute_buero(){
  mute_buero = !mute_buero;
  if(!mute_buero){
    document.getElementById("buero_mute").style.background='#aa0000';
  }
  set_mute_slider_buero(mute_buero);
}

function toggle_mute_kueche(){
  mute_kueche = !mute_kueche;
  if(!mute_kueche){
    document.getElementById("kueche_mute").style.background='#aa0000';
  }
  set_mute_slider_kueche(mute_kueche);
}

function set_mute_buero(mute){
  mute_buero = mute;
  if(!mute_buero){
    document.getElementById("buero_mute").style.background='#aa0000';
  }
  set_mute_slider_buero(mute_buero);
}

function set_mute_kueche(mute){
  mute_kueche = mute;
  if(!mute_kueche){
    document.getElementById("kueche_mute").style.background='#aa0000';
  }
  set_mute_slider_kueche(mute_kueche);
}

function update_lock_buero(lock){
  document.getElementById("lock_buero").checked = lock;
  set_lock_buero(lock);
}

function update_lock_kueche(lock){
  document.getElementById("lock_kueche").checked = lock;
  set_lock_kueche(lock);
}

function set_lock_buero(locked){
  document.getElementById("buero_mute").disabled = locked.checked && !admin;
  document.getElementById("buero_source").disabled = locked.checked && !admin;
  if(locked.checked){
    document.getElementById("locked_buero").style.opacity='1';

    if(admin){
      document.getElementById("locked_buero").style.color='#aaaaaa';
    }else{
      locked_display_buero = true;
      set_mute_slider_buero(true);
      document.getElementById("buero_mute").style.background='#ff0000';
    }
  }else{
    document.getElementById("locked_buero").style.opacity='0';
    set_mute_slider_buero(false);
    document.getElementById("buero_mute").style.background='#aa0000';
  }
}

function set_lock_kueche(locked){
  document.getElementById("kueche_mute").disabled = locked.checked && !admin;
  document.getElementById("kueche_source").disabled = locked.checked && !admin;
  if(locked.checked){
    document.getElementById("locked_kueche").style.opacity='1';

    if(admin){
      document.getElementById("locked_kueche").style.color='#aaaaaa';
    }else{
      locked_display_kueche = true;
      set_mute_slider_kueche(true);
      document.getElementById("kueche_mute").style.background='#ff0000';
    }
  }else{
    document.getElementById("locked_kueche").style.opacity='0';
    set_mute_slider_kueche(false);
    document.getElementById("kueche_mute").style.background='#aa0000';
  }
}

function blinker(){
  mute_blinker();
  lock_blinker();
  blink_status = !blink_status
}

function mute_blinker(){
  if(blink_status){
    if(mute_buero){
      document.getElementById("buero_mute").style.background='#ff0000';
    }
    if(mute_kueche){
      document.getElementById("kueche_mute").style.background='#ff0000';
    }
  }else{
    if(mute_buero){
      document.getElementById("buero_mute").style.background='#aa0000';
    }
    if(mute_kueche){
      document.getElementById("kueche_mute").style.background='#aa0000';
    }
  }
}

function lock_blinker(){
  if(blink_status){
    if(locked_display_buero){
      document.getElementById("locked_buero").style.color='#ff0000';
    }
    if(locked_display_kueche){
      document.getElementById("locked_kueche").style.color='#ff0000';
    }
  }else{
    if(locked_display_buero){
      document.getElementById("locked_buero").style.color='#444444';
    }
    if(locked_display_kueche){
      document.getElementById("locked_kueche").style.color='#444444';
    }
  }
}

function set_mute_slider_buero(lock){
  document.getElementById("buero_slider").disabled = lock;
  let txtcolor = '#aaaaaa'
  if(lock){
    txtcolor = '#ff0000'
  }
  document.getElementById("volume_buero").style.color = txtcolor;
}

function set_mute_slider_kueche(lock){
  document.getElementById("kueche_slider").disabled = lock;
  let txtcolor = '#aaaaaa'
  if(lock){
    txtcolor = '#ff0000'
  }
  document.getElementById("volume_kueche").style.color = txtcolor;
}

function set_source_buero(){
  ch_buero = document.getElementById("buero_source").value;
}

function set_source_kueche(){
  ch_kueche = document.getElementById("kueche_source").value;
}

function set_source_display_buero(){
  document.getElementById("buero_source").value=ch_buero;
}

function set_source_display_kueche(){
  document.getElementById("kueche_source").value=ch_kueche;
}

// API funtions
function api_login(user, pw) {

  return fetch(api_url+'/api-auth/login/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username:user,password:pw }),
      credentials: 'same-origin'
  })
  .then((response) => {
    return response.json();
  })
  .then(data => {return data});
}

async function api_logout(){
  let response;
  try{
    response = await fetch(api_url+"/api-auth/logout");
  }catch(err){
    console.log("[ERROR] Logout could not be completed. Exiting anyway.")
  }

  //auth = false;
  //set_login_view();
}

async function api_get_update(){
  let response;
  let values;
  try{
    response = await fetch(api_url+'/getOutput', {credentials: 'include'});
    values = await response.json();
  }catch(err){
    console.log("[ERROR] An error occured during updating data from server. Logging out...");
    auth = false;
    set_login_view();
    return;
  }

  if (!response.ok){
    console.log("[WARNING] Access denied. Logging out...");
    auth = false;
    set_login_view();
  }

  // Büro
  if (values.inputConfig1.inputChannel != ch_buero){
    ch_buero = values.inputConfig1.inputChannel;
    set_source_display_buero();
  }
  if (values.inputConfig1.gain != vol_buero){
    let vol_buero_new = values.inputConfig1.gain;
    if (vol_buero_new < vol_buero_min){
        vol_buero_new = vol_buero_min;
    }
    if (vol_buero_new > vol_buero_max){
      vol_buero_new = vol_buero_max;
    }
    if (vol_buero_new != vol_buero){
      vol_buero = vol_buero_new;
      set_volume_buero_slider();
    }
  }
  if (values.inputConfig1.mute != mute_buero){
    set_mute_buero(values.inputConfig1.mute);
  }

  // Küche
  if (values.inputConfig2.inputChannel != ch_kueche){
    ch_kueche = values.inputConfig2.inputChannel;
    set_source_display_kueche();
  }
  if (values.inputConfig2.gain != vol_kueche){
    let vol_kueche_new = values.inputConfig2.gain;
    if (vol_kueche_new < vol_kueche_min){
        vol_kueche_new = vol_kueche_min;
    }
    if (vol_kueche_new > vol_kueche_max){
      vol_kueche_new = vol_kueche_max;
    }
    if (vol_kueche_new != vol_kueche){
      vol_kueche = vol_kueche_new;
      set_volume_kueche_slider();
    }
  }
  if (values.inputConfig2.mute != mute_kueche){
    set_mute_kueche(values.inputConfig2.mute);
  }
}

function api_auto_update(){
  if(auth){
    api_get_update();
  }
}

function printCookie(){
  console.log(getCookie2(csrftoken));
}

function getCookie2(name) {
  let cookie = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return cookie ? cookie[2] : null;
}