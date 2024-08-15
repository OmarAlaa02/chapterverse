function likepost(button, postID) {


    const isliked = button.classList.contains('liked');

    const likedImageUrl = 'https://img.icons8.com/?size=100&id=bSgWULgZFGCT&format=png&color=00563f';
    const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAgRJREFUSEvl1kuozVEUx/HPxUApAwNh4JWUx0CSmHiMjJTynKHIQJmYeOWRXEYmJEWmhJEMlJQZRRkokUiSiedM8vyvWv/b/x7n3PM/995z7sCenM7e+7++67f22mvtPmM0+saIayTgHZidjr/HTXyuK2S44J240gB5hyX4VAc+HPAq3MOEJoC9uNAN8Bw8xhR8w8r8fZGw3bg82uDJeIT5aXgLbuAoTuTcLLwdTfB43MXaNHoygfH3JebhCZbWgcaeumd8CbvS6C1swJ8ikxfjac4fRv9ogiNhzqfBZ1iW5xpTofxIp2FupngPDlTuZ1XAhwxlXJtyhCMLaqh8k04OXMFqqFfj/hBGIoMfNqzHnY0MrzuWZ4IOOuNDOJUWyixdg3CoVT4sxCaMa0M+lusHcabR2PEiYcoNZSSazdVVV90XiRgjBIXNQYq7BY6r+HMswOtwJ8EDla2aXN1SfBXb8KOo41PxtRehnoSPRUJNzLa5uTz4biuOunAxYeuL4nO7V+AHxfmuQBSfaUV9/90LcLTQ1wk6i/3V+9XNUJ/O8hu8KKvPewEOQVHTZ7Rql1XF1YZe9t140G1PT8u5OpVrUaWj7cO5xo+q4K24VsdqB3u+Yzq+DAWOQn+9aOwbOzDcbmtTta06ztzi6TqzncU267/wCvHebjrqPn1G6Me/n/9/4L/NLWMf7q05RAAAAABJRU5ErkJggg==';
    
    const imgElement = document.getElementById(`like-img-${postID}`);
    

    if (!isliked) {
        fetch('/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postID: postID
            })
        }).then(response => response.json())
        .then((data) => {
            button.classList.add('liked');
            const likebutton = document.getElementById(`likebutton-${postID}`);
            likebutton.textContent=data.likecount;
            imgElement.src = likedImageUrl;
        })
        
    } else {
        fetch('/unlike', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    postID: postID
                })
            })
            .then(response => response.json())
            .then(data => {
                //update classlist
                button.classList.remove('liked');
                const likebutton = document.getElementById(`likebutton-${postID}`);
                likebutton.textContent=data.likecount;
                imgElement.src = imageUrl;
                // button.textContent = 'like ' + data.likecount;
            })
        }
}


function viewcomments(postId,page,cb) {
    const commentsSection = document.getElementById(`comments-section-${postId}`);

    if (cb || commentsSection.style.display === 'none' || commentsSection.style.display === '') {
        
        //undefined handling
        commentsSection.style.display = 'block'; // Load comments when the section is shown
        fetch(`/getComments/${postId}/${page}`)
            .then(response => response.json())
            .then((data) => {
                // console.log(data);
                // console.log(typeof (data));
                const commentsList = document.querySelector(`#comments-section-${postId} .comments-list`);
                
                if(!cb)
                    commentsList.innerHTML = `<span class="hidden-span" id="page-${postId}">1</span>`;
                for (let i = 0; i < data.users.length; i++) {
                    commentsList.innerHTML +=
                        `<div class="comment">
                            <img src="${data.users[i].profilepicture}" alt="User Avatar" class="comment-avatar">
                            <div class="comment-content">
                                <h3 class="comment-username">${data.users[i].username}</h3>
                                <p class="comment-text">${data.comments[i].content}</p>
                            </div>
                        </div>`;
                }
                if(cb)
                    cb();
                
            })
    } else {
        commentsSection.style.display = 'none';
    }
}


