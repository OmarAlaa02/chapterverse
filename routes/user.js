const router=require('express').Router();
const multer=require('multer');

const userController=require('../controllers/users');

const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
});

const fileFilter=(req,file,cb)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg')
    {
        cb(null,true);
    }
    else
    {
        cb(null,false);
    }
}

const upload=multer({storage:fileStorage,fileFilter:fileFilter});

router.get('/',userController.getSigninPage);
router.post('/signin',userController.postsignin);

router.get('/signup',userController.getSignupPage);
router.post('/signup',userController.postSignup);

router.get('/home',userController.getHomePage);
router.get('/search',userController.getSearchPage);
router.post('/search',userController.postSearchPage);

router.post('/follow',userController.postFollow);
router.post('/unfollow',userController.postUnfollow);

router.get('/addpost',userController.getAddPost);
router.post('/addpost',upload.single('post-image'),userController.postAddPost);


router.get('/profile',userController.getProfilePage);
router.post('/like',userController.postlike);
router.post('/unlike',userController.postunlike);

router.get('/getComments/:ID/:page',userController.getComments);

router.get('getHomePage',userController.getHomePage);
router.get('/editProfile',userController.getEditProfile);

router.post('/updateProfile',upload.single('profile_picture'),userController.postUpdateprofile);
router.post('/postComment',userController.postComment);
router.get('/loadposts',userController.getloadposts);
module.exports=router;