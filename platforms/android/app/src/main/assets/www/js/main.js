start(function(){
    
    
    $(document).ready(function () {
        var x = localStorage.getItem('User');
        x=JSON.parse(x);
        
        $('.windowTitle').html('Chalona Sales');
        $('#main').addClass("active");

        var d = new Date()
        var y=d.getFullYear()
        var h = d.getHours()
        
        if (h>=0 && h<6) {
            $('.saludando').html('Dulces Sueños, ')
        } else if (h>=6 && h<12) {
            $('.saludando').html('Buenos Dias, ')
        } else if (h>=12 && h<18) {
            $('.saludando').html('Buenas Tardes, ')
        } else if (h>=18 && h<24) {
            $('.saludando').html('Buenas Noches, ')
        }                    
    
        $('.anio_reserved').html(y)
    
        
        let salesmanName = x.nombre.split(' ')[0]
        salesmanName = jsUcfirst(salesmanName);
        $('.userNameMain').html(salesmanName); 
        
        function jsUcfirst( string ) 
        {
            string = string.toLowerCase();
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

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