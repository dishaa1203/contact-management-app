const mongoose=require ("mongoose")

const userSchema =new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Please add the user name"]
    },
    email:{
        type:String,
        required:[true,"Please add the email address"],
        unique:[true,"email address alrady taken"]
        
    },
    password:{
        type:String,
        required:[true,"Please add the user password"]
    }
      
    

},

{
     timestamps:true,
    }  
)

module.exports = mongoose.model("User",userSchema)