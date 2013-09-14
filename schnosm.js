+function() {
    var code = "";
    window.addEventListener("keyup", function(e)
    {
        code = (code + e.which).substr(-14);

        if(code == 0x4c1aa27a8229)
        {
            localStorage.last_level = '"2up.js"';
            localStorage.removeItem("state");
            location.reload();
        }
    }, false);
}();
