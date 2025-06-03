const logoXOffsets = ['-2.1vw', '-15.6vw', '-29.2vw', '-42.7vw', '-56.3vw'];
const logoSize = '72.9vw';
const logoYOffset = '39.6%';

let teamNames = [];
 
$(document).ready(() => {
  // Get results div
const resultsDiv = $(".split-container");

resultsDiv.append(`
  <div class='split-container'>
    <div class='results-header' id='resultsHeader'>
      -
    </div>
    <table class='results-table'>
      <tr class="results-item" id="nameRow"></tr>
      <tr class="results-item" id="groupRow"></tr>
      <tr class="results-item" id="resultRow"></tr>
    </table>
  </div>
`);


  // Get json
  fetch("../data.json")
    .then((response) => response.json())
    .then((jsonData) => {
      teamNames = Object.keys(jsonData.Teams);

      const seasonsPriority = ["winter", "summer", "spring"];

      let newestSplitsFromAllTeams = [];

      // gehe durch alle Teams
      for (let h = 0; h < teamNames.length; h++) {
        const teamName = teamNames[h];

        // alle Split-Namen des aktuellen Teams
        let teamResults = Object.keys(jsonData.Teams[teamName].Results);

        // finde das aktuellste Jahr (letzte 2 Zeichen)
        let newestSplitYear = 0;
        for (let i = 0; i < teamResults.length; i++) {
          const year = parseInt(teamResults[i].slice(-2), 10);
          if (year > newestSplitYear) {
            newestSplitYear = year;
          }
        }

        // alle Splits mit dem neuesten Jahr filtern
        const allNewestTeamSplits = teamResults.filter(str => {
          return parseInt(str.slice(-2), 10) === newestSplitYear;
        });

        // Finde den aktuellsten Split anhand Season-Priorität
        let foundSplit;
        for (const season of seasonsPriority) {
          foundSplit = allNewestTeamSplits.find(s => s.includes(season));
          if (foundSplit) break;
        }

        // Nur hinzufügen, wenn ein gültiger Split gefunden wurde
        if (foundSplit) {
          newestSplitsFromAllTeams.push(foundSplit);
        }
      }

      // Filtere undefined aus, falls vorhanden (Sicherheitshalber)
      const validSplits = newestSplitsFromAllTeams.filter(split => split !== undefined);

      // finde das größte Jahr aus allen gefundenen Splits
      let overallNewestYear = 0;
      for (let split of validSplits) {
        const year = parseInt(split.slice(-2), 10);
        if (year > overallNewestYear) {
          overallNewestYear = year;
        }
      }

      // filtere nur Splits mit dem overallNewestYear
      const splitsWithNewestYear = validSplits.filter(split => {
        return parseInt(split.slice(-2), 10) === overallNewestYear;
      });

      // finde den overall aktuellsten Split anhand Season-Priorität
      let overallNewestSplit;
      for (const season of seasonsPriority) {
        overallNewestSplit = splitsWithNewestYear.find(s => s.includes(season));
        if (overallNewestSplit) break;
      }

      console.log("Der insgesamt aktuellste Split ist:", overallNewestSplit);


      // Tabelle bauen:
      // header
       $("#resultsHeader").text(overallNewestSplit);

      // gehe durch alle teams
      for (let j = 0; j < teamNames.length; j++) {
        const team = teamNames[j];
        const jsonTeam = jsonData.Teams[team];
        console.log("team",team);
       
        // aktuellster split existiert in team
        if (jsonTeam.Results[overallNewestSplit]) {
          // fülle tabelle mit inhalt
          const resultData = jsonTeam.Results[overallNewestSplit];
          const group = resultData.groupphase.group;
          const result = resultData.groupphase.result;
         
         $("#nameRow").append(`<td class="results-item-content">${team.toUpperCase()}</td>`);
         $("#groupRow").append(`<td class="results-item-content">Gruppe ${group}</td>`);
         $("#resultRow").append(`<td class="results-item-content">${result}</td>`);

        }
        // aktuellster split exisitert nicht in team
        else {
          // fülle tabelle mit "-"
         $("#nameRow").append(`<td class="results-item-content">${team.toUpperCase()}</td>`);
         $("#groupRow").append(`<td class="results-item-content">-</td>`);
         $("#resultRow").append(`<td class="results-item-content">-</td>`);

        }
      }

      for (let i = 0; i < teamNames.length; i++) {
        const team = teamNames[i];

        // Decide if first/last element or not
        let borderRadius = "0px 0px 0px 0px";
        if (i === 0) {
          borderRadius = "20px 0px 0px 20px";
        } else if (i === teamNames.length - 1) {
          borderRadius = "0px 20px 20px 0px";
        }

        // Add team div
        const offsetX = logoXOffsets[i] || 0;

        const teamsDiv = $("#teamSelection");
        const logoPath = `../media/Logos/${team.toUpperCase()}_Logo_full_clear_white_fade.png`;
        teamsDiv.append(`
                    <a id="${team}Item" 
                    class="gridItem"
                    href="../desktop/team.html?name=${team}"
                    data-team="${team}" 
                    data-index="${i}" 
                    onmouseover="gridItem(this)"
                    onmouseleave="gridReset()"
                    style="max-height: 35vh; border-radius: ${borderRadius}; background-image: url('${logoPath}'); background-size: ${logoSize}; background-position: ${offsetX} ${logoYOffset}; display: flex; justify-content: center; align-items: flex-end; color: white; text-decoration: none; text-align: center; padding-bottom: 10%;">
                    ${team.toUpperCase()}</a>
    `);
      }
    })
    .catch((error) => console.error("JSON loading error: ", error));
});

function gridItem(element) {
  // console.log("Mouse hover");
  const hoveredTeam = $(element).data("team");
  const logoPath = `../media/Logos/${hoveredTeam.toUpperCase()}_Logo_full_clear_white_fade.png`;

  const allGridItems = $(".gridItem");

  for (const item of allGridItems) {
    const index = $(item).data("index");
    const offsetX = logoXOffsets[index] || 0;
    const offsetY = logoYOffset;

    $(item).css({
      "background-image": `url(${logoPath})`,
      "background-size": `${logoSize}px`,
      "background-position": `${offsetX}px ${offsetY}px`,
    });
  }
}

function gridReset() {
  // console.log("Mouse leave");
  for (const team of teamNames) {
    const logoPath = `../media/Logos/${team.toUpperCase()}_Logo_full_clear_white_fade.png`;
    $(`#${team}Item`).css({
      "background-image": `url(${logoPath})`,
    });
  }
}
