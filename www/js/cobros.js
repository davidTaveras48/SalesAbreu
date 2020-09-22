
var b_cobros=function(x){
    return db.request(`
        select id,fecha,cliente.nombre ,cliente.codigo,cobrod.valor,numero
        from sales_cobro inner join sales_cliente as cliente on cliente.codigo=sales_cobro.cliente
        inner join (
        	select sum(valor) as valor,cobro 
        	from sales_cobrod group by cobro 
        	) as cobrod on cobrod.cobro=sales_cobro.id
        where  cliente.nombre like '%${x.search}%' or  numero like '%${x.search}%'
        order by ${x.order} ${x.torder} limit ${x.limit} offset ${x.offset}

    `)
}
var recibo_actual;
var imprimir=function(){
    go('rep_cobro_cliente_copia.html',{recibo:recibo_actual})
}
start(function(){
    var detalle=$('#detalle').repeat()
    $('#lista').search('b_cobros',{order:'fecha',torder:'desc'})
    .on('detail',function(x){
        recibo_actual=x.id;
        db.request(`
            select saldo.documento as factura ,saldo.fecha,cobrod.valor
            from sales_cobrod as cobrod inner join sales_saldo as saldo on saldo.id=cobrod.factura
            where cobro='${x.id}'
        `)
        .then(function(r){
            detalle.empty();
            detalle.append(r)
            $('#cobrosModal').modal()
        })
    })
})