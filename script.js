let currFolder;
let songs;
async function get_songs(folder) {
    currFolder = folder
    let fetch_song = await fetch(`/${folder}`);
    let response = await fetch_song.text();
    let div = document.createElement('div')
    div.innerHTML = response
    let as = div.getElementsByTagName('a')
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith('.mp3')){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    return songs
}
function formatTime(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "00:00"
    }
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    // Pad with zero if less than 10
    let formattedMins = String(mins).padStart(2, '0');
    let formattedSecs = String(secs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}
let currentSong = new Audio();
const playMusic = (track, pause = false) =>{
    currentSong.src = `/${currFolder}/`+track
    if(!pause){
        currentSong.play()
    }
    document.querySelector('#songinfo').innerHTML = decodeURI(track)
    // document.querySelector('.songinfo').innerHTML = "00"
}
let currentSongIndex = 0;
const playNextSong = (songs) => {
    currentSongIndex = (currentSongIndex + 1) % songs.length; // লুপ করার জন্য
    playMusic(songs[currentSongIndex]);
};
const playPrevSong = (songs) => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; // পিছনে যাওয়ার জন্য
    playMusic(songs[currentSongIndex]);
};
async function SongCards(){
    let fetch_folders = await fetch('https://github.com/Jim2811/Spotify-Clone/tree/main/songs/');
    let response = await fetch_folders.text();
    let div = document.createElement('div')
    div.innerHTML = response
    let ancors = div.getElementsByTagName('a')
    Array.from(ancors).forEach(async e =>{
        // console.log(e.href)
        if(e.href.includes("/songs/")){
            let folder = e.href.split("/").slice(-1)[0]
            let a = await fetch(`songs/${folder}/info.json`)
            // console.log(a)
            let response = await a.json();
            console.log(response)
            let cardContainer = document.querySelector(".cardContainer")
            cardContainer.innerHTML += 
            `<div data-folder="${folder}" class="card flex p-10 m-10 border-radius">
                        <div class="play">
                            <img src="/songs/${folder}/cover.jpg" class="cover">
                            <div class="playlistPlay flex p-10">
                                <img src="img/play.svg">
                            </div>
                        </div>
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    })
}
async function main() {
    await SongCards()
    songs = await get_songs("songs/AlanWalkerSongs")
    playMusic(songs[0], true)
    // appending songs on list
    let songUL = document.querySelector('.musicLists').getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <div><img src="img/play.svg" class="inv-img"></div>
            <div class="songInfo">${song.replaceAll("%20", " ")}</div>
        </li>`
    }
    
    Array.from(document.querySelector(".musicLists").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", ()=>{
            console.log(e.getElementsByTagName("div")[1].innerHTML)
            playMusic(e.getElementsByTagName("div")[1].innerHTML.trim())
        })
    })
    // play song
    let play = document.querySelector(".playsong")
    play.addEventListener( "click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
    // update song time
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/ ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) *100 +"%" })
    // seekbar
    document.querySelector(".seekbar").addEventListener("click", e =>{
        const rect = e.target.getBoundingClientRect();
        let percent = (e.offsetX / rect.width)*100
        document.querySelector(".circle").style.left = percent +"%"
        currentSong.currentTime = ((currentSong.duration)*percent)/100
    })
    // next song
    document.querySelector(".nextsong").addEventListener("click", () => {
        playNextSong(songs);
    });
    // prev song
    document.querySelector(".prevsong").addEventListener("click", () => {
        playPrevSong(songs);
    });
    // add event listner on hamburger
    let hamburger = document.querySelector(".hamburger")
    hamburger.addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
        document.querySelector(".spotifyPlalist").style.opacity = "0"
    })
    // add event listner on close button
    let close = document.querySelector(".close")
    close.addEventListener("click", ()=>{
        document.querySelector('.left').style.left = "-100%"
        document.querySelector(".spotifyPlalist").style.opacity = "1"
    })
    // volume 
    let volumeSlider = document.querySelector('.volumeSlider')
    volumeSlider.addEventListener('input', ()=>{
        currentSong.volume = volumeSlider.value / 100;
    })
    // dynamic music loader
    let cards = document.querySelectorAll(".card");
    Array.from(cards).forEach(e => {
        e.addEventListener("click", async () => {
            let folderName = e.dataset.folder;
            songs = await get_songs(`https://github.com/Jim2811/Spotify-Clone/tree/main/songs/${folderName}`);
            let songUL = document.querySelector('.musicLists ul');
            songUL.innerHTML = ""; 
            songs.forEach(song => {
            songUL.innerHTML += `
                <li>
                    <div><img src="img/play.svg" class="inv-img"></div>
                    <div class="songInfo">${song.replaceAll("%20", " ")}</div>
                </li>`;
            });
            Array.from(document.querySelectorAll(".musicLists li")).forEach(item => {
                item.addEventListener("click", () => {
                    playMusic(item.querySelector(".songInfo").innerHTML.trim());
                });
            });
        });
    });
}
main()
