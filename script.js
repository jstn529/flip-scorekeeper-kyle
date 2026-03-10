
let leftScore = 0
let rightScore = 0

function flipCard(card){

card.classList.add("flip")

setTimeout(()=>{

card.classList.remove("flip")

},600)

}


function changeScore(side,amount){

if(side==="left"){

leftScore += amount

if(leftScore<0) leftScore=0

updateCard("leftCard",leftScore)

}

else{

rightScore += amount

if(rightScore<0) rightScore=0

updateCard("rightCard",rightScore)

}

}


function updateCard(id,value){

const card=document.getElementById(id)

card.querySelector(".top").textContent=value

card.querySelector(".bottom").textContent=value

flipCard(card)

}


function resetScore(){

leftScore=0
rightScore=0

updateCard("leftCard",0)
updateCard("rightCard",0)

}


function swap(){

let temp=leftScore

leftScore=rightScore
rightScore=temp

updateCard("leftCard",leftScore)
updateCard("rightCard",rightScore)

}