<script>
  import "./global.css";
  import PapaParse from "papaparse";
  import logo from "./logo.png";
  let errorMessage;
  let phrase_options = [
    "Looking good today!",
    "You're awesome",
    "Working hard or hardly working, amirite?",
    "Keep up the good work!",
    "Work work, money made champagne life, high on display",
    "Let's work, be proud, stand tall, touch the clouds",
    "Never done, never done, A girl's work is never done",
    "Taking care of business and working overtime, work out",
    "My baby takes the morning train",
    "giving food to the hungry, hope to the needy",
    "Pretend the dove from above is a dragon and your feet are on fire",
  ];

  let phrase =
    phrase_options[Math.floor(Math.random() * phrase_options.length)];
  let message = "";
  let ODnum = "";
  let href = "";

  let myfile;

  let csvOutput;
  let total = 0;
  let allowedFileExtensions = ["csv"];

  let supplierLookup = {
	"Ahouangnimon Luce": {nameval:"AHOUANGNIMON L.", currency:"CHF", currency2:""},
	"Asamoah Linda"	: {nameval:"ASAMOAH LINDA", currency:"CHF", currency2:""},
	"Babona Juvenal"	: {nameval:"BABONA MIHIGO J", currency:"CHF", currency2:""},
	"Bernath Barbara"	: {nameval:"BERNATH-THEVENO", currency:"CHF", currency2:""},
	"Buckland Benjamin"	: {nameval:"BUCKLAND BENJAM", currency:"CHF", currency2:""},
	"Cadelo Valentina"	: {nameval:"CADELO VALENTIN", currency:"CHF", currency2:""},
	"Filippeschi Veronica"	: {nameval:"FILIPPESCHI VER", currency:"CHF", currency2:""},
	"Yankittikul Manachaya (Pim)"	: {nameval:"MANACHAYA YANKI", currency:"EUR", currency2:"EUR"},
	"Vera Lopez Sara"	: {nameval:"SARA LOPEZ", currency:"USD", currency2:"USD"},
	"Satjipanon Nid"	: {nameval:"SATJIPANON N.", currency:"CHF", currency2:""},
	"Dias Sylvia"	: {nameval:"SYLVIA DIAS", currency:"CHF", currency2:""},
	"Trochu Grasso Cecile"	: {nameval:"TROCHU GRASSO C", currency:"CHF", currency2:""},
	"Zik-Ikeorha Jasmine"	: {nameval:"ZIK-IKEORHA CHI", currency:"CHF", currency2:""},
}

	




  function lastDayOfMonth(date) {
    
    let mydate = date.split("/");
    let lastdate = new Date(mydate[2], mydate[1], 0);

    return lastdate.getDate() + "/" + mydate[1] + "/" + mydate[2];
  }
  function getNDF(record) {
	let num=0
	
    if (record["NDF #"]) {
      num = record["NDF #"].split("-")[1];
    }
	
    return num;
  }
  function parseDate(date) {
    let mydate = date.split("/");
    return Date.parse(mydate[2] + "/" + mydate[1] + "/" + mydate[0]);
  }
  function create_output(data) {
   
	//filter out empty lines
	data = data.filter(function (el) {
	return el.Date != "" ;
	});
	//group data by ndf and then sort by date
    data.sort(function (a, b) {
      return getNDF(a) - getNDF(b) || parseDate(a.Date) - parseDate(b.Date);
    });
	function expenseLine(i){
		
		return [
          lastDayOfMonth(data[i].Date),
          "OD-" + ODnum,
          data[i]["Expense Account"],
          "",
          "",
          "",
          data[i]["DESC 1"],
          data[i]["DESC 2"],
          data[i]["Donors"] +
            "/" +
            data[i]["Project"] +
            "/" +
            data[i]["Country"],
          "",
          "",
          data[i]["CHF Amount"],
        ]
	}
	function summaryLine(i){
		console.log(data)
		let supplier = supplierLookup[data[i-1]["Staff"]];
		return [
          lastDayOfMonth(data[i - 1].Date),
          "OD-" + ODnum,
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
        ]
	}

    const output = [];
    ODnum = parseInt(ODnum);
    let prevNDF = data[0]["NDF #"];
    let NDF = prevNDF;
    let prevDate = lastDayOfMonth(data[0].Date);
    let date = prevDate;
    for (let i = 0; i < data.length; i++) {
      NDF = data[i]["NDF #"];
      date = lastDayOfMonth(data[i].Date);

      if (NDF != prevNDF || date != prevDate || i==data.length-1) {
        output.push(summaryLine(i));
        ODnum += 1;
        prevNDF = NDF;
        prevDate = date;
        total = 0;
      }

      if (i < data.length && "CHF Amount" in data[i]) {
        total += parseFloat(
          data[i]["CHF Amount"].replace(",", "").replace("'", "")
        );
      } else if (!"CHF Amount" in data[i]) {
        errorMessage = "column 'CHF Amount' not found";
      }
      if (data[i].Date) {
        output.push(expenseLine(i));
      }
    }
	//last summary line
	output.push(summaryLine(data.length));
    csvOutput = PapaParse.unparse({
      data: output,
      fields: ["1", "2", "3", "17", "18", "19", "5", "6", "11", "4", "8", "9"],
    });
    message = "Your CSV is ready!";
    href = encodeURI("data:text/csv;charset=utf-8," + csvOutput);
  }
  function uploadFile(myfile) {
    const file = myfile.files[0];

    const fileExtensionArray = file.type.split("/");
    const fileExtension = fileExtensionArray[fileExtensionArray.length - 1];

    if (fileExtension.includes("csv")) {
      const csvData = PapaParse.parse(
        file,

        {
          header: true,
          complete: (results) => {
            message = "working...";
            create_output(results.data);
          },
        }
      );
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
  <h1>Expense Report Cleanup</h1>
  <h2>{phrase}</h2>
  <h2>Let's cleanup that report</h2>
  First ODnum:
  <input bind:value={ODnum} />
  <br />
  <input bind:this={myfile} on:change={uploadFile(myfile)} type="file" />
  {#if message}
    <p>{message}</p>
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

    font-family: "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue",
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
</style>
