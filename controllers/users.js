const UsersDB=require('../models/userschema.js');
const postsDB=require('../models/postschema.js');
const likesDB=require('../models/likeschema.js');
const commentsDB=require('../models/commentschema.js');
const followsDB=require('../models/followschema.js');
const viewsDB=require('../models/viewschema.js');
const bcrypt = require('bcrypt');

exports.getSigninPage=(req,res)=>{
    res.render('signin');
}

exports.postsignin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email) {
        return res.status(400).json("please enter your email");
    }
    if (!password) {
        return res.status(400).json("please enter your password");
    }
    
    const user = await UsersDB.find({
        email: req.body.email
    })


    if (user.length == 0) {
        return res.redirect('/signin');
    }


    bcrypt.compare(password, user[0].password, async (err, result) => {
        if (err) {
            // Handle error
            console.error('Error comparing passwords:', err);
            return;
        }

        if (result) {
            req.session.isLoggedIn = true;
            req.session.userID = user[0]._id;
            req.session.profilepicture = user[0].profilepicture;
            req.session.save(()=>{
                
                res.status(200).redirect('/home');
            })
        } else {

            res.status(400).redirect('/');

        }
    })
}

exports.getSignupPage=(req,res)=>{
    res.render('signup');
}

exports.postSignup = async (req, res) => {
const {
    username,
    email,
    password,
    confirm_password
} = req.body;
if (!username) {
    return res.status(400).json("please enter your email"); //400 bad request
}
if (!email) {
    return res.status(400).json("please enter your email");
}
if (!password) {
    return res.status(400).json("please enter your password"); //400 bad request
}
if (!confirm_password) {
    return res.status(400).json("please confirm your password");
}


const user1 = await UsersDB.find({
    email: req.body.email
});
if (user1.length) {
    return res.status(400).redirect('/signup');
}


if (req.body.password === req.body.confirm_password) {
    req.body.cart = [];
    const hashpassword = req.body.password;
    bcrypt.hash(hashpassword, 5, async(err, hash) => {
        if (err) {
            console.log("hash failed");
            return;
        }
        req.body.password = hash;
        const addedUser = new UsersDB(req.body);
        addedUser.save().then(() => {
            res.redirect('/');
        })
    })
    // if(score>=3)
    // {

    // }
    // else
    // {
    // return res.status(400).json("please enter a stronger password");

    // }

} else {
    return res.status(400).redirect('/signup');
}
}

exports.getHomePage=async(req,res)=>{
    const limit = 4;
    let followers=await followsDB.find({followerID:req.session.userID});
    
    followers=followers.map(user=>user.followedID);
    followers.push(req.session.userID);

    const posts=await postsDB.find({authorID:{$in:followers}}).sort({ _id: -1 }).limit(limit);
    
    //will lower complexity after pagination

    //likesDB.find({postID:post._id,userID:req.session.userID})
    const users=await Promise.all([
        UsersDB.findById(posts[0]?.authorID),
        UsersDB.findById(posts[1]?.authorID),
        UsersDB.findById(posts[2]?.authorID),
        UsersDB.findById(posts[3]?.authorID),
    ]
    )
    // console.log(users);

    for(let i=0;i<Math.min(posts.length,4);i++)
    {
        posts[i].authorname=users[i].username;
        posts[i].authorprofilepicture=users[i].profilepicture;
        // post.isliked=isliked;
    }

    res.render('homePage',{
        posts:posts,
        lastID:posts[posts.length-1]?._id || 0,
        user:req.session.userID
    });

}



exports.getAddPost=(req,res)=>{
    res.render('addpostPage');
}


exports.getProfilePage=async(req,res)=>{

    // const user=await UsersDB.findById(req.session.userID);
    // const posts=await postsDB.find({authorID:user._id});
    // console.log(user);
    // console.log(posts);

    const all = await Promise.all([
        UsersDB.findById(req.session.userID),
        postsDB.find({authorID:req.session.userID})
    ]);

    const user=all[0];
    const posts=all[1];


    //TODO : must be fixed

    for(let post of posts)
    {
        post.isliked=(await likesDB.find({userID:user._id,postID:post._id})).length >0;
    }

    res.render('profilePage',{
        user:user,
        posts:posts
    });
}

exports.getSearchPage= async(req,res)=>{

    res.render('searchpage',{
        users:[],
        followers:[]
    });
}

exports.postSearchPage=async(req,res)=>{

    const search=req.body.search;

    const all=await Promise.all([
        UsersDB.find({ username: new RegExp(search, 'i') , _id:{$ne:req.session.userID}}),
        followsDB.find({followerID:req.session.userID},{followedID:true})
    ])


    const users=all[0];
    const followers=all[1];



    //optimize O(N*M)
    for(let user of users)
    {
        for(let follower of followers)
        {
            if(follower.followedID === user._id.toString())
            {
                user.followed=true;
                break;
            }
        }
    }


    res.render('searchpage', {
       users :users
    });
}

