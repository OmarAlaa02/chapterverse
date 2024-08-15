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

    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    let followers=await followsDB.find({followerID:req.session.userID});
    
    followers=followers.map(user=>user.followedID);
    followers.push(req.session.userID);

    let viewedposts=await viewsDB.find({userID:req.session.userID});
    viewedposts=viewedposts.map(post=>post.postID);
    const posts=await postsDB.find({_id:{$nin :viewedposts},authorID:{$in:followers}}).limit(limit);

    //will lower complexity after pagination
    for(let post of posts)
    {
        //add view
        const viewEntry=new viewsDB({userID:req.session.userID , postID:post._id});
        //optional await
        viewEntry.save();

        const user=await UsersDB.findById(post.authorID);
        const isliked=(await likesDB.find({postID:post._id,userID:req.session.userID})).length > 0;
        post.authorname=user.username;
        post.authorprofilepicture=user.profilepicture;
        post.isliked=isliked;
    }

    res.render('homePage',{
        posts:posts,
        user:req.session.userID
    });

    

}



exports.getAddPost=(req,res)=>{
    res.render('addpostPage');
}


exports.getProfilePage=async(req,res)=>{

    const user=await UsersDB.findById(req.session.userID);
    const posts=await postsDB.find({authorID:user._id});
    
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

    search=req.body.search;
    const users=await UsersDB.find({ username: new RegExp(search, 'i') , _id:{$ne:req.session.userID}}) ;
    const followers=await followsDB.find({followerID:req.session.userID},{followedID:true});

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
    addedPost.save().then(()=>{
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
    const page=req.params.page;
    const comments=await commentsDB.find({postID:postID}).skip(page * 4).limit(4);
    let users=[];
    for(let comment of comments)
    {
        users.push(await UsersDB.findById(comment.userID));
    }
    res.json({comments,users});
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
    const page = parseInt(req.query.page)||1;
    const limit = 4;
    const skip = (page - 1) * limit;
    console.log({"page":page});
    let followers=await followsDB.find({followerID:req.session.userID});
    
    followers=followers.map(user=>user.followedID);
    followers.push(req.session.userID);
    //filterStart

    let viewedposts=await viewsDB.find({userID:req.session.userID}).select('postID');
    viewedposts=viewedposts.map(post=>post.postID);
    const posts=await postsDB.find({_id:{$nin :viewedposts},authorID:{$in:followers}}).limit(limit);

    //filterEnd
    let authordata=[];
    for(let post of posts)
    {
        //add view
        const viewEntry=new viewsDB({userID:req.session.userID , postID:post._id});
        //optional await
        viewEntry.save();

        const user=await UsersDB.findById(post.authorID);
        const isliked=(await likesDB.find({postID:post._id,userID:req.session.userID})).length > 0;
        authordata.push({authorname:user.username,authorprofilepicture:user.profilepicture,isliked:isliked})
    }
    res.json({
        posts:posts,
        user:req.session.userID,
        authordata:authordata,
        page:page
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