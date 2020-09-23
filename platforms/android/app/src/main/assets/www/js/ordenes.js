var cliente;
var falta_clientes = []
$(document).on('change', '.visita', function () {
    falta_clientes[$(this).parent().parent().attr('rid')].visita = this.value
})

$(document).on('change', '.nota', function () {
    falta_clientes[$(this).parent().attr('rid')].nota = this.value
})

function confirma_cierre() {
    db.request(`
        select codigo,nombre from sales_cliente
        inner join sales_cuadre on sales_cuadre.cliente=sales_cliente.codigo
        where sales_cliente.vendedor = '${User.id}' and inactivo = 0 and coalesce(visita,'')='' and ruta=1
    `)
        .then(function (r) {
            falta_clientes.empty();
            falta_clientes.append(r)
            return datos_de_cierre()
        })
        .then(function (paquete) {
            $('#ordenes_cantidad').html(util.iformat(paquete.venta.length))
            $('#cobros_cantidad').html(util.iformat(paquete.cobro.length))
            $('#total_cobrado').html(util.nformat(paquete.total_cobrado))
            $('#total_vendido').html(util.nformat(paquete.total_vendido))
            $('#total_efectivo').html(util.nformat(paquete.total_efectivo))
            $('#total_cheque').html(util.nformat(paquete.total_cheque))
            $('#total_transferencia').html(util.nformat(paquete.total_transferencia))
            $('#cierreModal').modal({ backdrop: 'static', keyboard: false })
        })

}



var datos_de_cierre = function () {
    var paquete = {};
    var visita = util.clone(falta_clientes)

    return new Promise(function (ok, fail) {

        db.request(`
            select codigo,nombre,sum(cantidad*precio) as valor
            from sales_cliente as cliente 
                inner join orden on cliente.codigo=orden.cliente
                inner join detalle on detalle.orden=orden.id
            where coalesce(orden.cerrado,0)=0
            group by codigo,nombre

        `)

            .then(function (r) {
                paquete.venta = r;
                paquete.total_vendido = 0
                r.forEach(function (x) {
                    paquete.total_vendido += parseFloat(x.valor)
                })
                return db.request(`
                select codigo,nombre,efectivo,cheque,transferencia,efectivo+cheque+transferencia as total
                from sales_cliente as cliente 
                    inner join sales_cobro as cobro on cliente.codigo=cobro.cliente
                where coalesce(cobro.cerrado,0)=0

            `)

            })
            .then(function (r) {
                paquete.cobro = r;
                return db.request(`
                select codigo,nombre,visita,cuadre.fecha
                from sales_cliente as cliente 
                    inner join sales_cuadre cuadre on cliente.codigo=cuadre.cliente
                where coalesce(visita,'')<>''
                group by codigo,nombre

            `)

            })

            .then(function (r) {
                paquete.resumen = r;
                visita.forEach(function (x) {
                    paquete.resumen.push(x)
                })
                paquete.vendedor = User.nombre

                paquete.total_venta = 0
                paquete.venta.forEach(function (x) {
                    paquete.total_venta += parseFloat(x.valor)
                })
                paquete.total_cheque = 0
                paquete.total_efectivo = 0
                paquete.total_transferencia = 0
                paquete.cobro.forEach(function (x) {
                    paquete.total_efectivo += parseFloat(x.efectivo)
                    paquete.total_cheque += parseFloat(x.cheque)
                    paquete.total_transferencia += parseFloat(x.transferencia)
                })

                paquete.total_cobrado = paquete.total_efectivo + paquete.total_cheque + paquete.total_transferencia
                paquete.fecha = new Date();
                //paquete.fecha=paquete.resumen[0].fecha||new Date();

                ok(paquete)
            })
            .catch(fail)

    })

}


