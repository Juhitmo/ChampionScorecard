var info = [];
var role = 'All';
var apiLink = "http://api.champion.gg/stats/champs/mostPlayed?api_key=5be56cec7bc8ef0457af4b3f94ea6f21&page=1&limit=1000";

function getData(){
    info = [];

    $.ajax({
        url: apiLink,
        method: "GET",
        dataType: "json",
        success: function(data){
            for(var x = 0; x < data.data.length; x++){
                //info[data.data[x].key] = [{
                info.push({
                    key : data.data[x].key,
                    name : data.data[x].name,
                    role : data.data[x].role,
                    kills : data.data[x].general.kills,
                    deaths : data.data[x].general.deaths,
                    assists : data.data[x].general.assists,
                    winPercent : data.data[x].general.winPercent,
                    banPercent : data.data[x].general.banRate,
                    playPercent : data.data[x].general.playPercent,
                    damageDealt : data.data[x].general.totalDamageDealtToChampions,
                    damageTaken : data.data[x].general.totalDamageTaken,
                    totalHeal : data.data[x].general.totalHeal
                });
            }
        },
        error: function( jqxhr, status, error ){
            alert( "Something went wrong!");
        },
        complete: function(){
            createRows();
        }
    });
}

function createRows(){
    document.getElementById("leaderRows").innerHTML = "";
    var buildRows = "";
    var y = 0; //champ view counter

    for(var x = 0; x < info.length && y < 10; x++){
        if(role == 'All' || role == info[x].role){
            buildRows += "<div id='"+info[x].key+info[x].role+"' class='scoreRow'>";
                buildRows += "<div id='"+info[x].key+"' class='champPic'>";
                    buildRows += "<img src='http://ddragon.leagueoflegends.com/cdn/6.24.1/img/champion/"+info[x].key+".png' alt='"+info[x].key+"'></img>";
                buildRows += "</div>";
                buildRows += (x+1)+" - "+info[x].name+"<div class='indicator' style=''></div>";
            buildRows += "</div>";
            y++;
        }
    }
    document.getElementById("leaderRows").innerHTML = buildRows;

    $( document ).ready(function() {
        $('.scoreRow').click(function() {
            if($(this).hasClass('Chosen')){
                $('.scoreRow').removeClass("Chosen");
                hidePanel(this);
            } else {
                $('.scoreRow').removeClass("Chosen");
                $(this).addClass("Chosen");
                showPanel(this);
            }
        });
    });
}

function showPanel(selected){
    //var chosen = $('.Chosen').html();
    var chosen = $('.Chosen').attr('id');
    var playRate, winRate, banRate, kills, deaths, assists, dealt, taken, healed = 0;

    buildPanel = "";
    $('#dataPanel').css('display','inline-block');
    //document.getElementById("dataPanel").innerHTML = chosen;
    for(var x = 0; x < info.length; x++){
        if(info[x].key+info[x].role == chosen){
            $('#dataPanel').css('background-image',"url('http://ddragon.leagueoflegends.com/cdn/img/champion/splash/"+info[x].key+"_0.jpg')");
            //buildPanel += "<div id='dataPic'><img src='http://ddragon.leagueoflegends.com/cdn/6.24.1/img/champion/"+info[x].key+".png'></div>";
             buildPanel += "<div id='dataContainer'>";   
                buildPanel += "<div id='dataHeader'>";
                    buildPanel += "<h1 id='panelChar'>"+info[x].name+"</h1>";
                    buildPanel += "<h2 id='panelRole'>"+info[x].role+"</h2>";
                buildPanel += "</div>";
                buildPanel += "<div id='KDATable'>";
                    buildPanel += "<div class='infoRow'>";
                        buildPanel += "<div class='infoCell Title'>Average KDA</div>";
                        buildPanel += "<div class='infoCell Title'>Damage Spectrum</div>";
                    buildPanel += "</div>";
                    buildPanel += "<div class='infoRow'>";
                        buildPanel += "<div id='KDA' class='canvasCont'>";
                            buildPanel += "<canvas id='KDAChart' width='225' height='200' style='display: inline-block;'></canvas>";
                        buildPanel += "</div>";
                        buildPanel += "<div id='damage' class='canvasCont'>";
                            buildPanel += "<canvas id='damageChart' width='225' height='200' style='display: inline-block;'></canvas>";
                        buildPanel += "</div>";
                    buildPanel += "</div>";
                buildPanel += "</div>"
                buildPanel += "<div id='RateTable'>";
                    buildPanel += "<div id='percTitle'>";
                        buildPanel += "<div class='infoCell Title'>Play Rate</div>";
                        buildPanel += "<div class='infoCell Title'>Win Rate</div>";
                        buildPanel += "<div class='infoCell Title'>Ban Rate</div>";
                    buildPanel += "</div>";
                    buildPanel += "<div id='percRow'>";
                        buildPanel += "<div id='play' class='canvasCont'>";
                            buildPanel += "<canvas id='playChart' width='150' height='150' style='display: inline-block;'></canvas>";
                        buildPanel += "</div>";
                        buildPanel += "<div id='win' class='canvasCont'>";
                            buildPanel += "<canvas id='winChart' width='150' height='150' style='display: inline-block;'></canvas>";
                        buildPanel += " </div>";
                        buildPanel += "<div id='ban' class='canvasCont'>";
                            buildPanel += "<canvas id='banChart' width='150' height='150' style='display: inline-block;'></canvas>";
                        buildPanel += "</div>";
                    buildPanel += "</div>";
                buildPanel += "<div>";
            buildPanel += "<div>";

            //save matched variables for selected champ to display on data
            kills = info[x].kills;
            deaths = info[x].deaths;
            assists = info[x].assists;
            dealt = info[x].damageDealt;
            taken = info[x].damageTaken;
            healed = info[x].totalHeal;
            playRate = info[x].playPercent;
            winRate = info[x].winPercent;
            banRate = info[x].banPercent;
            
        }
    }

    document.getElementById("dataPanel").innerHTML = buildPanel;
    createPolarChart(getPolarData(kills,deaths,assists));
    createRadarChart(getRadarData(taken,dealt,healed));
    createDonutChart(getDonutData(playRate),'play');
    createDonutChart(getDonutData(winRate),'win');
    createDonutChart(getDonutData(banRate),'ban');
}