exports.postAddPost=async(req,res,next)=>{
    req.body.authorID=req.session.userID;
    req.body.likecount=0;
    req.body.commentcount=0;
    if(req.file)
        req.body.img=req.file.path;

    const addedPost=new postsDB(req.body);
    await addedPost.save().then(()=>{
        //console.log(addedpost)
        res.redirect('/home');
    })
}

exports.postFollow=(req,res)=>{
    const followedID=req.body.userID;

    const followEntry=new followsDB({followerID:req.session.userID,followedID:followedID});
    followEntry.save().then(()=>{
        res.json('followed');
    })
}

exports.postUnfollow=(req,res)=>{
    const followedID=req.body.userID;

    followsDB.findOneAndDelete({followerID:req.session.userID,followedID:followedID}).then(()=>{
        res.json('user unfollowed');
    })

    
}
exports.postlike=async(req,res)=>
{
    const userid=req.session.userID;
    const postid=req.body.postID;

    const addlike = new likesDB({userID:userid,postID:postid});
    addlike.save();
    const post=await postsDB.findById(postid);
    post.likecount++;
    res.json({likecount:post.likecount})
    post.save(); 
    
}
exports.postunlike=async(req,res)=>
{
    const userid=req.session.userID;
    const postid=req.body.postID;
    postsDB.updateOne({_id:postid},{ $dec: { likecount: 1 }});
    likesDB.findOneAndDelete({userID:userid,postID:postid}).then(()=>console.log('deleted like'));

    const post=await postsDB.findById(postid);
    post.likecount--;
    res.json({likecount:post.likecount})
    post.save(); 
}

exports.getComments=async(req,res)=>{
    const postID=req.params.ID;
    const lastcommentsID=req.params.lastcommetnID;
    let comments; 
    if(lastcommentsID === '0')
        comments=await commentsDB.find({postID:postID}).sort({_id:-1}).limit(4);
    else
        comments=await commentsDB.find({_id:{$lt:lastcommentsID},postID:postID}).sort({_id:-1}).limit(4);

    let all=await Promise.all([
        UsersDB.findById(comments[0]?.userID),
        UsersDB.findById(comments[1]?.userID),
        UsersDB.findById(comments[2]?.userID),
        UsersDB.findById(comments[3]?.userID),
        postsDB.findById(postID)
    ]);
    
    res.json({comments:comments,
        users:all,
        commentcount:all[4].commentcount,
        lastcommentsID:comments[comments.length-1]?._id || lastcommentsID
    });
}

exports.getEditProfile= async(req,res)=>{
    const user=await UsersDB.findById(req.session.userID);
    res.render('editProfile',{
        user:user
    });
}

exports.postUpdateprofile=async(req,res)=>{
    const img=req.file;
    const username=req.body.username;
    await UsersDB.updateOne({_id:req.session.userID},{profilepicture:img.path,username:username});
    req.session.profilepicture=img.path;
    req.session.save(()=>{
        res.redirect('/profile');
    })
}

exports.postComment= async(req,res)=>{
    console.log('worked');
    console.log(req.body);
    const addcomment= new commentsDB(req.body);
    const postID=req.body.postID;
    const post=await postsDB.findById(postID);
    addcomment.save().then(()=>
    {
        post.commentcount++;
        res.json({commentcount:post.commentcount});
        post.save();
    })   
}


exports.getloadposts=async(req,res)=>{
    const lastpostID = req.params.lastpostID;
    const limit = 4;
    let followers=await followsDB.find({followerID:req.session.userID});
    
    followers=followers.map(user=>user.followedID);
    followers.push(req.session.userID);
    //filterStart

    // let viewedposts=await viewsDB.find({userID:req.session.userID}).select('postID');
    // viewedposts=viewedposts.map(post=>post.postID);
    const posts=await postsDB.find({_id:{$lt : lastpostID},authorID:{$in:followers}}).sort({ _id: -1 }).limit(limit);
    // console.log(posts);
    //filterEnd
    const users=await Promise.all([
        UsersDB.findById(posts[0]?.authorID),
        UsersDB.findById(posts[1]?.authorID),
        UsersDB.findById(posts[2]?.authorID),
        UsersDB.findById(posts[3]?.authorID)
    ]);
    
    let authordata=[];
    for(let i=0;i<Math.min(4,posts.length);i++)
    {
        // const isliked=(await likesDB.find({postID:post._id,userID:req.session.userID})).length > 0;
        const isliked=false;
        authordata.push({authorname:users[i].username,authorprofilepicture:users[i].profilepicture,isliked:isliked})
    }
    res.json({
        posts:posts,
        user:req.session.userID,
        authordata:authordata,
        lastpostID:posts[posts.length-1]?._id || lastpostID
    });

}

exports.getseeprofile=async(req,res)=>
{
    userid=req.params.ID;
    //console.log(userid);
    user=await UsersDB.findById(userid);
    console.log(user);
    const posts=await postsDB.find({authorID:user._id});
    for(let post of posts)
        {
            post.isliked=(await likesDB.find({userID:user._id,postID:post._id})).length >0;
        }

    res.render('seeprofile',{
        user:user,
        posts:posts
    });
    

}