const Itemschema=require('../model/schema.js');
const { it } = require('node:test');

const create=async (req,res)=>{
    try { 
        const {CultureName,CultureDescription,Region,Significance,WeirdnessLevel}=req.body;
        if (  !CultureName || !CultureDescription || !Region || !Significance || !WeirdnessLevel){
            return res.status(400).json({message:" All fields are required"})

        }
        const item =new Itemschema({CultureName,CultureDescription,Region,Significance,WeirdnessLevel})
        await item.save()
         res.json(item)
    }
    catch(error) {
        console.error("Error creating item:", error);  
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
    
};


const fetch =async (req,res)=>{
    const item = await Itemschema.find({})
    res.json(item)
}


const update=async (req,res)=>{
    try {
      const id =req.params.id
      const item= await Itemschema.findOne({_id:id})
      if  (!item){
         return res.status(404).item.json({message:"not find"})
      }
      const ItemUpt=await Itemschema.findByIdAndUpdate(id , req.body, {new:true}

      )

      res.json({message:"updated successfully"})
    }

    catch(error) {
        console.error("Error updating item:", error);  
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

}


const Delete=async (req,res)=>{
    try {
        // const id =req.params.id
        const item= await Itemschema.findByIdAndDelete({_id:req.params.id});
        // await Itemschema.findByIdAndDelete()
        if  (!item){
           return res.status(404).item.json({message:"not find"})
        }
        res.json({message:"deleted successfully"})
      }
  
     catch (err) {
        res.status(500).json({err:" internal server error"})
    }
  
}

module.exports={create,fetch,update,Delete}