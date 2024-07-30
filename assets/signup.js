$(".signup").css("display", "none");

$(".signbtn").click(function(){
    $("form").animate({ height:"toggle", opacity: "toggle"}, "slow");
});

$("#showhide").click(function(){
var pass = $("#myinput");
if (pass.attr("type") == "password") {
pass.attr("type", "text");
} else {
pass.attr("type", "password");
}
})

document.addEventListener('DOMContentLoaded', function() {
    var portals = document.querySelectorAll('.portal');
    portals.forEach(portal => {
        portal.addEventListener('click', function() {
            portals.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.getElementById('studentPortal').click(); 

});