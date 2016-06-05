
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}
function temperaturaIzBaze(ehrId, sessionId) {
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
function preberiEHRodBolnika() {
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
		var tempera;
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/body_temperature",
        type: 'GET',
        async: false,
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            for (var i in res) {
                tempera = res;
            }
            
        }
        
    });
   
    return tempera;
	}
}

/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
 function izpolniTextbox(ime,priimek,datumRojstva,telesnaTemperatura,nasicenostKrvni) {
    		$("#time").val(ime);
            $("#tpriimek").val(priimek);
            $("#tdatumrojstva").val(datumRojstva);
            $("#ttelesnatemperatura").val(telesnaTemperatura);
            $("#tnasicenostkrvi").val(nasicenostKrvni);
 }
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
 var string = "";
function generateAll() {
	
	for (var stevec = 1; stevec <= 3; stevec++) {
		var trenutniId = generirajPodatke(stevec);
//		string += "<h3><span class='label label-default'>"+trenutniId+"</span></h3><br>";
	//	console.log("AJS: "+trenutniId);
	}
//$("#Ehrajdi").html(string);
	//----------------------------------------------------------------------------->fix
	
	

/*	 $("#tpriimek").val("");
            $("#tdatumrojstva").val("");
            $("#ttelesnatemperatura").val("");
            $("#tnasicenostkrvi").val("");*/
}

function generirajPodatke(stPacienta) {
	ehrId = "";
	sessionId = getSessionId();
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
		    }
		    
		});
		                return ehrId;
		
}


    
function preberiEHRzapis() {
	sessionId = getSessionId();

	var ehrId = $("#tehrid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		console.log("vnesi zahtevan podatek");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				console.log("bolnik " +party.firstNames+" "+party.lastNames+" "+party.dateOfBirth);
				izpolniTextbox(party.firstNames,party.lastNames,party.dateOfBirth,0,0);
			},
			error: function(err) {
				console.log("Branje sporočil ni bilo uspešno "+ JSON.parse(err.responseText).userMessage);
			}
		});
	}
}



//GENERIRANJE PODATKOV

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
// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
$( document ).ready(function() {
 narisiKrivuljo();
// Create a new line chart object where as first parameter we pass in a selector
// that is resolving to our chart container element. The Second parameter
// is the actual data object. As a third parameter we pass in our custom options.

});
