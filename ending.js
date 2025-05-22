// Récupération des éléments avec du contenu variable
const scorePlayer = document.getElementById("score-final__count");
const scoreTotal = document.getElementById("score-final__total");
const gamesFound = document.getElementById("games-found__count");
const gamesTotal = document.getElementById("games-found__total");
const timeline = document.getElementById("timeline");

window.addEventListener('load', () => {
  let session = Object.keys(sessionStorage).reduce(function (session, key) {
    session[key] = sessionStorage.getItem(key);
    return session;
  }, {});

  console.log(session);
  console.log(Object.keys(session).length);
  console.log(session.hasOwnProperty("history"));
  // console.log(JSON.parse(session.history));

  if (
    Object.keys(session).length > 0 && 
    session.hasOwnProperty("history")
  ) {
    console.log("Recap game");

    // Remplissage de la timeline
    JSON.parse(session.history).forEach((element, index) => {
      console.log(element);
      
      let step = document.createElement("span");
      let stepNumber = index + 1;
      step.classList.add('round');
      if (element == true) {
        step.classList.add('win');
      }
  
      step.innerText = stepNumber.toString().padStart(2, '0');
      timeline.appendChild(step);
    });
  } else {
    window.location.href = "/";
  }
  

});
