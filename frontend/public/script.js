const websiteURL = window.location.origin; // använd dena variabel för websidans-URL, representerar localhost OCH serverlänken

document.getElementById("createGameButton").addEventListener("click", function() { 
    window.location.href = `${websiteURL}/create`
});
document.getElementById("joinGameButton").addEventListener("click", function() { 
    window.location.href = `${websiteURL}/join`
});