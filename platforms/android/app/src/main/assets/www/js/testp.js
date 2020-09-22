start(function () {
	window.b_ordenes=function(x){
		return db.request(`
			select cliente.codigo, cliente.codigo from cliente
			where  cliente.codigo like '%${x.search}%' or
			where  cliente.nombre like '%${x.search}%'
			order by ${x.order} ${x.torder} limit ${x.limit} offset ${x.offset}

		`)
	}
});