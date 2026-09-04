import {

    db,

    collection,
    getDocs,

    doc,
    updateDoc,
    increment

} from "./firebase.js";


const songsBox =
    document.getElementById("songs");

const search =
    document.getElementById("search");

const songCount =
    document.getElementById("songCount");


let songs = [];


/* LOAD */

async function loadSongs(){

    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "songs"
                )
            );


        songs = [];


        snapshot.forEach(item => {

            songs.push({

                id:item.id,

                ...item.data()

            });

        });


        songs.sort(
            (a,b) =>
                (b.createdAt || 0)
                -
                (a.createdAt || 0)
        );


        renderSongs(songs);


    }catch(error){

        console.error(error);

        songsBox.innerHTML = `

            <div class="loading">

                Failed to load songs.

                <br><br>

                Check Firestore Rules.

            </div>

        `;
    }
}


/* RENDER */

function renderSongs(list){

    songCount.textContent =
        `${list.length} Songs`;


    if(!list.length){

        songsBox.innerHTML = `

            <div class="loading">

                No songs found.

            </div>

        `;

        return;
    }


    songsBox.innerHTML =

        list.map(song => `

            <article class="card">

                <img

                    class="cover"

                    src="${safeURL(
                        song.cover
                    )}"

                    alt="Cover"

                >


                <div class="cardBody">

                    <div class="title">

                        ${escapeHTML(
                            song.title ||
                            "Unknown Song"
                        )}

                    </div>


                    <div class="artist">

                        ${escapeHTML(
                            song.artist ||
                            "Unknown Artist"
                        )}

                    </div>


                    <div class="downloads">

                        ${Number(
                            song.downloads || 0
                        )} downloads

                    </div>


                    <div class="buttons">

                        <button
                            class="play"
                            data-id="${song.id}"
                        >
                            ▶ PLAY
                        </button>


                        <a
                            class="download"
                            href="${safeURL(
                                song.audioUrl
                            )}"
                            target="_blank"
                            rel="noopener"
                            download
                            data-id="${song.id}"
                        >
                            ↓ DOWNLOAD
                        </a>

                    </div>

                </div>

            </article>

        `).join("");


    document
        .querySelectorAll(".play")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    playSong(
                        button.dataset.id
                    )
            );

        });


    document
        .querySelectorAll(".download")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    increaseDownload(
                        button.dataset.id
                    )
            );

        });
}


/* PLAY */

function playSong(id){

    const song =
        songs.find(
            item =>
                item.id === id
        );


    if(!song) return;


    const player =
        document.getElementById(
            "player"
        );


    const audio =
        document.getElementById(
            "audio"
        );


    document
        .getElementById(
            "playerCover"
        )
        .src =
            safeURL(song.cover);


    document
        .getElementById(
            "playerTitle"
        )
        .textContent =
            song.title ||
            "Unknown Song";


    document
        .getElementById(
            "playerArtist"
        )
        .textContent =
            song.artist ||
            "Unknown Artist";


    audio.src =
        song.audioUrl;


    player.style.display =
        "flex";


    audio
        .play()
        .catch(() => {});
}


/* DOWNLOAD COUNT */

async function increaseDownload(id){

    try{

        await updateDoc(

            doc(
                db,
                "songs",
                id
            ),

            {
                downloads:
                    increment(1)
            }

        );

    }catch(error){

        console.log(
            "Download count failed:",
            error
        );
    }
}


/* SEARCH */

search.addEventListener(
    "input",
    () => {

        const value =
            search.value
                .toLowerCase()
                .trim();


        const filtered =
            songs.filter(song => {

                const title =
                    String(
                        song.title || ""
                    )
                    .toLowerCase();


                const artist =
                    String(
                        song.artist || ""
                    )
                    .toLowerCase();


                return (
                    title.includes(value)
                    ||
                    artist.includes(value)
                );

            });


        renderSongs(
            filtered
        );

    }
);


/* HELPERS */

function escapeHTML(value){

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


function safeURL(value){

    if(!value) return "";

    return String(value)
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


loadSongs();