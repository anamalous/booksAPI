const express=require("express");
const mongoose=require("mongoose");

const app=express();

app.use(express.json());

const mongoURI="mongodb://localhost:27017/booksdb";

mongoose.connect(mongoURI).then(()=>{
    console.log("connection successful");
}).catch((error)=>{
    console.error("cannot connect to mongoDB",error);
    process.exit(1);
});

const bookSchema=new mongoose.Schema({
    id:{type:String,required:true, unique:true},
    title:{type:String,required:true},
    author:String,
    price:{type:Number, required:true},
    publishedDate:String,
},{
    timestamps:true
});

const Book=mongoose.model("Book",bookSchema);

app.get("/books", async(req,res)=>{
    try{
        const books=await Book.find({});
        res.json(books);
    }catch(error){
        console.error("book not found",error);
        res.status(500).json({message:"server error fetching items"});
    }
});

app.get("/books/:id",async(req,res)=>{
try{
    const bookID=req.params.id;
    const book=await Book.findOne({id:bookID});
    if(book){
        res.json(book);
    }
    else{
        res.status(404).json({message:"book not found"});
    }
}catch(error){
    console.error("book not found",error);
    res.status(500).json({message:"error fetching book"});
}
});

app.post("/books", async(req,res)=>{
try{
    const newBook=req.body;
    if(!newBook.id||!newBook.title){
        return res.status(400).json({message:"incomplete data"});
    }
    const bookExists=await Book.findOne({id:newBook.id});
    if(bookExists){
        return res.status(409).json({message:"duplicate ID not allowed"});
    }

    const bookAdded=await Book.create(newBook);
    res.status(201).json(bookAdded);
}catch(error){
    console.error("book cannot be added",error);
    res.status(500).json({message:"error adding book"});
}
});

app.put("/books/:id",async(req,res)=>{
try{
    const bookID=req.params.id;  
    const newData=req.body;  
    
    const book=await Book.findOneAndUpdate({id:bookID},newData,{new:true,runValidators:true});
    if(book){
        res.json(book);
    }else{
        res.status(404).json({message:"book not found"});
    }
}catch(error){
    console.error("error updating book data",error);
    if(error.message=="ValidationError"){
        return res.status(400).json({message:error.message});
    }
    res.status(500).json({message:"internal error during book update"});
}
});

app.delete("/books/:id", async(req,res)=>{
try{
    const bookID=req.params.id;
    const isDeleted=await Book.deleteOne({id:bookID});
    if(isDeleted.deletedCount>0){
        res.status(204).send();
    }else{
        res.status(404).json({message:"item not found"});
    }
}catch(error){
    console.error("error deleting book data",error);
    res.status(500).json({message:"internal error while deleting data"});
}
});

app.listen(3000,()=>{
console.log("server is running");
});