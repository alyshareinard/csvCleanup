<script>
  import "../global.css";
  import PapaParse from "papaparse";
  import logo from "../logo.png";
  import { read, utils, writeFileXLSX } from "xlsx";

  let errorMessage;
  let desc1;
  let desc2;

  let longDescription = false;
  let description = "";

  let message = "";
  let REBnum = "";
  let href = "";

  let myfile;

  let csvOutput;
  let total = 0;
  let allowedFileExtensions = ["csv", "xlsx"];

  let employeeLookup = {
    "Luce Ahouangnimon": {
      nameval: "AHOUANGNIMON L.",
      currency: "CHF",
      currency2: "",
      code: "51000",
    },
    "Linda Asamoah": {
      nameval: "ASAMOAH LINDA",
      currency: "CHF",
      currency2: "",
      code: "51000",
    },
    "Juvenal Babona": {
      nameval: "BABONA MIHIGO J",
      currency: "CHF",
      currency2: "",
      code: "50000",
    },
    "Barbara Bernath": {
      nameval: "BERNATH-THEVENO",
      currency: "CHF",
      currency2: "",
      code: "51000",
    },
    "Benjamin Buckland": {
      nameval: "BUCKLAND BENJAM",
      currency: "CHF",
      currency2: "",
      code: "51000",
    },
    "Margaret Bünzli": {
      nameval: "BUNZLI MARGARET",
      currency: "CHF",
      currency2: "",
      code: "51000",
    },
    "Valentina Cadelo": {
      nameval: "CADELO VALENTIN",
      currency: "CHF",
      currency2: "",
      code: "51000",
    },
    "Emilio Congco": {
      nameval: "CONGCO EMILIO",
      currency: "CHF",
      currency2: "",
      code: "51000",
    },
    "Veronica Filippeschi": {
      nameval: "FILIPPESCHI VER",
      currency: "CHF",
      currency2: "",
      code: "51000",
    },
    "Manachaya Yankittikul": {
      nameval: "MANACHAYA YANKI",
      currency: "EUR",
      currency2: "EUR",
      code: "50000",
    },
    "Sara Vera Lopez": {
      nameval: "SARA LOPEZ",
      currency: "USD",
      currency2: "USD",
      code: "50000",
    },
    "Nid Satjipanon": {
      nameval: "SATJIPANON N.",
      currency: "CHF",
      currency2: "",
      code: "50000",
    },
    "Sylvia Dias": {
      nameval: "SYLVIA DIAS",
      currency: "CHF",
      currency2: "",
      code: "50000",
    },
    "Cécile Trochu Grasso": {
      nameval: "TROCHU GRASSO C",
      currency: "CHF",
      currency2: "",
      code: "50000",
    },
    "Jasmine Zik-Ikeorha": {
      nameval: "ZIK-IKEORHA CHI",
      currency: "CHF",
      currency2: "",
      code: "51000",
    },
  };

  // usage: file_to_wb(file, function(wb) { /* wb is a workbook object */ });
  function file_to_wb(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      /* e.target.result is an ArrayBuffer */
      callback(read(e.target.result));
    };
    reader.readAsArrayBuffer(file);
  }

  function parseDate(filename) {
    let date = filename.split("_")[5];
    console.log("date is ", date);
    let mydate = date.split(".");
    return mydate[2] + "." + mydate[1] + "." + mydate[0];
  }
  async function create_output(data, filename) {
    //filter out empty lines
    console.log("data is ", data);
    //      data = data.filter(function (el) {
    //        return el.Date != "";
    //      });
    //group data by ndf and then sort by date
    //      data.sort(function (a, b) {
    //        return getNDF(a) - getNDF(b) || parseDate(a.Date) - parseDate(b.Date);
    //      });
    const mydate = parseDate(filename);

    function expenseLine(i, amount) {
      let employee = employeeLookup[data[i]["Nom complet"]];
      console.log(employee);
      if (employee == "" || employee == undefined) {
        console.log("employee not found");
        return [
          mydate,
          "REB-" + REBnum,
          "",
          "",
          "",
          "",
          data[i]["Nom complet"] +
            "_" +
            String(Math.round(Number(data[i]["Temps imputé (Heures)"]))) +
            "hr",
          "",
          data[i]["Code Donateur"] +
            data[i]["Code Projects"] +
            "/" +
            data[i]["Code Country"],
          "",
          "",
          amount,
        ];
      } else {
        
        return [
          mydate,
          "REB-" + REBnum,
          employee.code,
          "",
          "",
          "",
          data[i]["Nom complet"] +
            "_" +
            String(Math.round(Number(data[i]["Temps imputé (Heures)"]))) +
            "hr",
          "",
          data[i]["Code Donateur"] +
            data[i]["Code Projects"] +
            "/" +
            data[i]["Code Country"],
          "",
          "",
          amount,
        ];
      }
    }
    function summaryLine(i, amount) {
      let employee = employeeLookup[data[i]["Nom complet"]];
      console.log(employee);
      if (employee == "" || employee == undefined) {
        console.log("employee not found");
        return [
          mydate,
          "REB-" + REBnum,
          "",
          "",
          "",
          "",
          data[i]["Nom complet"] +
            "_" +
            String(Math.round(Number(data[i]["Temps imputé (Heures)"]))) +
            "hr",
          "",
          data[i]["Code Donateur"] +
            data[i]["Code Projects"] +
            "/" +
            data[i]["Code Country"],
          "",
          "",
          amount,
        ];
      } else {
        
        return [
          mydate,
          "REB-" + REBnum,
          employee.code,
          "",
          "",
          "",
          data[i]["Nom complet"] +
            "_" +
            String(Math.round(Number(data[i]["Temps imputé (Heures)"]))) +
            "hr",
          "",
          data[i]["Code Donateur"] +
            data[i]["Code Projects"] +
            "/" +
            data[i]["Code Country"],
          "",
          "",
          amount,
        ];
      } /*
        } else {
          console.log("supplier: ", supplier)
          console.log("supplier...", supplier.nameval)
          console.log("supplier...nameval ", supplier['nameval'])
          return [
            mydate,
            "REB-" + REBnum,
            "20000",
            supplier.nameval,
            supplier.currency,
            data[i - 1]["NDF #"],
            data[i - 1]["DESC 1"],
            data[i - 1]["NDF #"],
            "",
            supplier.currency2,
            "",
            (-1 * Math.round(total * 100)) / 100,
          ];
        }*/
    }

    const output = [];
    REBnum = parseInt(REBnum);

    for (let i = 0; i < data.length; i++) {
      const rawamount =
        Number(data[i]["Nom Coût horaire"]) *
        Number(data[i]["Temps imputé (Heures)"]);
      const amount = Math.round(rawamount * 100) / 100;
      output.push(expenseLine(i, String(amount)));
      const negamount = amount * -1;
      output.push(summaryLine(i, String(negamount)));
      //        console.log(output);
      REBnum += 1;
    }

    csvOutput = PapaParse.unparse({
      data: output,
      fields: ["1", "2", "3", "17", "18", "19", "5", "6", "11", "4", "8", "9"],
    });
    message = "Your CSV is ready!";
    href = encodeURI("data:text/csv;charset=utf-8," + csvOutput);
  }
  async function uploadFile(myfile) {
    const file = myfile.files[0];
    console.log("file is ", file);
    console.log("file array buffer is ", file.arrayBuffer());
    const fileExtensionArray = file.type.split("/");
    console.log("fileExtensionArray is ", fileExtensionArray);
    const fileExtension = fileExtensionArray[fileExtensionArray.length - 1];
    console.log("fileExtension is ", fileExtension);
    if (fileExtension.includes("csv")) {
      const csvData = PapaParse.parse(
        file,

        {
          header: true,
          complete: (results) => {
            message = "working...";
            create_output(results.data, file.name);
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
          create_output(results.data);
        },
      });
    } else {
      message = "Not an allowed file type";
    }
  }
</script>

<main>
  <div class="upperleft">
    <a href="https://tech-aly.com" target="_blank">
      <img src={logo} alt="Tech-aly logo" />
    </a>
  </div>
  <h1>Timesheet Cleanup</h1>
  <h2>Let's cleanup those Timesheets!</h2>
  First REB number:
  <input bind:value={REBnum} />
  <br />
  <input bind:this={myfile} on:change={uploadFile(myfile)} type="file" />
  {#if message}
    <p>{message}</p>
  {/if}
  {#if longDescription}
    <input class="description" bind:value={description} type="text" />
    <p>{desc1}<span>{desc2}</span></p>
  {/if}
  {#if csvOutput}
    <button on:click={csvOutput}
      ><a {href} download="output.csv">Download</a></button
    >
  {/if}
  {#if errorMessage}
    <p class="errorMessage">{errorMessage}</p>
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
  p > span {
    color: red;
  }
</style>
