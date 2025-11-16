const letters=["ا","ب","پ","ت","ث","ج","چ","ح","خ","د","ذ","ر","ز","ژ","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ک","گ","ل","م","ن","و","ه","ی"];
let fallingSpeed=1.5, spawnRate=1800, score=0, highScore=localStorage.getItem("highscore")||0;
let lives=3;
const gameArea=document.getElementById("gameArea"),
      scoreBox=document.getElementById("score"),
      livesBox=document.getElementById("lives"),
      explodeSound=document.getElementById("explodeSound"),
      hiddenInput=document.getElementById("hiddenInput");

let activeLetters=[], gameInterval, spawnInterval;

window.addEventListener("DOMContentLoaded",()=>{
    document.getElementById("highScoreBox").textContent="بالاترین امتیاز: "+highScore;

    document.getElementById("startBtn").addEventListener("click",()=>{
        startGame();
        hiddenInput.focus(); // تمرکز روی input مخفی
    });

    document.getElementById("theme").addEventListener("change", e=>{
        document.body.classList.remove('light','dark','neon');
        document.body.classList.add(e.target.value);
    });

    document.getElementById("fontSelect").addEventListener("change", e=>{
        gameArea.style.fontFamily=e.target.value;
    });

    document.getElementById("letterSize").addEventListener("change", e=>{
        const size=e.target.value+"px";
        activeLetters.forEach(l=>l.element.style.fontSize=size);
    });

    hiddenInput.addEventListener("input", e=>{
        const val=e.target.value;
        if(val) checkTyped(val[val.length-1]);
        e.target.value = "";
    });
});

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
    hiddenInput.focus();
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
        if(l.y>gameArea.clientHeight-40){loseLife(i);}
    });
}

function checkTyped(letter){
    activeLetters.forEach((l,i)=>{
        if(letter===l.text) destroyLetter(i);
    });
}

function destroyLetter(i){
    const l=activeLetters[i];
    explodeLetter(l);
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

function explodeLetter(letterObj){
    const l=letterObj.element;
    l.classList.add("explode");
    explodeSound.currentTime=0;
    explodeSound.play();
    createParticles(l);
    setTimeout(()=>l.remove(),300);
}

function createParticles(letterEl){
    const colors=[letterEl.style.backgroundColor];
    for(let i=0;i<10;i++){
        const particle=document.createElement("div");
        particle.className="particle";
        particle.style.backgroundColor=colors[Math.floor(Math.random()*colors.length)];
        const rect=letterEl.getBoundingClientRect();
        const parentRect=gameArea.getBoundingClientRect();
        particle.style.left=(rect.left-parentRect.left+rect.width/2)+"px";
        particle.style.top=(rect.top-parentRect.top+rect.height/2)+"px";
        gameArea.appendChild(particle);
        const angle=Math.random()*2*Math.PI;
        const dist=Math.random()*50+20;
        particle.style.transition="all 0.5s linear";
        setTimeout(()=>{
            particle.style.left=(rect.left-parentRect.left+rect.width/2+dist*Math.cos(angle))+"px";
            particle.style.top=(rect.top-parentRect.top+rect.height/2+dist*Math.sin(angle))+"px";
            particle.style.opacity=0;
        },10);
        setTimeout(()=>particle.remove(),510);
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
