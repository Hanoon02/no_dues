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
    var googleButton = document.querySelector('.google'); // Assuming the button has a class 'google'

    portals.forEach(portal => {
        portal.addEventListener('click', function() {
            // Remove active class from all and set current as active
            portals.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            googleButton.onclick = function(event) {
                event.preventDefault();
                const portalType = document.querySelector('.portal.active').textContent;
                const originalHref = '/user/auth/google';
                window.location.href = `${originalHref}?portal=${portalType}`;
            };
        });
    });

    // Set default portal
    document.getElementById('studentPortal').click();

});