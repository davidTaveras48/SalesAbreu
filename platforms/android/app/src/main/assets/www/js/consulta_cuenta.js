start(function(){
    var data=go_data().data

    $('#cliente').val(data.nombre)
    $('#telefono').html(data.telefono)
    db.request(`
        select id,documento,date(fecha) as fecha,0 as dias,balance 
        from sales_saldo 
        where rtrim(cliente)='${data.codigo}' and balance>0
    `)


    .then(function(r){
      r.forEach(function(x){
        x.dias=util.date_diff.inDays(new Date(x.fecha),new Date())
      })

      $('tbody').repeat(r)
      var total=0
      for(var i=0;i<r.length;i++){
        total+=parseFloat(r[i].balance)

      }
      $('#total').html(util.nformat(total,2))
    })

    $(document).ready(function () {
      $('.windowTitle').html('Estado de Cuenta');
      $('#consultac').addClass("active");      
      $('#pagar').click(function(){
        go('cobros_edit.html',data)
      })
    })
})