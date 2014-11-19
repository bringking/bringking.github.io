function toggle(){
    var nav = document.querySelectorAll(".site-header");
    var toggle = document.querySelectorAll(".nav-toggle");
    toggle[0].classList.toggle("open");
    nav[0].classList.toggle("open");
}