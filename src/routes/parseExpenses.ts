
import PapaParse from "papaparse";


function to3Digit(num: number) {
    if (num < 10) {
      return "00" + num;
    } else if (num < 100) {
      return "0" + num;
    } else {
      return num;
    }
  }
function lastDayOfMonth(date: string) {
    let mydate = date.split("/");
    let lastdate = new Date(Number(mydate[2]), Number(mydate[1]), 0);

    return lastdate.getDate() + "/" + mydate[1] + "/" + mydate[2];
  }
  function getNDF(record:any) {
    let num = 0;

    if (record["NDF #"]) {
      num = record["NDF #"].split("-")[1];
    }

    return num;
  }
  function parseDate(date: string) {
    let mydate = date.split("/");
    return Date.parse(mydate[2] + "/" + mydate[1] + "/" + mydate[0]);
  }
  function expenseLine(expense:any, ODnum:number) {
    //console.log("ODnum...", ODnum)
    return [
      lastDayOfMonth(expense.Date),
      "OD-" + to3Digit(ODnum),
      expense["Expense Account"],
      "",
      "",
      "",
      expense["DESC 1"],
      expense["DESC 2"],
      expense["Donors"] + expense["Project"] + "/" + expense["Country"],
      "",
      "",
      expense["CHF Amount"],
    ];
  }
  function summaryLine(prevExpense:any, supplier:any, ODnum:number, total: number) {

    if ((supplier == "" || supplier == undefined)) {
      return [
        lastDayOfMonth(prevExpense.Date),
        "OD-" + to3Digit(ODnum),
        "20000",
        "UNKNOWN NAME",
        "UNKNOWN CURRENCY1",
        prevExpense["NDF #"],
        prevExpense["DESC 1"],
        prevExpense["NDF #"],
        "",
        "UNKNOWN CURRENCY1",
        "",
        (-1 * Math.round(total * 100)) / 100,
      ];
    } else {
      //console.log("supplier: ", supplier)
      //console.log("supplier...", supplier.nameval)
      //console.log("supplier...nameval ", supplier['nameval'])
      return [
        lastDayOfMonth(prevExpense.Date),
        "OD-" + to3Digit(ODnum),
        "20000",
        supplier.nameval,
        supplier.currency,
        prevExpense["NDF #"],
        prevExpense["DESC 1"],
        prevExpense["NDF #"],
        "",
        supplier.currency2,
        "",
        (-1 * Math.round(total * 100)) / 100,
      ];
    }
  }

    export async function createExpenseOutput(data:any, lookupTable:any, filename: string, ODstring: string) {
    //filter out empty lines
    let ODnum = Number(ODstring)
    data = data.filter(function (el:any) {
      return el.Date != "";
    });
    //group data by ndf and then sort by date
    data.sort(function (a:any, b:any) {
      return getNDF(a) - getNDF(b) || parseDate(a.Date) - parseDate(b.Date);
    });

    async function testDescription(i: number) {
      const description = data[i]["DESC 2"];
      //console.log(description.length);
      if (description.length > 30) {
        const longDescription = true;
        const desc1 = description.slice(0, 30);
        const desc2 = description.slice(30);
        const message = "Description is too long";
        const shortDescrip = description;
      } else {
        const longDescription = false;
      }

      return description;
    }


    const output = [];
    let prevNDF = data[0]["NDF #"];
    let NDF = prevNDF;
    let prevDate = lastDayOfMonth(data[0].Date);
    let date = prevDate;
    let total=0;
    let employeeName=""

    let employee = {
      nameval: "",
      currency: "",
      currency2: "",
    };
    for (let i = 0; i < data.length; i++) {
      NDF = data[i]["NDF #"];
      date = lastDayOfMonth(data[i].Date);

      if (NDF != prevNDF || date != prevDate || i == data.length - 1) {
        //summary line
        //console.log("summary line")
        output.push(summaryLine(data[i-1], employee, ODnum, total));
//        console.log(output);
        ODnum += 1;
        prevNDF = NDF;
        prevDate = date;
        total = 0;
      }
      employee = {
        nameval: "EMPLOYEE" + data[i]["Staff"] + " NOT FOUND",
        currency: "",
        currency2: "",
      };

      if (data[i]["Staff"] == "") {
        break;
      } else{
        employeeName=data[i]["Staff"]
      } 
  

//      console.log("employeeName", employeeName)
      for (let j=0; j<lookupTable.length; j++){
        if (lookupTable[j]["Staff"] == employeeName) {
//          console.log("Lookup table line", lookupTable[j])
          employee["nameval"] = lookupTable[j]["Nameval"]
          employee["currency"] = lookupTable[j]["Currency"]
          employee["currency2"] = lookupTable[j]["Currency2"]
        }
      }



      if (i < data.length && "CHF Amount" in data[i]) {
        total += parseFloat(
          data[i]["CHF Amount"].replace(",", "").replace("'", "")
        );
      }

      if (data[i].Date) {
        //		await testDescription(i)
        output.push(expenseLine(data[i], ODnum));
      }
    }
    //handle last summary line
    const lastline = data.pop()
    //console.log(lastline)
    employee = {
      nameval: "EMPLOYEE " + lastline["Staff"] + " NOT FOUND",
      currency: "",
      currency2: "",
    };
    employeeName=lastline["Staff"]
    //console.log("employeeName", employeeName)
    for (let j=0; j<lookupTable.length; j++){
      if (lookupTable[j]["Staff"] == employeeName) {
        employee["nameval"] = lookupTable[j]["Nameval"]
        employee["currency"] = lookupTable[j]["Currency"]
        employee["currency2"] = lookupTable[j]["Currency2"]
      }
    }
    //last summary line
    output.push(summaryLine(lastline, employee, ODnum, total));


    //  console.log("output is ", output);
  const csvOutput = PapaParse.unparse({
    data: output,
    fields: ["1", "2", "3", "17", "18", "19", "5", "6", "11", "4", "8", "9"],
  });
//  console.log("csvOutput is ", csvOutput);
  return {
    csvReady:true,
    message: "Your Expenses file is ready!",
    href:  encodeURI("data:text/csv;charset=utf-8," +'\ufeff'+csvOutput),
  };
  }