/*Author: edughs*/


//VARIABLES GLOBALES

//creamos socket

var socket = io();

var url_imagen = "";

var hora = "";

var hora_pausa;

//FUNCION CARGAR IMAGEN
$(function() {
	$("#uploadFile").on("change", function()
	{
		var files = !!this.files ? this.files : [];
		if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support

			if (/^image/.test( files[0].type)){ // only image file
			    var reader = new FileReader(); // instance of the FileReader
			    reader.readAsDataURL(files[0]); // read the local file

			    reader.onloadend = function(){ // set image data as background of div
			    $("#imagePreview").css("background-image", "url("+this.result+")");
			    url_imagen = this.result;
			}
		}
	});
});


//FUNCION CONVERTIR FECHA AL FORMATO NECESITADO

function convertirFecha(fecha) {
   var f = new Date(fecha);
   var yyyy = f.getFullYear().toString();
   var mm = (f.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = f.getDate().toString();
   var h = f.getHours().toString();
   var m = f.getMinutes().toString();
   var s = f.getSeconds().toString();

   return yyyy + '/' + mm + '/' + dd + ' ' + h + ':' + m + ':' + s ;

}
/*------------------------ENVIOS---------------------*/

//ENVIO ACCIONES CONTADOR

function StartClock(){
  	var horas = $('#horas').val();
	var minutos = $('#minutos').val();
	var segundos = $('#segundos').val();
	//alert(horas + ' ' + minutos + ' ' + segundos);

    if(socket.emit('clock', {
      	op: 'start',
      	h: horas, 
      	m: minutos,
      	s: segundos
    })) 
    alert("enviar start");
       
}
function StopClock(){
    if(socket.emit('clock', {
      	op: 'stop'
    })) 
    alert("enviar stop");
}

function ResumeClock(){
    if(socket.emit('clock', {
      	op: 'resume'
    })) 
    alert("enviar resume");
}

//ENVIO DE IMAGEN

$('#enviar_imagen').on("click", function(){
	var segundos = $('#imgsegundos').val();
	console.log(url_imagen);
	socket.emit('imgurl', {
      	seg: segundos,
      	url: url_imagen
    }); 
});


//ENVIO DE PISTAS 

if (num_pista==null){
	var num_pista = 1;
}
$("#form_pistas").submit(function(){
    //alert("num_pista");
    if(num_pista>3){
    	alert("No se pueden dar más pistas");
    }
    else{
    	var mensaje = $("#msj_enviar").val();
    	console.log("el mensaje es:" + mensaje);
	  	switch(num_pista) {
		    case 1:	
		    	$('#pista1 img').attr("src", "../img/lens_off.png");	    	
		    	socket.emit('pista', {
      				numero: 1,
      				msj: mensaje
    			});
		        
		        break;
		    case 2:
		    	$('#pista2 img').attr("src", "../img/lens_off.png");
		        socket.emit('pista', {
      				numero: 2,
      				msj: mensaje
    			});

		        break;
		    case 3:
		    	$('#pista3 img').attr("src", "../img/lens_off.png");
		        socket.emit('pista', {
      				numero: 3,
      				msj: mensaje
    			});

		        break;
		    default:	        
		        alert("error, num pistas entero");
		}  	
	  	if(num_pista<4)  		
	  	{
	  		num_pista++;
	  	}
	  	//alert(num_pista);
    }
    
  	event.preventDefault(); //Para evitar la acción por defecto del formulario
});

/*------------------------RECEPCIÓN-------------------------*/

//evento para escuchar el cambio de estado del reloj

socket.on('clockstatus', function (data) {

	    console.log(data);
	    switch(data.op) {
	    	case 'started':
	    		//alert("recibido clockstatus started");
	    		//$('div').css('background-color', 'red');
	    		console.log("recibido clockstatus started");

	    		var actual = Date.now();
	    		//var actual_f = convertirFecha(actual);//.prototype.miformato;//convertDate(actual);
	    		//alert( "actual " + actual_f);

	    		//Pasamos las h, min y seg a ms

	    		var hor = data.h * 60 * 60 * 1000; 
	    		var min = data.m * 60 * 1000;
	    		var seg = data.s * 1000;
	    		
	    		var suma = actual + hor + min + seg;	    		

	    		var deadline = new Date(suma);//(actual + hor + min + seg);
	    		
	    		var deadline_f = convertirFecha(deadline);

		        $('.clock').countdown(deadline_f, function(event) {
				   $(this).html(event.strftime('%H:%M:%S'));
				});
				break;

			case 'stopped':
				console.log("recibido clockstatus stopped");
	        	$('.clock').countdown('stop');	
	        	hora_pausa = $('.clock').text();
	        	alert("HORA PAUSA: " + hora_pausa);

	        	var f = new Date();
				var yyyy = f.getFullYear().toString();
				var mm = (f.getMonth()+1).toString(); // getMonth() is zero-based
				var dd  = f.getDate().toString();

				hora = yyyy + '/' + mm + '/' + dd + ' ' + hora_pausa;

				console.log(hora);		
	        	
	        	break;

	        case 'resumed':
	        	console.log("recibido clockstatus resumed");

    			hours = hora_pausa.split(':')[0] * 60 * 60 * 1000;
    			minutes = hora_pausa.split(':')[1] * 60 * 1000;
    			seconds = hora_pausa.split(':')[2].split(' ')[0] * 1000;

    			var hora = Date.now();
    			var hora_final = hora + hours + minutes + seconds;

	        	var deadline = new Date(hora_final);

	    		var deadline_f = convertirFecha(deadline);

		        $('.clock').countdown(deadline_f, function(event) {
				   $(this).html(event.strftime('%H:%M:%S'));
				});
	        	
	        	break;	

	        default:
	        	break;
	    }
	    
});

//Evento para recibir y cambiar las pìstas

socket.on('infopista', function (data) {

    console.log("infopista recibida");

    switch(data.numero) {
      case 1:
      	console.log("infopista 1");
        var pista = document.getElementById("msj_pista1");
        $('#pista1 img').attr("src", "../img/lens_off.png");
		pista.innerHTML = data.msj;
        break;
      case 2:
      console.log("infopista 2");
        var pista = document.getElementById("msj_pista2");
        $('#pista2 img').attr("src", "../img/lens_off.png");
		pista.innerHTML = data.msj;
        break;
      case 3:
      console.log("infopista 3");
        var pista = document.getElementById("msj_pista3");
        $('#pista3 img').attr("src", "../img/lens_off.png");
		pista.innerHTML = data.msj;
        break;
      default:
        console.log("error");
        break;
    }
    
});

//Evento para recibir la imagen 

socket.on('imgurlstatus', function (data) {
	
	console.log(data.seg);
	console.log("imgurlstatus recibida");

    $('#timer').hide();
    $('#imgpantalla').empty();
    $('#imgpantalla').attr('src', data.url);

	setTimeout(function() {
		$('#imgpantalla').attr('src', "");
    	$('#timer').show();    	
	}, data.seg*1000);
	
    

});










