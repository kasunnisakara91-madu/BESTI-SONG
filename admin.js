import {

    db,
    storage,
    auth,

    collection,
    getDocs,
    addDoc,

    deleteDoc,
    doc,

    getDoc,

    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,

    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut

} from "./firebase.js";


const ADMIN_EMAIL =
    "damithmadusanka179@gmail.com";


const loginBox =
    document.getElementById(
        "loginBox"
    );


const adminPanel =
    document.getElementById(
        "adminPanel"
    );


const loginBtn =
    document.getElementById(
        "loginBtn"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const loginStatus =
    document.getElementById(
        "loginStatus"
    );


const uploadStatus =
    document.getElementById(
        "uploadStatus"
    );


const adminSongs =
    document.getElementById(
        "adminSongs"
    );


/* AUTH STATE */

onAuthStateChanged(
    auth,
    async user => {

        if(!user){

            loginBox.style.display =
                "block";

            adminPanel.style.display =
                "none";

            return;
        }


        /*
         * Extra frontend check.
         * Real protection is done by Firebase Rules.
         */

        if(
            user.email !== ADMIN_EMAIL
        ){

            await signOut(auth);

            loginStatus.textContent =
                "This account is not an admin.";

            return;
        }


        loginBox.style.display =
            "none";

        adminPanel.style.display =
            "block";


        document
            .getElementById(
                "adminUser"
            )
            .textContent =
                "Logged in as: " +
                user.email;


        loadAdminSongs();

    }
);


/* LOGIN */

loginBtn.addEventListener(
    "click",
    async () => {

        const email =
            document
                .getElementById(
                    "email"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "password"
                )
                .value;


        if(
            email !== ADMIN_EMAIL
        ){

            loginStatus.textContent =
                "Use the authorized admin email.";

            return;
        }


        if(!password){

            loginStatus.textContent =
                "Enter your password.";

            return;
        }


        loginBtn.disabled =
            true;


        loginStatus.textContent =
            "Logging in...";


        try{

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            loginStatus.textContent =
                "Login successful.";


        }catch(error){

            console.error(error);

            loginStatus.textContent =
                friendlyError(error);

        }


        loginBtn.disabled =
            false;

    }
);


/* LOGOUT */

logoutBtn.addEventListener(
    "click",
    async () => {

        await signOut(auth);

    }
);


/* UPLOAD */

document
    .getElementById(
        "uploadBtn"
    )
    .addEventListener(
        "click",
        uploadSong
    );


async function uploadSong(){

    const user =
        auth.currentUser;


    if(!user){

        uploadStatus.textContent =
            "Please login first.";

        return;
    }


    if(
        user.email !== ADMIN_EMAIL
    ){

        uploadStatus.textContent =
            "Admin access required.";

        return;
    }


    const title =
        document
            .getElementById(
                "title"
            )
            .value
            .trim();


    const artist =
        document
            .getElementById(
                "artist"
            )
            .value
            .trim();


    const coverFile =
        document
            .getElementById(
                "cover"
            )
            .files[0];


    const audioFile =
        document
            .getElementById(
                "audio"
            )
            .files[0];


    if(!title){

        uploadStatus.textContent =
            "Enter song title.";

        return;
    }


    if(!artist){

        uploadStatus.textContent =
            "Enter artist name.";

        return;
    }


    if(!coverFile){

        uploadStatus.textContent =
            "Select cover image.";

        return;
    }


    if(!audioFile){

        uploadStatus.textContent =
            "Select audio file.";

        return;
    }


    /*
     * Basic file validation
     */

    if(
        !coverFile.type.startsWith(
            "image/"
        )
    ){

        uploadStatus.textContent =
            "Cover must be an image.";

        return;
    }


    if(
        !audioFile.type.startsWith(
            "audio/"
        )
    ){

        uploadStatus.textContent =
            "Audio file is not valid.";

        return;
    }


    const uploadBtn =
        document.getElementById(
            "uploadBtn"
        );


    const progress =
        document.getElementById(
            "progress"
        );


    const progressBar =
        document.getElementById(
            "progressBar"
        );


    uploadBtn.disabled =
        true;


    progress.style.display =
        "block";


    progressBar.style.width =
        "5%";


    try{

        const timestamp =
            Date.now();


        const cleanCover =
            cleanName(
                coverFile.name
            );


        const cleanAudio =
            cleanName(
                audioFile.name
            );


        /* COVER */

        uploadStatus.textContent =
            "Uploading cover...";


        const coverPath =
            `covers/${user.uid}/${timestamp}_${cleanCover}`;


        const coverRef =
            ref(
                storage,
                coverPath
            );


        await uploadBytes(
            coverRef,
            coverFile
        );


        progressBar.style.width =
            "40%";


        const coverUrl =
            await getDownloadURL(
                coverRef
            );


        /* AUDIO */

        uploadStatus.textContent =
            "Uploading audio...";


        const audioPath =
            `songs/${user.uid}/${timestamp}_${cleanAudio}`;


        const audioRef =
            ref(
                storage,
                audioPath
            );


        await uploadBytes(
            audioRef,
            audioFile
        );


        progressBar.style.width =
            "80%";


        const audioUrl =
            await getDownloadURL(
                audioRef
            );


        /* FIRESTORE */

        uploadStatus.textContent =
            "Saving song...";


        await addDoc(
            collection(
                db,
                "songs"
            ),
            {

                title:title,

                artist:artist,

                cover:coverUrl,

                audioUrl:audioUrl,

                coverPath:coverPath,

                audioPath:audioPath,

                downloads:0,

                createdAt:
                    Date.now(),

                uploadedBy:
                    user.uid

            }
        );


        progressBar.style.width =
            "100%";


        uploadStatus.textContent =
            "✅ Song uploaded successfully!";


        clearForm();


        loadAdminSongs();


    }catch(error){

        console.error(error);

        uploadStatus.textContent =
            "❌ Upload failed: " +
            error.message;

    }


    uploadBtn.disabled =
        false;
}


/* LOAD SONGS */

async function loadAdminSongs(){

    adminSongs.innerHTML =
        "Loading songs...";


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "songs"
                )
            );


        if(snapshot.empty){

            adminSongs.innerHTML =
                "No songs uploaded.";

            return;
        }


        const list = [];


        snapshot.forEach(item => {

            list.push({

                id:item.id,

                ...item.data()

            });

        });


        list.sort(
            (a,b) =>
                (b.createdAt || 0)
                -
                (a.createdAt || 0)
        );


        adminSongs.innerHTML =
            "";


        list.forEach(song => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "songRow";


            row.innerHTML = `

                <img
                    src="${escapeHTML(
                        song.cover || ""
                    )}"
                    alt=""
                >

                <div class="songInfo">

                    <b>
                        ${escapeHTML(
                            song.title ||
                            "Unknown"
                        )}
                    </b>

                    <small>
                        ${escapeHTML(
                            song.artist ||
                            "Unknown"
                        )}

                        •

                        ${Number(
                            song.downloads ||
                            0
                        )}
                        downloads
                    </small>

                </div>

                <button
                    class="deleteBtn"
                >
                    DELETE
                </button>

            `;


            row
                .querySelector(
                    ".deleteBtn"
                )
                .addEventListener(
                    "click",
                    () =>
                        deleteSong(
                            song.id,
                            song
                        )
                );


            adminSongs.appendChild(
                row
            );

        });


    }catch(error){

        console.error(error);

        adminSongs.innerHTML =
            "Failed to load songs.";

    }
}


