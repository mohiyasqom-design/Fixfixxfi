const letters=["ا","ب","پ","ت","ث","ج","چ","ح","خ","د","ذ","ر","ز","ژ","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ک","گ","ل","م","ن","و","ه","ی"];
let fallingSpeed=1.5, spawnRate=1800, score=0, highScore=localStorage.getItem("highscore")||0;
let lives=3;
const gameArea=document.getElementById("gameArea"), scoreBox=document.getElementById("score"), livesBox=document.getElementById("lives"), explodeSound=document.getElementById("explodeSound");
let activeLetters=[], gameInterval, spawnInterval;

window.onload=function(){
document.getElementById("highScoreBox").textContent="بالاترین امتیاز: "+highScore;
const kb=document.getElementById("mobileKeyboard");
letters.forEach(l=>{
    const btn=document.createElement("button");
    btn.className="keyBtn";
    btn.textContent=l;
    btn.onclick=()=>checkTyped(l);
    kb.appendChild(btn);
});
document.getElementById("startBtn").onclick=startGame;
document.getElementById("theme").onchange=e=>document.body.className=e.target.value;
document.getElementById("fontSelect").onchange=e=>gameArea.style.fontFamily=e.target.value;
document.getElementById("letterSize").onchange=e=>{const size=e.target.value+"px";activeLetters.forEach(l=>l.element.style.fontSize=size);};
}

function setDifficulty(){
    const level=document.getElementById("difficulty").value;
    if(level=="easy"){fallingSpeed=1.4;spawnRate=2000;}
    if(level=="medium"){fallingSpeed=2.3;spawnRate=1500;}
    if(level=="hard"){fallingSpeed=3.2;spawnRate=900;}
}

function startGame(){
    gameArea.innerHTML="";
    score=0;scoreBox.textContent="امتیاز: 0";
    lives=3;livesBox.textContent='❤️❤️❤️';
    activeLetters=[];
    setDifficulty();
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    spawnInterval=setInterval(spawnLetter,spawnRate);
    gameInterval=setInterval(update,20);
}

function spawnLetter(){
    const letter=letters[Math.floor(Math.random()*letters.length)];
    const div=document.createElement("div");
    div.className="word";
    div.textContent=letter;
    div.style.fontSize=document.getElementById("letterSize").value+"px";
    div.style.right=Math.random()*300+"px";
    div.style.backgroundColor=randomColor();
    gameArea.appendChild(div);
    activeLetters.push({text:letter,y:-50,element:div});
}

function randomColor(){
    const colors=['#FF5733','#33FF57','#3357FF','#F1C40F','#9B59B6','#E67E22','#1ABC9C'];
    return colors[Math.floor(Math.random()*colors.length)];
}

function update(){
    activeLetters.forEach((l,i)=>{
        l.y+=fallingSpeed;
        l.element.style.top=l.y+"px";
        if(l.y>290){loseLife(i);}
    });
}

function checkTyped(letter){
    activeLetters.forEach((l,i)=>{
        if(letter===l.text) destroyLetter(i);
    });
}

function destroyLetter(i){
    const l=activeLetters[i];
    l.element.classList.add("explode");
    explodeSound.currentTime=0;
    explodeSound.play();
    setTimeout(()=>l.element.remove(),300);
    activeLetters.splice(i,1);
    score++;
    scoreBox.textContent="امتیاز: "+score;
    fallingSpeed+=0.06;
    if(score>highScore){
        highScore=score;
        localStorage.setItem("highscore",highScore);
        document.getElementById("highScoreBox").textContent="بالاترین امتیاز: "+highScore;
    }
}

function loseLife(i){
    activeLetters[i].element.remove();
    activeLetters.splice(i,1);
    lives--;
    livesBox.textContent='❤️'.repeat(lives);
    if(lives<=0) endGame();
}

function endGame(){
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    alert("پایان بازی! امتیاز شما: "+score);
}
