var detalle=[]
var cliente=go_data().data
var total=0;
var fpago=0;

var grabar_recibo=function(){
	var cobro=new Cobro();
	cobro.insert()
	.then(function(){
		cobro.cliente.value=cliente.codigo;
		cobro.fecha.value=util.sync_time()
		cobro.comentario.value=$('[name=comentario]').val()
		cobro.efectivo.value=$('[name=efectivo]').val()
		cobro.cheque.value=$('[name=cheque]').val()
		cobro.transferencia.value=$('[name=transferencia]').val()
		cobro.referencia.value=$('[name=referencia]').val()
		cobro.banco.value=$('[name=banco]').val()
		cobro.cknumero.value=$('[name=cknumero]').val()
		
		var resta=parseFloat($('#restan').val())
		if(		!parseFloat(cobro.efectivo.value) 
				&& !parseFloat(cobro.cheque.value) 
				&& !parseFloat(cobro.transferencia.value)
		){
			alert('Especifique la forma de pago')
			return  Promise.reject()
		}
		if(resta>0){
			alert('Falta dinero')
			return  Promise.reject()
		}

		if(parseFloat(cobro.cheque.value)>0){
			if(cobro.banco.value=='' ||parseFloat(cobro.cknumero.value)==0){
				alert('Especifique la informacion del cheque')
				return  Promise.reject()
			}
		}

		var paquete=[]

		detalle.forEach(function(x){
			if(x.pagar){
				paquete.push({
					cobro:cobro.id.value,
					factura:x.id,
					valor:x.pagar
				})
			}
		})
		if(!paquete.length)return Promise.reject()
		return cobro.sales_cobrod.insert(paquete)
	})

	.then(function(){
		return cobro.update()
	})

    .then(function(){
        return db.request(`
            update sales_cuadre set visita='Efectiva',cobro='SI'
            where cliente='${cobro.cliente.value}'
        `)
    })

	.then(function(){
		go('rep_cobro.html',{recibo:cobro.id.value})
	})

}

var calcular=function(){
	total=0;
	detalle.forEach(function(x){
		if(x.pagar)total+=x.pagar;
	})

	$('#total').html(util.nformat(total))
	$('#restan').val(util.nformat(total))
	//$('[name=efectivo],[name=cheque]').val(0)	
}


$(document).on('change','.pagar',function(){
	var r=$(this).parent().parent().attr('rid');
	detalle[r].pagar=parseFloat(this.value)
	calcular()
})
$(document).on('keyup','.pagar',function(){
	$(this).trigger('change')
})


$(document).on('dblclick','.pagar',function(){
	var r=$(this).parent().parent().attr('rid');
	var valor=parseFloat(this.value)
	if(valor){
		$(this).val(0)
		detalle[r].pagar=0

	}else{
		$(this).val(parseFloat(detalle[r].balance))
		detalle[r].pagar=parseFloat(detalle[r].balance)
	}
	calcular()
})

start(function(){
	$('[name=efectivo]').on('dblclick',function(){

		var cheque=parseFloat($('[name=cheque]').val())
		var transferencia=parseFloat($('[name=transferencia]').val())

		var efectivo=parseFloat(this.value)
		if(efectivo){
			$(this).val(0);
			efectivo=0
		}else{
			efectivo=total-cheque-transferencia
			$(this).val(efectivo.toFixed(2));
		}
		$('#restan').val(util.nformat(total-(efectivo+cheque+transferencia)));
		$(this).trigger('change')
		return false
	})


	$('[name=cheque]').on('dblclick',function(){

		var efectivo=parseFloat($('[name=efectivo]').val())
		var transferencia=parseFloat($('[name=transferencia]').val())

		var cheque=parseFloat(this.value)

		if(cheque){
			$(this).val(0);
			cheque=0
		}else{
			cheque=total-efectivo-transferencia
			$(this).val(cheque.toFixed(2));
		}
		$('#restan').val(util.nformat(total-(efectivo+cheque+transferencia)));
		$(this).trigger('change')
		return false;
	})

	$('[name=transferencia]').on('dblclick',function(){
		var efectivo=parseFloat($('[name=efectivo]').val())
		var cheque=parseFloat($('[name=cheque]').val())

		var transferencia=parseFloat(this.value)

		if(transferencia){
			$(this).val(0);
			transferencia=0
		}else{
			transferencia=total-efectivo-cheque
			$(this).val(transferencia.toFixed(2));
		}
		$('#restan').val(util.nformat(total-(efectivo+cheque+transferencia)));
		$(this).trigger('change')
		return false;
	})


	$('[name=cheque],[name=efectivo],[name=transferencia]').on('keyup',function(){
		$(this).trigger('change')
	})

	$('[name=efectivo]').on('change',function(){
		var efectivo=parseFloat($('[name=efectivo]').val())
		var cheque=parseFloat($('[name=cheque]').val())
		var transferencia=parseFloat($('[name=transferencia]').val())
		if(cheque+efectivo+transferencia>total)efectivo=total-cheque-transferencia
		var valor=cheque+efectivo+transferencia
		$(this).val(efectivo)		
		$('#restan').val(util.nformat(total-valor));
	})

	$('[name=cheque]').on('change',function(){
		var efectivo=parseFloat($('[name=efectivo]').val())
		var cheque=parseFloat($('[name=cheque]').val())
		var transferencia=parseFloat($('[name=transferencia]').val())
		if(cheque+efectivo+transferencia>total)cheque=total-efectivo-transferencia
		var valor=cheque+efectivo+transferencia		
		$(this).val(cheque)		
		$('#restan').val(util.nformat(total-valor));
	})


	$('[name=transferencia]').on('change',function(){
		var efectivo=parseFloat($('[name=efectivo]').val())
		var cheque=parseFloat($('[name=cheque]').val())
		var transferencia=parseFloat($('[name=transferencia]').val())
		if(cheque+efectivo+transferencia>total)transferencia=total-efectivo-cheque
		var valor=cheque+efectivo+transferencia		
		$(this).val(transferencia)		
		$('#restan').val(util.nformat(total-valor));
	})


	$('#entidad').val(cliente.nombre)
	$('#detalle').repeat(detalle);

	db.request(`select * 
		from sales_saldo
		where cliente='${cliente.codigo}'
	`)
	.then(function(r){
		r.forEach(function(x){
			x.documento=x.documento.substr(6)
			x.dias=util.date_diff.inDays(new Date(x.fecha),new Date())
		})

		detalle.append(r)
	})

})

