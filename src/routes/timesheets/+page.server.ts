import type { PageServerLoad, Actions } from "./$types";
import PapaParse from "papaparse";
import { createTimesheetOutput } from "./parseTimeSheet";
import { fail } from '@sveltejs/kit';
import fs from 'fs';

export async function load() {
  return {};
}


const readCSV = async (filePath) => {
  const csvFile = fs.readFileSync(filePath)
  const csvData = csvFile.toString()  
  return new Promise(resolve => {
    PapaParse.parse(csvData, {
      header: true,
      complete: results => {
        console.log('Complete', results.data.length, 'records.'); 
        resolve(results.data);
      }
    });
  });
};
async function uploadFile(file: File, REBnum: string) {
  console.log("in uploadFile");
  let message = "";
 
  //here is where I can add something to check the file
  console.log("file is ", file);
//  console.log("file array buffer is ", file.arrayBuffer());
  const fileExtensionArray = file.type.split("/");
  console.log("fileExtensionArray is ", fileExtensionArray);
  const fileExtension = fileExtensionArray[fileExtensionArray.length - 1];
  console.log("fileExtension is ", fileExtension);
  if (fileExtension.includes("csv")) {
    let parsedData = await readCSV(file.name); 

    console.log("parsedData is ", parsedData);
    const csvData = PapaParse.parse(
      file,
      {
        header: true,
        complete: (results) => {
          message = "working...";
          createTimesheetOutput(results.data, file.name, REBnum);
        },
      }
    );
  } else if (
    fileExtension.includes(
      "vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
  ) {
    console.log("importng xlsx");
    console.log("file is ", file);
    const workbook = await file.arrayBuffer();
    // console.log("arraybuff is ", arraybuff)
    //const workbook = file_to_wb(file, function(wb) { /* wb is a workbook object */ });
    //        var reader = new FileReader();
    //        const workbook = reader.readAsArrayBuffer(file)
    //        const workbook = read(file.arrayBuffer(), { type: "arraybuffer" });
    console.log("we have a workbook");
    console.log("workbook is ", workbook);
    const testing = PapaParse.parse(file);
    console.log("testing is ", testing);
    const firstSheetName = workbook.SheetNames[0];
    console.log("firstSheetName is ", firstSheetName);
    const worksheet = workbook.Sheets[firstSheetName];
    const csvData = PapaParse.unparse(worksheet);
    console.log("csvData looks like this: ", csvData);
    const results = PapaParse.parse(csvData, {
      header: true,
      complete: (results) => {
        message = "working...";
        console.log(results.data);
        createTimesheetOutput(results.data, file.name, REBnum);
      },
    });
  } else {
    message = "Not an allowed file type";
  }
}

export const actions: Actions = {
  processTimesheets: async ({ request }) => {


    const formData = Object.fromEntries(await request.formData());
 
    if (
      !(formData.myfile as File).name ||
      (formData.myfile as File).name === 'undefined'
    ) {
      fail(400, {
        error: true,
        message: 'You must provide a file to upload'
      });
    }
 
    const { myfile, REBnum } = formData as { myfile: File, REBnum: string };


/*

    console.log("in processTimesheets action");
    const formData = await request.formData();
    console.log("formData is ", formData);
    const myfile = formData.get('myfile');
    console.log("myfile is ", myfile);
    console.log("type of myfile is ", typeof myfile);
    const file = myfile.files[0];
    const REBnum = formData.get('REBnum') as string;*/
    uploadFile(myfile, REBnum);
  },
};