/* DELETE */

async function deleteSong(
    id,
    song
){

    const yes =
        confirm(
            `Delete "${song.title}"?`
        );


    if(!yes) return;


    try{

        /*
         * Delete audio
         */

        if(song.audioPath){

            try{

                await deleteObject(
                    ref(
                        storage,
                        song.audioPath
                    )
                );

            }catch(error){

                console.log(
                    "Audio file already missing."
                );

            }
        }


        /*
         * Delete cover
         */

        if(song.coverPath){

            try{

                await deleteObject(
                    ref(
                        storage,
                        song.coverPath
                    )
                );

            }catch(error){

                console.log(
                    "Cover already missing."
                );

            }
        }


        /*
         * Delete Firestore document
         */

        await deleteDoc(
            doc(
                db,
                "songs",
                id
            )
        );


        loadAdminSongs();


    }catch(error){

        console.error(error);

        alert(
            "Delete failed: " +
            error.message
        );

    }
}


/* CLEAR */

function clearForm(){

    document
        .getElementById(
            "title"
        )
        .value = "";


    document
        .getElementById(
            "artist"
        )
        .value = "";


    document
        .getElementById(
            "cover"
        )
        .value = "";


    document
        .getElementById(
            "audio"
        )
        .value = "";


    setTimeout(
        () => {

            document
                .getElementById(
                    "progress"
                )
                .style
                .display =
                    "none";

        },
        1500
    );
}


/* HELPERS */

function cleanName(name){

    return String(name)
        .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );
}


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


function friendlyError(error){

    if(
        error.code ===
        "auth/invalid-credential"
    ){

        return "Invalid email or password.";

    }


    if(
        error.code ===
        "auth/too-many-requests"
    ){

        return "Too many login attempts. Try again later.";

    }


    if(
        error.code ===
        "auth/user-not-found"
    ){

        return "Admin account not found.";

    }


    return error.message ||
        "Login failed.";
}