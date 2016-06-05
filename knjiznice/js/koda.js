
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var string = "";//za izpis obvestil

/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {//pridobivanje trenutne seje
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function preberiEHRodBolnika() { //na podlagi EHR id-ja izpiše podatke iz baze
	var sessionId = getSessionId();
	var ehrId = $("#tehrid").val();
	if (!ehrId || ehrId.trim().length == 0) {
		console.log("prazno polje");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-success fade-in'>Bolnik '" + party.firstNames + " " +
          party.lastNames + "', ki se je rodil '" + party.dateOfBirth +
          "'.</span>");
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
		//locnica
		
		
		//locnica
	}
}

function temperaturaIzBazeBeri(ehrId, sessionId) {
    var meritve;
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/body_temperature",
        type: 'GET',
        async: false,
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            for (var i in res) {
                meritve = res;
            }
        }
    });
    return meritve;
}
function nasicenostKrviSKisikomBeri(ehrId,sessionId) {
	var nasicenost;
	var response = $.ajax({
        url: baseUrl + "/view/" + ehrId + "/spO2",
        type: 'GET',
        async: false,
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
        	console.log("Nasicenost je: "+res[0].spO2);
            for (var i in res) {
                nasicenost = res;
            }
        },
        error: function(err) {
        	console.log(err);
        }
    });
    console.log(response.responseJSON);
    return response;
}
function temeperaturaIzBazePisi(ehrId,sessionId) {
	var telesnaTemperatura = $("#ttelesnatemperatura").val();
	var nasicenostKrviSKisikom = $("#tnasicenostkrvi").val();
			$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
      // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT'
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        $("#dodajMeritveVitalnihZnakovSporocilo").html(
              "<span class='obvestilo label label-success fade-in'>" +
              res.meta.href + ".</span>");
              
		    },
		    error: function(err) {
		    	console.log("o neee :(");
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
}

/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */

 
function generateAll() {
	for (var stevec = 1; stevec <= 3; stevec++) {
		var trenutniId = generirajPodatke(stevec);
	}
}

function generirajPodatke(stPacienta) {//to pomeni piše v bazo
	var ehrId = "";
	var sessionId = getSessionId();
	var ime = "";
	var priimek = "";
	var datumRojstva = "";
	var telesnaTemperatura = "";
	var nasicenostKrvni = 0;
  switch (stPacienta) {
    case 1:
		ime = "Zelotko"
		priimek = "Bolan";
		datumRojstva = "1975-03-03T01:30";
		telesnaTemperatura = "39";
		nasicenostKrvni = 97;
		generirajZelotkota();
        break;
    case 2:
        ime = "Sportnik";
        priimek = "Bob";
        datumRojstva = "1975-03-03T01:30";
        telesnaTemperatura = "36";
        nasicenostKrvni = 99;
        generirajBoba();
        break;
    case 3:
        ime = "Micka";
        priimek = "Starina";
        datumRojstva = "1948-4-11T10:58";
        telesnaTemperatura = "37";
        nasicenostKrvni = 98;
        generirajMicko();
        break;
        
  }
$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                	console.log("uspešno "+ehrId);
							string += "<h5><br><span class='label label-default'>"+ehrId+"</span></h5>";
							$("#Ehrajdi").html(string);
		               $("#meritveVitalnihZnakovEHRid").val(ehrId);
		                }
		            },
		            error: function(err) {
		            	console.log("neuspešno "+JSON.parse(err.responseText).userMessage);
		            }
		        });
		        temeperaturaIzBazePisi(ehrId,sessionId);
		    }
		    
		});
		return ehrId;
		
}

function dodajMeritveTemperature(ehrId, sessionId) {
	sessionId = getSessionId();
	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
	var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();

	if (!ehrId || ehrId.trim().length == 0) {
		console.log("vnesi zahtevane podatke");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
      // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	console.log(res.meta.href);
		    },
		    error: function(err) {
		    	console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	}
}


