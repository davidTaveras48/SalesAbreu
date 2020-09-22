class SalesLogin extends Login{
	/*
	on_login(){
		return new Promise(function(ok,fail){

			//	instanciando la tabla de clientes
			var cliente=new Cliente();
			
			//	consulto si existen ordenes pendientes por enviar al servidor de otro usuario
		    db.request(`select * from orden where enviado=0 and vendedor='${User.id}'`)
		    
		    .then(function(r){

		    	//	si existen falla la promesa
		    	if(r.length){
		    		fail('Existe ordenes pendientes de otro usuario que debe enviar')
		    		return Promise.reject()
		    	}

				//	descargo los clientes del vendedor
				return d_cliente(User.id)

		    })

			//	insertando los clientes descargados en la tabla
			.then(function(r){
				return cliente.insert(r)
			})

			//	guardando los clientes insertados
			.then(function(r){
				return cliente.update()
			})

			//	concluyendo la operacion
			.then(function(r){
				ok()
			})

		})
	}
	*/
}

start(function(){
	$('#login_app').form(Login)
})

$(document).ready(function(){
    setTimeout(function() {
        $("#login_app").show(500)
        $('[name="user"]').focus()
    }, 1000);

	$('input').keyup(function(e){
	    if(e.keyCode==13){
			$('#btnLogin').click()
	    }
	})    


})