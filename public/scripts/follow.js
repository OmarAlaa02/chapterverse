function followUser(button,followedID) {

    
    const isFollowed = button.classList.contains('followed');
    
    if (!isFollowed) {
        fetch('/follow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userID: followedID})
        })
        button.classList.add('followed');
        button.textContent = 'Followed';
    }
    else{
        fetch('/unfollow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userID: followedID})
        })
        
        //update classlist
        button.classList.remove('followed');
        button.textContent='follow';
    }
}