function getDonutData(rate){
  var leftover = 100 - rate;

  var data = {
      labels: [
          "Win Rate",
          "Games"
      ],
      datasets: [
          {
              data: [rate, leftover],
              backgroundColor: [
                  "#519D9E",
                  "#eee"
              ]
          }]
  };
  return data;
}

function createDonutChart(data, id){
  //activate chart.js
  var ctx = document.getElementById(id+"Chart");
    //use data and options
    var playPerc = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
          //options defined
          responsive: false,
          cutoutPercentage: 85,
          legend: false,
          layout: {padding: 15},
          tooltips: {enabled: false},
          elements: {arc: { borderWidth: 0}},
          animation: {onComplete: function() {
              document.getElementById(id).insertAdjacentHTML('beforeend',"<h4>"+data.datasets[0].data[0]+"%</h4>");
            }
          }
        }
    });
}

function getPolarData(K, D, A){

  var data = {
      labels: [
          "Assists",
          "Deaths",
          "Kills"
      ],
      datasets: [
          {
              data: [A, D, K],
              backgroundColor: [
                  "#8dc4c4",
                  "#519D9E",
                  "#36696a"
              ]
          }]
  };
  return data;
}

function createPolarChart(data){
  //activate chart.js
    var ctx = document.getElementById("KDAChart");
    //use data and options
    var KDAChart = new Chart(ctx, {
      type: 'polarArea',
      data: data,
      options: {
          //options defined
          responsive: false,
          legend: {
            //display: false,
            reverse: true,
            labels: {
              fontFamily: "'Raleway'",
              fontSize: 14,
              fontColor: "#eee",
              boxWidth: 15
            },
          },
          elements: { arc: {borderWidth: 0}},
          scale: {display: false}, 
          maintainAspectRatio: false,
       }
    })
}

function getRadarData(Taken, Dealt, Healed){
  var data = {
    labels: ["Dealt","Taken","Healed"],
    datasets: [
        {
          data: [Dealt,Taken,Healed],
          backgroundColor: ["rgba(81, 157, 158,.6)"],
          borderColor: ["#519D9E"],
          pointBackgroundColor: ["#519D9E","#519D9E","#519D9E"],
          pointBorderColor: ["#519D9E","#519D9E","#519D9E"]
        }
    ]
  };
  return data;
}

function createRadarChart(data){
    //activate chart.js
    var ctx = document.getElementById("damageChart");
    //use data and options
    var myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
            layout: {padding: 10},
            responsive: false,
            legend: {display: false},
            maintainAspectRatio: false,
            scale: { 
              pointLabels: {
                fontFamily: "'Raleway'",
                fontColor: "#eee",
                fontSize: 14
              },
              angleLines: {
                color: "#eee",
                lineWidth: 2
              },
              gridLines: {display: false},
              ticks: {
                  display: false,
                  beginAtZero: true,
              }
            }
        }
    });
}

function hidePanel(selected){
    var chosen = $('.Chosen').html();
    $('#dataPanel').css('display','none');
}

function setView(selection){
    $('#dataPanel').css('display','none');
    $(".view").removeClass("active");

    if(selection == 'Play')
    {
        $("#playView").addClass("active");
        apiLink = "http://api.champion.gg/stats/champs/mostPlayed?api_key=5be56cec7bc8ef0457af4b3f94ea6f21&page=1&limit=1000";

    } else if (selection == 'Win')
    {
        $("#winView").addClass("active");
        apiLink = "http://api.champion.gg/stats/champs/mostWinning?api_key=5be56cec7bc8ef0457af4b3f94ea6f21&page=1&limit=1000";

    } else
    {
        $("#banView").addClass("active");
        apiLink = "http://api.champion.gg/stats/champs/mostBanned?api_key=5be56cec7bc8ef0457af4b3f94ea6f21&page=1&limit=1000";
    }
    
    getData();
}

function setFilt(selection){
    $('#dataPanel').css('display','none');
    $(".filt").removeClass("active");

    if(selection == 'Top')
    {
        $("#topFilt").addClass("active");
        role = "Top";
    } 
    else if (selection == 'Mid')
    {
        $("#midFilt").addClass("active");
        role = "Middle";
    } 
    else if (selection == 'ADC')
    {
        $("#adcFilt").addClass("active");
        role = "ADC";
    }
    else if (selection == 'Sup')
    {
        $("#supFilt").addClass("active");
        role = "Support";
    }
    else if (selection == 'Jun')
    {
        $("#junFilt").addClass("active");
        role = "Jungle";
    } 
    else
    {
        $("#allFilt").addClass("active");
        role = 'All';
    }
    
    getData();
}

