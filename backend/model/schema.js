const mongoose=require('mongoose');

const Itemschema=new mongoose.Schema({
    
    CultureName:{
        type:String,
        require:true,
    },
    CultureDescription:{
        type:String,
        require:true,
    },
    Region:{
        type:String,
        require:true,
    },
    Significance:{
        type:String,
        require:true,
    },
    WeirdnessLevel:{
        type:String,
        require:true,
    }
})

module.exports=mongoose.model('Item',Itemschema);