<script lang="ts">
  import "../global.css";
  import Papa from "papaparse";
  import { createTimesheetOutput1, createTimesheetOutput2 } from "./parseTimeSheet";
  import { checkColumns, checkTimesheetFile } from "./checkUploadFile";
  import logo from "../logo.png";
  import { read, utils, writeFileXLSX } from "xlsx";
  
  let parsedData = []; // Define a variable to store the parsed data

  let expensehref = "";
  let timesheethref = "";
  let timesheetMidhref = "";

  let expenseMessage = "";
  let timesheetMessage = "";
  let timesheetMidName="InvalidOutput"

  let expenseReady = false;
  let expenseFile: HTMLInputElement;
  let expenseLookupFile: HTMLInputElement;

  let timesheetReady = false;
  let timesheetMidReady = false;
  let timesheetFile: HTMLInputElement;
  let timesheetLookupFile: HTMLInputElement;

  let expenseErrorMessage = "";
  let timesheetErrorMessage = "";

  $: timesheet = false;
  $: expense = false;

  let REBnum: string = "";
  let ODnum: string = "";
  let selected="";


  const requiredTimesheetCols1 = [
    "Nom complet",
    "Code Donateur",
    "Code Projects",
    "Nom Projects",
    "Code Country",
    "Nom Coût horaire",
    "Temps imputé (Heures)",
  ];

  const requiredTimesheetCols2 = ["Nom complet", "Code Donateur", "Code Projects", "Nom Projects", "Code Country",	"Analysis code", "Nom Coût horaire", "Temps imputé (Heures)", "Total", "Description"]		


  const requiredExpenseCols = [
    "Date",
    "NDF #",
    "Staff",
    "Expense Account",
    "DESC 1",
    "DESC 2",
    "Donors",
    "Project",
    "Country",
    "Local currency",
    "Local amount",
    "CHF Amount",
  ];

  function pullDateTimesheet1(filename: string) {
  //  console.log("in parse date timesheet.  filename is ", filename);
  let date = filename.split("_")[5];
  //  console.log("date is ", date);
  let mydate = date.split(".");
  return mydate[2] + "." + mydate[1] + "." + mydate[0];
}

  async function create_lookup(lookupFile: HTMLInputElement) {
    console.log("In create_lookup", lookupFile);
    Papa.parse(lookupFile, {
      complete: function (results) {
        console.log("lookup", results.data);
      },
    });
  }

  async function runPapaParse(
    file: File,
    lookupTable: string[],
    requiredCols: string[],
    myFunction: any,
    counter: string
  ) {
    console.log("In runPapaParse", file);
    let errorMessage = "";
    let csvReady = false;
    let href = "";
    let message = "";
    Papa.parse(file, {
      header: true,

      complete: async function (results) {
        parsedData = results.data;
        const fields = results.meta.fields;
        const temp = checkColumns(fields, requiredCols);
        errorMessage = temp.errorMessage;
        const output = await myFunction(
          parsedData,
          lookupTable,
          file.name,
          counter
        );
        csvReady = output.csvReady;
        href = output.href;
        message = output.message;
        console.log("csvReady in papaparse command", csvReady);
      },
      error: function (error) {
        errorMessage = error.message;
        console.log(error.message);
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      errorMessage,
      csvReady,
      href,
      message,
    };
  }

  async function runTimesheetUpload1(
    timesheetFile: HTMLInputElement,
  ) {
    console.log("In runTimesheetUpload1", timesheetFile);
    if (!timesheetFile || !timesheetFile.files) {
      timesheetMessage = "Please upload a file";
      return;
    }
    const file = timesheetFile.files[0];
    console.log("file", file);
    const response = await checkTimesheetFile(file);
    timesheetErrorMessage = response.errorMessage;
    timesheetMidName = pullDateTimesheet1(file.name) + "_timesheetMidpoint.csv"

    const timesheetLookupTable:string[]=[]
      const fileExtension = response.fileExtension;
      console.log("fileExtension", fileExtension);

      if (fileExtension.includes("csv")) {
        const paparesponse = await runPapaParse(
          file,
          timesheetLookupTable,
          requiredTimesheetCols1,
          createTimesheetOutput1,
          0
        );
        console.log("paparesponse", paparesponse);
        timesheetErrorMessage = paparesponse.errorMessage;
        timesheetReady = paparesponse.csvReady;
        timesheethref = paparesponse.href;
        timesheetMessage = paparesponse.message;
      } else {
        timesheetMessage = "Please upload a CSV file";
      }
    }

  async function runTimesheetUpload2(
    timesheetFile: HTMLInputElement,
    timesheetLookupFile: HTMLInputElement
  ) {
    console.log("In runTimesheetUpload", timesheetFile, REBnum);
    if (!timesheetFile || !timesheetFile.files) {
      timesheetMessage = "Please upload a file";
      return;
    }
    const file = timesheetFile.files[0];
    console.log("file", file);
    const response = await checkTimesheetFile(file);
    timesheetErrorMessage = response.errorMessage;

    if (!timesheetLookupFile || !timesheetLookupFile.files) {
      timesheetMessage = "Please upload a file";
        return;
      }

    const timesheetLookupFileInput = timesheetLookupFile.files[0];
    console.log("timesheetLookupFileInput", timesheetLookupFileInput);
    const timesheetLookupTable = await create_lookup(timesheetLookupFileInput);
    console.log("timesheetLookupTable", timesheetLookupTable);

      const fileExtension = response.fileExtension;
      console.log("fileExtension", fileExtension);

      if (fileExtension.includes("csv")) {
        const paparesponse = await runPapaParse(
          file,
          timesheetLookupTable,
          requiredTimesheetCols2,
          createTimesheetOutput2,
          REBnum
        );
        console.log("paparesponse", paparesponse);
        timesheetErrorMessage = paparesponse.errorMessage;
        timesheetReady = paparesponse.csvReady;
        timesheethref = paparesponse.href;
        timesheetMessage = paparesponse.message;
      } else {
        timesheetMessage = "Please upload a CSV file";
      }
    }
  

  async function runExpenseUpload(
    expenseFile: HTMLInputElement,
    expenseLookupFile: HTMLInputElement,
    ODnum: string
  ) {
    console.log("In expensesheetUpload", expenseFile, ODnum);
    if (expenseFile && expenseFile.files) {
      const file = expenseFile.files[0];
      console.log("file", file);
      const response = await checkexpenseFile(file);
      expenseErrorMessage = response.errorMessage;
      const fileExtension = response.fileExtension;
      console.log("fileExtension", fileExtension);

      if (fileExtension.includes("csv")) {
        const paparesponse = await runPapaParse(
          file,
          expenseLookupFile,
          requiredExpenseCols,
          createExpenseOutput,
          REBnum
        );
        expenseErrorMessage = paparesponse.errorMessage;
        if (paparesponse?.csvReady) {
          expenseReady = paparesponse.csvReady;
          console.log("expenseReady", expenseReady);
          expensehref = paparesponse.href;
          expenseMessage = paparesponse.message;
        }
      } else {
        expenseMessage = "Please upload a CSV file";
      }
    } else {
      expenseMessage = "Please upload a file";
    }
  }
  /*
  // usage: file_to_wb(file, function(wb) { // wb is a workbook object });
  function file_to_wb(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      // e.target.result is an ArrayBuffer
      callback(read(e.target.result));
    };
    reader.readAsArrayBuffer(file);
  }
  */


</script>

<main>
  <div class="upperleft">
    <a href="https://tech-aly.com" target="_blank">
      <img src={logo} alt="Tech-aly logo" />
    </a>
  </div>
  <h1>CSV cleanup</h1>

  <h2>What would you like to do today?</h2>
  <input
    type="radio"
    id="timesheet1"
    bind:group={selected}
    name="timesheet1"
    value="timesheet1"
  />
  <label for="timesheet">Process timesheets (step 1)</label>

  <input
    type="radio"
    id="timesheet2"
    bind:group={selected}
    name="timesheet2"
    value="timesheet2"
  />
  <label for="timesheet">Process timesheets (step 2)</label>

  <input
    type="radio"
    id="expense"
    bind:group={selected}
    name="expense"
    value="expense"
  />
  <label for="expense">Process expense reports</label>

  {#if selected == "timesheet1"}
    <div class="box">
      <h2>Timesheet Cleanup</h2>
      <div class="myform">


        <label for="timesheetfile">Timesheet file</label>
        <input bind:this={timesheetFile} type="file" />

      </div>
      <button
        on:click={() => runTimesheetUpload1(timesheetFile)}
        type="submit">Submit</button
      >

      {#if timesheetMessage}
        <p>{timesheetMessage}</p>
      {/if}


      {#if timesheetReady}
        <button
          ><a href={timesheethref} download={timesheetMidName}>Download</a
          ></button
        >
      {/if}
      {#if timesheetErrorMessage}
        <p class="errorMessage">{timesheetErrorMessage}</p>
      {/if}
    </div>
  {/if}


  {#if selected == "timesheet2"}
  <div class="box">
    <h2>Timesheet Cleanup</h2>
    <div class="myform">
      <label for="name"> First REB number</label>
      <input
        type="text"
        id="REBnum"
        bind:value={REBnum}
        name="REBnum"
        required
      />

      <label for="timesheetfile">Timesheet (from step 1) file</label>
      <input bind:this={timesheetFile} type="file" />

      <label for="employeeCodeFile">Employee code lookup</label>
      <input bind:this={timesheetLookupFile} type="file" />
    </div>
    <button
      on:click={() => runTimesheetUpload2(timesheetFile, timesheetLookupFile)}
      type="submit">Submit</button
    >

    {#if timesheetMessage}
      <p>{timesheetMessage}</p>
    {/if}

    {#if timesheetReady}
      <button
        ><a href={timesheethref} download="timesheetReport.csv">Download</a
        ></button
      >
    {/if}
    {#if timesheetErrorMessage}
      <p class="errorMessage">{timesheetErrorMessage}</p>
    {/if}
  </div>
{/if}

  {#if selected == "expense"}
    <div class="box">
      <h2>Expense Form Cleanup</h2>
      <div class="myform">
        <label for="name"> First OD number</label>
        <input
          type="text"
          id="ODnum"
          bind:value={ODnum}
          name="ODnum"
          required
        />

        <label for="expensefile">Expense file</label>
        <input bind:this={expenseFile} type="file" />

        <label for="expenseLookupFile">Employee code lookup</label>
        <input bind:this={expenseLookupFile} type="file" />
      </div>
      <button
        on:click={() => runExpenseUpload(expenseFile, expenseLookupFile, ODnum)}
        type="submit">Submit</button
      >

      {#if expenseMessage}
        <p>{expenseMessage}</p>
      {/if}

      {#if expenseReady}
        <button
          ><a href={expensehref} download="expenseReport.csv">Download</a
          ></button
        >
      {/if}
      {#if expenseErrorMessage}
        <p class="errorMessage">{expenseErrorMessage}</p>
      {/if}
    </div>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;

    font-family:
      "Rubik",
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      sans-serif;
    color: #ffa55a;
  }

  h1 {
    color: darkcyan;
    font-size: 2em;
    font-weight: 400;
  }
  h2 {
    color: darkcyan;
    font-size: 1.5em;
    font-weight: 300;
  }
  p {
    font-size: 1.2em;
    color: #ffa55a;
  }

  @media (max-width: 550px) {
    h1 {
      margin-top: 80px;
    }
  }
  .upperleft {
    float: left;
    position: absolute;
    margin-left: 0;
  }
  img {
    height: 60px;
  }
  .errorMessage {
    color: red;
  }
  .description {
    width: 300px;
  }
  .myform {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: fit-content;
    margin: auto;
    margin-top: 20px;
    justify-items: left;
  }
  .box {
    border: 1px solid #ffa55a;
    padding: 10px;
    margin: auto;
    margin-top: 20px;
    width: fit-content;
  }
</style>
