const websiteURL = window.location; // använd dena variabel för websidans-URL

document.getElementById("createGameButton").addEventListener("click", function() { 
    window.location.href = `${websiteURL}create`
});
document.getElementById("joinGameButton").addEventListener("click", function() { 
    window.location.href = `${websiteURL}join`
});