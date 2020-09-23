$(document).ready(function () {
    var x = localStorage.getItem('User')
    x=JSON.parse(x)
    var version='20.09.22'

    var today = new Date();
    var yyyy = today.getFullYear();
    
    setTimeout(function() {
        $('.user_display').html(x.nombre) 
        $('.version_app').html(version)  
        $('.currentYear').html(yyyy)

        
    }, 100);

    $('input[type=number]').attr('min',0).val(0).click(function () {
        this.select()
    })



    $(document).on('click', '#btn_sync', function(){
        location.assign('sync.html')    
    })

 
    
	$(`

        <script>
            $(document).ready(function () {
                $('#fechasync').html(localStorage.getItem('sync_update'))

                $('#sidebar').mCustomScrollbar({
                    theme: 'minimal',
                    scrollInertia: 300
                });

                $('#dismiss, .overlay').click(function () {
                    $('.overlay').hide();
                    $('#sidebar').removeClass('active');
                    $('#bars').show(400);
                });

                $('#sidebarCollapse').click(function () {
                    $('#sidebar').addClass('active');
                    $('#bars').hide(500);
                    $('.overlay').fadeIn('fast');                    
                });

                $('#logoutButton').click(function(){
                    $('#dismiss').trigger('click');
                    $('#logoutConfirm').modal();
                });

                $('#content').css('background','#f5f5f5b8')

                
            });
        </script>
	    
        <nav id="sidebar">

	        <div id="dismiss">
	            <i class="fa fa-arrow-left"></i>
            </div>
            
            <img src="img/menuHeader.jpg" style="width: 100%;">

            <div style="padding: 10px; margin-top: 10px;">
                <span class="user_display" style="font-size: 20px; font-weight: 500;"></span>
            </div>

            <hr style="margin-top: 10px;">

	        <ul class="list-unstyled components">
	            <li id='main'>
	                <a href="main.html"><i class="fa fa-circle"></i> Dashboard</a>
	            </li>
	            <li id='ordenes'>
	                <a href="ordenes.html"><i class="fa fa-truck"></i> Mi Ruta</a>
	            </li>
	            
                <li id='misordenes'>
	                <a href="mis_ordenes.html"><i class="fa fa-file-text-o"></i> Mis Ordenes</a>
	            </li>
                <!-- <li id='miscobros'>
                     <a href="cobros.html"><i class="fa fa-file-o"></i> Mis Cobros</a>
                </li> -->
	        </ul>

            
            <hr style="margin-bottom: -3px;">
            <ul class="list-unstyled">
                
                <li>
                    <a style="cursor: pointer;" onclick="$('#aboutModal').modal()"">acerca de</a>
                </li>
                <li>
                    <a id="logoutButton" style="cursor: pointer; color: #d43f3a;"><i class="fa fa-sign-out"></i> Cerrar sesión</a>
                </li>
            </ul>            
            <br>
            <br class="visible-xs visible-sm">
            <br class="visible-xs visible-sm">

	    </nav>

        <!-- Modal Cerrar sesion-->
        <div id="logoutConfirm" class="modal fade" role="dialog">
            <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-body">
                  	<h4 class="modal-title"><i class="fa fa-home"></i> Chalona Software</h4>
                    <br>
                    <p>Desea cerrar sesión?</p>
                  </div>
                  <div class="modal-footer">
                    <a type="button" class="btn btn-danger" data-dismiss="modal" onclick="logout()" style="width: 130px; font-weight: 600;">Salir</a>
                    <a type="button" class="btn btn-default" data-dismiss="modal">Cancelar</a>
                  </div>
                </div>
            </div>
        </div>




        <!-- Modal Acerca de-->
        <div id="aboutModal" class="modal fade" role="dialog">
          <div class="modal-dialog">

            <!-- Modal content-->
            <div class="modal-content">

              <div class="modal-body">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                
                <div class='row'>
                    <div class='col-xs-1'></div>
                    <div class='col-xs-10'>
                        <p>Version <span class='version_app'></span></p>
                        <br>
                        <span style='color: gray;'><b>Chalona Sales</b> es un producto tipo software desarrollado por la empresa</span>
                        <br><br>
                        <img src='./img/ChalonaBlue.svg' style='width: 180px;' >
                        <br><br>
                        <span style='color: gray;'>® <span class='currentYear'></span> Todos los Derechos Reservados</span>
                        <br>
                        <br>
                        <br>                    
                    </div>
                </div>
                
                


              </div>
            </div>

          </div>
        </div>        

	`).insertBefore("#content");

    $(`
        <div id="navBarra" class="row" style="
            background: #FAFAFA;
            color: #424242;
            height: 60px; margin: -20px; ">
            
            <div class="col-xs-2" style="margin-top: 15px;">   
                    <span id="sidebarCollapse" style="cursor: pointer; margin-left: 6px; font-size: 24px; ">  <i id="bars" class="fa fa-bars"> </i> </span>
            </div>

            <div class="col-xs-8">
                <h2 class="hidden-xs hidden-sm windowTitle" style="margin-top: 15px;"></h2>
                <h3 class="visible-sm windowTitle" ></h3>
                <h3 class="visible-xs windowTitle" style="font-size: 22px;"></h3>                    
            </div>            

            <div class="col-xs-2 pull-right"> 
                    <h3 class="sync visible-xs" style="color: #D81B60; float: right; font-size: 20px;">
                        <i class="fa fa-circle"></i>
                    </h3>   
                    <span class="hidden-xs hidden-sm" style="margin-top: 20px; font-size: 15px; float: right;">Versión <span class='version_app'></span></span>
                    <span class="visible-sm" style="font-size: 15px; float: right;"><span class='version_app'></span></span>
            </div>               
            
        </div>
        <br><br><br>
    `).insertAfter('#enviroment')
	
})
	