function preberiEHRzapis() {
	var sessionId = getSessionId();
	var ehrId = $("#tehrid").val();
	if (!ehrId || ehrId.trim().length == 0) {
		console.log("vnesi zahtevan podatek");
	} else {
		var podatki
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
	    		
				var party = data.party;
				podatki = party;
				console.log("bolnik " +party.firstNames+" "+party.lastNames+" "+party.dateOfBirth);
				
				//izpolniTextbox(party.firstNames,party.lastNames,party.dateOfBirth,0,0);
			},
			error: function(err) {
				console.log("Branje sporočil ni bilo uspešno "+ JSON.parse(err.responseText).userMessage);
			}
		});
		//locnica
		var trenutnaTemperatura = 0;
		$.ajax({
  					    url: baseUrl + "/view/" + ehrId + "/" + "body_temperature",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var results = "<table class='table table-striped " +
                    "table-hover'><tr><th>Datum in ura</th>" +
                    "<th class='text-right'>Telesna temperatura</th></tr>";
						        for (var i in res) {
						        
						        	console.log("res je:"+res);
						            results += "<tr><td>" + res[i].time +
                          "</td><td class='text-right'>" + res[i].temperature;
            
            
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html(
                    "<span class='obvestilo label label-warning fade-in'>" +
                    "Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html(
                  "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                  JSON.parse(err.responseText).userMessage + "'!");
					    }
					});
					nasicenostKrviSKisikomBeri(ehrId,sessionId);
		
		//locnica
	}
}

//GENERIRANJE PODATKOV
function generirajZelotkota() {
	var ime = "Zelotko";
	var priimek = "Bolan";
	var datumRojstva = "1975-03-03T01:30";
	var telesnaTemperatura = "39";
	var nasicenostKrvni = 97;
	izpolniTextbox(ime,priimek,datumRojstva,telesnaTemperatura,nasicenostKrvni);
 }
 function generirajBoba() {
	var ime = "Sportnik";
	var priimek = "Bob";
	var datumRojstva = "1980-10-13T20:61";
	var telesnaTemperatura = "36";
	var nasicenostKrvni = 100;
	izpolniTextbox(ime,priimek,datumRojstva,telesnaTemperatura,nasicenostKrvni);
 }
 function generirajMicko() {
	var ime = "Micka";
	var priimek = "Starina";
	var datumRojstva = "1948-4-11T02:58";
	var telesnaTemperatura = "37";
	var nasicenostKrvni = 98;
	izpolniTextbox(ime,priimek,datumRojstva,telesnaTemperatura,nasicenostKrvni);
 }
function narisiKrivuljo() {
	
	new Chartist.Line('.ct-chart', {
  labels: [0,'27','40','50',60,95,100],
  series: [
    [0,50,75,89,97,92,97],
  ]
}, {
  fullWidth: true,
  chartPadding: {
    right: 40
  }
});
}
function narisiKoncentracijoKisika() {
	var vred = $("#tnasicenostkrvi").val();
	narisiCoolKrivuljo(vred);
}
function narisiCoolKrivuljo(procentiKisika) {
var chart = new Chartist.Pie('.cxx-chart', 
    {
        series: [procentiKisika],
        labels: ['', '']
    }, {
        donut: true,
        donutWidth: 190,
        startAngle: 210,
        total: 100,
        showLabel: false,
        plugins: [
            Chartist.plugins.fillDonut({
                items: [{
                    content: '<i class="fa fa-tachometer"></i>',
                    position: 'bottom',
                    offsetY : 10,
                    offsetX: -2
                }, {
                    content: '<h3>'+procentiKisika+'<span class="small">%kisika v krvi</span></h3>'
                }]
            })
        ],
    });

chart.on('draw', function(data) {
    if(data.type === 'slice' && data.index == 0) {
        // Get the total path length in order to use for dash array animation
        var pathLength = data.element._node.getTotalLength();

        // Set a dasharray that matches the path length as prerequisite to animate dashoffset
        data.element.attr({
            'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
        });

        // Create animation definition while also assigning an ID to the animation for later sync usage
        var animationDefinition = {
            'stroke-dashoffset': {
                id: 'anim' + data.index,
                dur: 1200,
                from: -pathLength + 'px',
                to:  '0px',
                easing: Chartist.Svg.Easing.easeOutQuint,
                fill: 'freeze'
            }
        };

        // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
        data.element.attr({
            'stroke-dashoffset': -pathLength + 'px'
        });

        // We can't use guided mode as the animations need to rely on setting begin manually
        // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
        data.element.animate(animationDefinition, true);
    }
});
}
 function izpolniTextbox(ime,priimek,datumRojstva,telesnaTemperatura,nasicenostKrvni) {
    		$("#time").val(ime);
            $("#tpriimek").val(priimek);
            $("#tdatumrojstva").val(datumRojstva);
            $("#ttelesnatemperatura").val(telesnaTemperatura);
            $("#tnasicenostkrvi").val(nasicenostKrvni);
 }
// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
$( document ).ready(function() {
 narisiKrivuljo();
 
// Create a new line chart object where as first parameter we pass in a selector
// that is resolving to our chart container element. The Second parameter
// is the actual data object. As a third parameter we pass in our custom options.

});
