start(function(){

    var f = new Date();
    var hours=f.getHours();
    var minutes=f.getMinutes();
    var x = f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear()
    var fecha = x+' '+hours+':'+minutes


    var vc = false;
    var vs = false;
    var vm = false; 


    var xvalid = false;


    var tc = $('#client_text')
    var tm = $('#merc_text')
    var ts = $('#saldo_text')


    var sync_saldo=function(){
    	return new Promise(function(ok, fail){
		    $.ajax({url: http_server+'/sync_saldo'})
		    .done(function(r){
		    	ok(r)
		    })
		    .fail(function(e){
		    	fail(e)
		    })
    	})
    }

    var sync_cliente=function(){
    	return new Promise(function(ok, fail){
		    $.ajax({url: http_server+'/sync_cliente'})
		    .done(function(r){
		    	ok(r)
		    })
		    .fail(function(e){
		    	fail(e)
		    })
    	})
    }


    var sync_merc=function(x){
    	return new Promise(function(ok, fail){
		    $.ajax({url: http_server+'/sync_merc', data: x})
		    .done(function(r){
		    	ok(r)
		    })
		    .fail(function(e){
		    	fail(e)
		    })
    	})
    }


	var xsync_saldo = ()=>{
    	sync_saldo()
    	.then((r)=>{
            db.request('delete from sales_saldo')
            .then(()=>{
                var xsaldo = new Saldo();
                xsaldo.insert(r)
                .then(function(){
                    return xsaldo.update()
                })
                .then(()=>{
                    ts.css({color: '#00695C'})
                    vs = true;
                })
                .catch((e)=>{
                	vs = true;
                	xvalid = true;
                	console.error(e)
                })
            })
    	})
    	.catch((e)=>{
    		vs = true;
    		xvalid = true;
    		console.error(e)
    	})
    }   



    var xsync_clientes = ()=>{
    	sync_cliente()
        .then((r)=>{
            db.request('delete from sales_cliente')
            .then(()=>{
                var xcliente = new Cliente();
                xcliente.insert(r)
                .then(function(){
                    return xcliente.update()
                })
                .then(()=>{
                	vc = true;
                    tc.css({color: '#00695C'})
                })
                .catch((e)=>{
                	vc = true;
                	xvalid = true;
                	console.error(e)
                })
            })
        })
        .catch((e)=>{
        	vc = true;
        	xvalid = true;
        	console.error(e)
        })
    }



    var xsync_merc = function(){
//        $('#dismiss').click();
  
        var count = 0;
        var hasta =  700;

        var valid = true;

        function x (){
            sync_merc({desde:count, hasta: hasta})
            .then((r)=>{
                count=count+700;
                hasta=count+700;
                
                if(valid==true) db.request('delete from sales_merc')

                if(!r.length){
                	vm = true;
                    tm.css({color: '#00695C'})
                    return 
                }else {
                    var xmerc = new Merc();
                    xmerc.insert(r)
                    .then(function(){
                        return xmerc.update()
                    })
                    .then(()=>{
                        $('#pinfo').html('Actualizando Mercancias...')
                        x();
                    })
                    .catch((e)=>{
                    	vm = true;
                    	xvalid = true;
                        console.error(e)
                    })
                }
                valid = false;
            })
            .catch((e)=>{
				xvalid = true;
            	vm = true;
                console.error(e)
            })
        }

        x();
    }


    var xmerc = true;
    var xsaldo = true;
    var xcliente = true;

    $(document).on('change', '[name="chcliente"]', function(){
        if($(this).is(":checked")) {
        	xcliente=true;
        }else {             
        	xcliente=false;
        } 
    })

    $(document).on('change', '[name="chsaldo"]', function(){
        if($(this).is(":checked")) {
        	xsaldo=true;
        }else {             
        	xsaldo=false;
        } 
    })

    $(document).on('change', '[name="chmerc"]', function(){
        if($(this).is(":checked")) {
        	xmerc=true;
        }else {             
        	xmerc=false;
        } 
    })



    $(document).on('click', '[name="sync"]', function(){

    	if(xmerc==false && xsaldo==false && xcliente==false){

    	}else{

	    	if(xmerc==true) {
	    		tm.attr('hidden', false) 
	    		xsync_merc();
	    	}else {
				vm = true;
	    	}	


	    	if(xcliente==true){
	    		tc.attr('hidden', false) 
	    		xsync_clientes();	
	    	}else {
	    		vc = true;
	    	} 
	    		

	    	if(xsaldo==true){
	    		ts.attr('hidden', false) 
	    		xsync_saldo();		
	    	}else{
				vs = true;
	    	} 


	    	//$('#ModalLoader').modal({backdrop: 'static', keyboard: false});

	    	setInterval(function(){
	    		if(vm==true && vc==true && vs==true){
	    			if(xvalid == false){
						$('#sync2').addClass('bounceOut')
						$('#sync3').addClass('bounceInDown')
						setTimeout(function() {	    			
							$('#sync2').hide(500)
							$('#sync3').show(500)
                            setTimeout(function() {
                                $('#sync3').addClass('bounceOut')
                                localStorage.setItem('sync_update', fecha)
                                setTimeout(function() {
                                    location.assign('main.html')
                                }, 1000);
                            }, 3000);
						}, 500);
	    			}else {
						$('#sync2').addClass('bounceOut')
						$('#fallo_sync1').addClass('bounceInDown')
						setTimeout(function() {	    			
							$('#sync2').hide(500)
							$('#fallo_sync1').show(500)
						}, 500);	    				
	    			}
	    		}
	    	}, 1000)
			

			$('#sync1').addClass('bounceOut')
			$('#sync2').addClass('bounceInDown')
			setTimeout(function() {
				$('#sync1').hide()
				$('#sync2').show()
			}, 500);
    	}
    })

})