//TODO :fix postComment
function postComment(postID,userID)
{
    const commentsection=document.getElementById(`comment-area-${postID}`);
    
    //fetch => /postComment
    fetch('/postComment',{
        method:'post',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            content:commentsection.value,
            userID:userID,
            postID:postID    
        })
    })
    .then(response => response.json())
    .then((data)=>{
        commentsection.value='';
        const commentcount = document.getElementById(`comment-${postID}`);
        //append to comment section with skip of commentcount
        commentcount.textContent=data.commentcount;
        // viewcomments(postID);
    })
}


//let loading=false;
//if(loading)return;
//loading=true;
let page = 2;
let isLoading = false;
function loadposts() {
    if (isLoading) return;
    isLoading = true;
    fetch(`/loadposts/?page=${page}`)
        .then(response => response.json())
        .then(data => {
            console.log(`Current page from server: ${data.page}`);
            page ++;
            let i=0;
            for(let post of data.posts)
            {
                const postsection = document.getElementById(`post-container`);
                // console.log(post.authorname);
                let postHTML = `
                    <div class="post">
                        <div class="post-header">
                            <img src="${data.authordata[i].authorprofilepicture}" alt="User Avatar" class="post-avatar">
                            <div class="post-info">
                                <h2 class="post-username">${data.authordata[i].authorname}</h2>
                            </div>
                        </div>
                        <div class="post-content">
                            <p>${post.title}</p>
                            <p>${post.content}</p>`;

                if (post.img !== "") {
                    postHTML += `<img src="${post.img}" alt="Post Image">`;
                }


                //TODO :fix isliked

                postHTML += `
                        </div>
                        <div class="post-actions">
                            <button class="like-btn ${data.authordata[i].isliked ? 'liked' : ''}" id="like-btn-${post._id}" onclick="likepost(this, '${post._id}')">
                                <img id="like-img-${post._id}" src="${post.isliked ? 'https://img.icons8.com/?size=100&id=yf0dOM7vHimr&format=png&color=228BE6' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAgRJREFUSEvl1kuozVEUx/HPxUApAwNh4JWUx0CSmHiMjJTynKHIQJmYeOWRXEYmJEWmhJEMlJQZRRkokUiSiedM8vyvWv/b/x7n3PM/995z7sCenM7e+7++67f22mvtPmM0+saIayTgHZidjr/HTXyuK2S44J240gB5hyX4VAc+HPAq3MOEJoC9uNAN8Bw8xhR8w8r8fZGw3bg82uDJeIT5aXgLbuAoTuTcLLwdTfB43MXaNHoygfH3JebhCZbWgcaeumd8CbvS6C1swJ8ikxfjac4fRv9ogiNhzqfBZ1iW5xpTofxIp2FupngPDlTuZ1XAhwxlXJtyhCMLaqh8k04OXMFqqFfj/hBGIoMfNqzHnY0MrzuWZ4IOOuNDOJUWyixdg3CoVT4sxCaMa0M+lusHcabR2PEiYcoNZSSazdVVV90XiRgjBIXNQYq7BY6r+HMswOtwJ8EDla2aXN1SfBXb8KOo41PxtRehnoSPRUJNzLa5uTz4biuOunAxYeuL4nO7V+AHxfmuQBSfaUV9/90LcLTQ1wk6i/3V+9XNUJ/O8hu8KKvPewEOQVHTZ7Rql1XF1YZe9t140G1PT8u5OpVrUaWj7cO5xo+q4K24VsdqB3u+Yzq+DAWOQn+9aOwbOzDcbmtTta06ztzi6TqzncU267/wCvHebjrqPn1G6Me/n/9/4L/NLWMf7q05RAAAAABJRU5ErkJggg=='}" alt="Like" />
                            </button>
                            <span id="likebutton-${post._id}">${post.likecount}</span>

                            <button class="comment-btn" id="comment-btn-${post._id}" onclick="viewcomments('${post._id}')">
                                <img src="https://img.icons8.com/?size=100&id=143&format=png&color=1A1A1A" alt="Comment" />
                            </button>
                            <span id="comment-${post._id}">${post.commentcount}</span>
                        </div>

                        <div id="comments-section-${post._id}" class="comments-section">
                            <div class="comments-list" id="comment-list-${post._id}">
                                <!-- Comments will be loaded here -->
                            </div>
                            <textarea name="comment" placeholder="Add a comment..." required id="comment-area-${post._id}"></textarea>
                            <button type="button" onclick="postComment('${post._id}', '${data.user}')">
                                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAUdJREFUSEvtlr9KA0EQh79rjYWPYLCInYXYG3wCwc4mhSD4EvHPM1gYCKQ2D2GKlGkstUhsDSkkIHZqBmZhXC53ht31ELLNHcfu75vf7M7tZFQ0soq4+OAacALUIwc0Ae6BD6drwVvACNiJDHVyT8A+8C4fLPgCuE0EdbJnQNcHXwJtnRF7779U92rxFM4Px/8CvA201EVv8f5SskXRHB8CDwprAoM12MtAUKptOqXm91T8EXgzINkGfwSB3eKyUs8rxSBwZY6t0/Wp/rM6ruzPVXayo5bTqjA7f+VykotA7uiNEKpZew50iq7FTeAOOI0EFJln4ACYF4GlTWkodKpBfAYEMQb6y3ou2wg4xhA4BmYB0Nyl9r9qweLuGrgBQpwujTcP/KotrrhNNnzwUarU+g4seFdPXpLUFoGTpTVPOHb//OvgvwFad2gfRZnJDwAAAABJRU5ErkJggg==" alt="postComment" />
                            </button>
                        </div>
                    </div>`;

                    postsection.innerHTML += postHTML;
                    i++;
                    isLoading = false;
                }

                const scrollableDivs = document.querySelectorAll('.comments-list');
        
                // Add scroll event listener to each div
                scrollableDivs.forEach(div => {
                    div.addEventListener('scroll', () => {
                        const scrollTop = div.scrollTop;
                        const scrollHeight = div.scrollHeight;
                        const clientHeight = div.clientHeight;
                        console.log('------------------------------');
                        console.log('scrollTop',scrollTop);
                        console.log('scrollHeight',scrollHeight);
                        console.log('clientHeight',clientHeight);
                        console.log('sum',clientHeight + scrollTop + 1);
                        console.log('------------------------------');
                        if (scrollTop + clientHeight + 1>= scrollHeight) {
                            onScrollToBottom(div.id);
                        }
                    });
                });
            })  
}
       
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    console.log('-------------------------------------------');
    // console.log(scrollTop);
    console.log('sum',scrollTop+viewportHeight + 1 );
    console.log(documentHeight); 
    console.log('-------------------------------------------');
    if (scrollTop + viewportHeight +400 >= documentHeight) {
        console.log('reached for posts');
        loadposts();
    }
});

let commentloading=false;

function onScrollToBottom(divId) {
    if(commentloading)
        return;
    commentloading=true;
    console.log(`User has reached the bottom of ${divId}`);
    // Your function logic here
    const postID=divId.split('-')[2];
    const spanID='page-'+postID;
    const span=document.getElementById(spanID);
    console.log(span.textContent);
    const page=parseInt(span.textContent,10)
    span.textContent=page+1;
    viewcomments(postID,page,()=>{
        commentloading=false;
    });
}

const scrollableDivs = document.querySelectorAll('.comments-list');
        
// Add scroll event listener to each div
scrollableDivs.forEach(div => {
    div.addEventListener('scroll', () => {
        const scrollTop = div.scrollTop;
        const scrollHeight = div.scrollHeight;
        const clientHeight = div.clientHeight;
        console.log('------------------------------');
        console.log('scrollTop',scrollTop);
        console.log('scrollHeight',scrollHeight);
        console.log('clientHeight',clientHeight);
        console.log('sum',clientHeight + scrollTop + 1);
        console.log('------------------------------');
        if (scrollTop + clientHeight + 1>= scrollHeight) {
            onScrollToBottom(div.id);
        }
    });
});

