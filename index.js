const express=require("express");
const fs=require("fs");
const path=require("path");

const app=express();

app.use(express.json());
const datapth="./data.json";

const readData=()=>{
try{
    const data=fs.readFileSync(datapth,"utf8");
    return JSON.parse(data);
}catch(error){
    console.error("error reading data.json",error.message);
    return [];
}};

const writeData=(data)=>{
try{
    fs.writeFileSync(datapth,JSON.stringify(data,null,2),"utf8");
}catch(error){
    console.error("error writing to data.json",error.message);
}};

app.get("/books",(req,res)=>{
    const books=readData();
    res.json(books);
});

app.get("/books/:id",(req,res)=>{
    const books=readData();
    const book=books.find(i=>i.id==req.params.id);
    if(book){
        res.json(book);
    }else{
        res.status(404).json({message:"book not found"});
    }
});

app.post("/books",(req,res)=>{
    let books=readData();
    const newBook=req.body;
    if(!newBook.id||!newBook.title){
        return res.status(400).json({message:"incomplete book info"});
    }
    if(books.some(book=>book.id==newBook.id)){
        return res.status(409).json({message:"duplicate id not allowed"});
    }
    books.push(newBook);
    writeData(books);
    res.status(201).json(newBook);
});

app.put("/books/:id",(req,res)=>{
    let books=readData();
    const bookID=req.params.id;
    const newData=req.body;
    const index=books.findIndex(i=>i.id==bookID);
    if(index!=-1){
        books[index]={...books[index],...newData,id:bookID};
        writeData(books);
        res.json(books[index]);
    }else{
        res.status(404).json({message:"book not found"});
    }
});

app.delete("/books/:id",(req,res)=>{
    let books=readData();
    const bookID=req.params.id;
    const len=books.length;
    books=books.filter(i=>i.id!=bookID);
    writeData(books)
    if(books.length<len){
        return res.status(204).send();
    }else{
        res.status(404).json({message:"book not found"});
    }
});

app.listen(3000,()=>{
    console.log("server is running");
});