function cerrar_cuadre() {
    var error = false;
    falta_clientes.forEach(function (x, i) {
        if (!x.visita || x.visita == '') {
            if (!error) $('select', '[rid=' + i + ']').focus()

            error = true;
            $('select', '[rid=' + i + ']').parent().addClass('has-error')
        } else {
            $('select', '[rid=' + i + ']').parent().removeClass('has-error')
        }
    })
    if (error) {
        return false
    }
    var visita = util.clone(falta_clientes)



    datos_de_cierre()
        .then(function (paquete) {
            return envia_correo_cierre(paquete)
        })
        .then(function (r) {
            if (!r || !r.ok) {
                return Promise.reject();
            }
            return new Promise(function (ok, fail) {

                var recursivo = function () {
                    var x = visita.shift();
                    if (!x) {
                        ok();
                        return
                    }
                    db.request(`
                    update sales_cuadre
                        set visita='${x.visita}',enviado=0
                        where cliente='${x.codigo}'
                `)
                        .then(function () {
                            recursivo()
                        })
                }
                recursivo()
            })

        })
        .then(function () {
            return db.request(`
            update sales_cobro set cerrado=1 where coalesce(cerrado,0)=0
        `)
        })
        .then(function () {
            return db.request(`
            update orden set cerrado=1 where coalesce(cerrado,0)=0
        `)
        })
        .then(function () {
            return db.request(`
            delete from sales_cuadre
        `)
        })

        .then(function () {
            $('#cierreModal').modal('hide')

            setTimeout(function () {
                dialog = bootbox.dialog({
                    title: 'Chalona Sales',
                    closeButton: false,
                    message: '<p><i class="fa fa-spin fa-spinner"></i> Enviando información...</p>'
                });
                dialog.init();

                setTimeout(function () {
                    location.assign('main.html')
                }, 2500);
            }, 500);


        })


}
start(function () {

    falta_clientes = $('#falta_clientes').repeat()

    window.b_cliente = function (x) {
        x.search = x.search.replace(/ /g, '%')
        return db.request(`
            select *
                ,case when sales_cuadre.cliente is not null then '<i class="fa fa-check" style="font-weight:bold; color: #00796B; font-size: 20px;"></i>'
                    when en_ruta='0' then 'Hoy' 
                    else dia end  en_rutads

            from (
                select 
                    case when semana${SEMANA}=1 and trim(dia)='${dia}' 
                        then '0' else  

                        case when semana1=1 then '1' else '2' end||
                        case when semana2=1 then '1' else '2' end||
                        case when semana3=1 then '1' else '2' end||
                        case when semana4=1 then '1' else '2' end||
                        case when semana5=1 then '1' else '2' end||
                        case    when trim(dia)='Lunes' then '2'
                                when trim(dia)='Martes' then '3' 
                                when trim(dia)='Miercoles' then '4' 
                                when trim(dia)='Jueves' then '5' 
                                when trim(dia)='Viernes' then '6' 
                                when trim(dia)='Sabado' then '7' 
                                when trim(dia)='Domingo' then '8' 
                        else '8' end end

                    as en_ruta
                    ,codigo, nombre,direccion,telefono
                    ,   substr(dia,1,3)||'<br>S:'||case when semana1=1 then '1' else '' end||
                        case when semana2=1 then '2' else '' end||
                        case when semana3=1 then '3' else '' end||
                        case when semana4=1 then '4' else '' end||
                        case when semana5=1 then '5' else '' end
                     as dia 
                     ,saldo.balance,antiguedad as dias ,saldo.fecha,incremento
                from sales_cliente cliente
                left join (
                    select min(fecha) as fecha,cliente,sum(balance) as balance from sales_saldo where balance>0
                    group by cliente
                ) as saldo on saldo.cliente=cliente.codigo
                where cliente.vendedor = '${User.id}' and inactivo = 0 and
                    (cliente.codigo like '%${x.search}%' or 
                    cliente.nombre like '%${x.search}%' or 
                    cliente.codigo like '%${x.search}%')
            ) as gg
                left join sales_cuadre on gg.codigo=sales_cuadre.cliente and coalesce(visita,'')<>''
            order by ${x.order} ${x.torder}
            limit ${x.limit}
            offset ${x.offset}
        `);
    };


    var ruta = $('#ruta').search('b_cliente');
    ruta.on('request', function (r) {
        r.forEach(function (x) {
            //x.documento=x.documento.substr(6)
            //console.log(x.fecha)

            if (x.fecha) x.dias = util.date_diff.inDays(new Date(x.fecha), new Date())
        })
    })
    ruta.on('detail', function (x) {

        cliente = x

        $('#modal_detalle').modal();
        $('#dt_nombre').html(x.nombre)
        $('#dt_codigo').html(x.codigo)
        $('#dt_telefono').html(`<i class="fa fa-phone"></i>  ${x.telefono}`)
        $('#dt_telefono').prop('href', 'tel:' + x.telefono)
        $('#dt_email').html(`<i class="fa fa-envelope"></i>`)
        $('#dt_email').prop('href', 'mailto:' + x.correo)
        $('#dt_ubicacion').html(`<i class="fa fa-map-marker"></i>  ${x.direccion}`)

    });

    $(document).ready(function () {
        $('.windowTitle').html(`<i class="fa fa-truck"></i> Mi Ruta`);
        $('#ordenes').addClass('active');
        $('[name=search]').focus();

    });



});
