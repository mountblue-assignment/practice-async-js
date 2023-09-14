const fs=require('fs');


function readFile(path){

return new Promise((resolve,reject)=>{

    fs.readFile(path,'utf-8',(error,data)=>{
         
        if(error){
          reject(error);
        }
        else{
            resolve(data);
        }
        // console.log('SuccessFully Read !');
        // console.log(data);
        // return data;

    })
})
    
}

function writeFile(path,content){

    return new Promise((resolve,reject)=>{
        fs.writeFile(path,content,'utf-8',(error)=>{
            if(error){
               reject(error);
            }
            else{
                resolve(path);
            }
       })
    })
    
}

function appendNewLineToFile(path,line){
   
    return new Promise((resolve,reject)=>{
         const content=`${line.trim()}\n`;
          fs.appendFile(path,content,'utf-8',(error)=>{
            if(error){
                reject(error);
            }
            else{
                // console.log('appended !');
                resolve(content);
            }
          })
    })
}


 function deleteAllFilesConcurrently(filePathNames){
        
    let deleteAllFilesPromises=[];
    return new Promise((resolve,reject)=>{
        filePathNames.forEach((filePath)=>{
            if(filePath){
                const eachFilePromise=new Promise((resolveFile,rejectFile)=>{
                    fs.unlink(filePath,(error)=>{
                        if(error){
                            rejectFile(error);
                        }
                        else{
                            resolveFile();
                        }
                    })
                })
    
                deleteAllFilesPromises.push(eachFilePromise);
            }
       })
    

       Promise.all(deleteAllFilesPromises)
       .then(()=>{
          resolve('All Files are deleted !');
       })
       .catch((error)=>{
          reject(error);
       });
    })
       
    
    
}

async function main(){

    try{

     const data= await readFile('./data/lipsum.txt');
    //  console.log(data);
     const dataUpper=data.toUpperCase();
    //  console.log(dataUpper);
    
      const createdMsg=await writeFile('./output/uppercase.txt',dataUpper);
      console.log('SuccessFully created : ',createdMsg);

      const appendedLine=await appendNewLineToFile('./output/filenames.txt','./output/uppercase.txt');
      console.log('appendLine: ',appendedLine);

      const uppercaseDataReadFromFile = await readFile('./output/uppercase.txt');
      const lowercaseData= uppercaseDataReadFromFile.toLowerCase();
    //   console.log(lowercaseData);

      const sentences=lowercaseData.split('. ');
       
      const sentencesFilePromises= sentences.map((sentence,index)=>{
           return writeFile(`./output/${index}.txt`,sentence);
      });
      const sentenceFilePaths= await Promise.all(sentencesFilePromises);
      console.log('SentencesFilePaths',sentenceFilePaths);

     await sentenceFilePaths.map((path)=>{
        return appendNewLineToFile('./output/filenames.txt',path);
     })
     console.log("sentence files appended to filenames.txt");


// Read the new files, sort the content, write it out to a new file, called sorted.txt. 
     const sentencesFileDataPromises=sentenceFilePaths.map((path)=>{
       return readFile(path);
     })
     const sentencesFileData=await Promise.all(sentencesFileDataPromises);
     console.log('SentencesFileData : ',sentencesFileData);
      

     sentencesFileData.forEach(async (sentence)=>{
         let  sortedContent=sentence.trim().split(' ').sort().join(' ');
          await appendNewLineToFile('./output/sorted.txt',sortedContent);
     })

    //  Store the name of the new file in filenames.txt
       
      await appendNewLineToFile('./output/filenames.txt','./output/sorted.txt');
     
    //   Read the contents of filenames.txt and delete all the new files that are mentioned in that list concurrently.

      const filenamesFilePaths=await readFile('./output/filenames.txt');
       console.log("filenames Content",filenamesFilePaths.split('\n'));
     
       const deletedAllFilesMsg=await deleteAllFilesConcurrently(filenamesFilePaths.split('\n'));
       console.log(deletedAllFilesMsg);
    }
    catch(error){
        console.log('Error: ',error);
    }
}

main();