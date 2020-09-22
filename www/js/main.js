start(function(){

    $(document).ready(function () {
            
        $('.windowTitle').html('Chalona Software');
        $('#main').addClass("active");
    })


    var solicitacr=$('#modalScr').edit(SolicitaCR);

    solicitacr.on('update',function(){actualiza_solicitacr()})
    
    $('#btnMsr').click(function() {
    	solicitacr.insert()
    	.then(function(r){
//    		console.log(solicitacr.vendedor.value)
    	})
    });


})