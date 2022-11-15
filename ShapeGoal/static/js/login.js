
$('document').ready(function() {
   $(".test").modal('hide');
})

    document.getElementById("accountlink").onclick = function(){
        $(".test").modal('show');
      $(".test").modal({
        closable: true
      });
    }

    window.addEventListener('keydown', function (event) {   if (event.key === 'Escape') {       $(".test").modal('hide');  } })