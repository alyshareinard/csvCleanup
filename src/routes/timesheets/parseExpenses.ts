
import PapaParse from "papaparse";

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

    export async function createExpenseOutput(data:any, lookupFile:any, filename: string, ODnum: string) {
    //filter out empty lines
    data = data.filter(function (el:any) {
      return el.Date != "";
    });
    //group data by ndf and then sort by date
    data.sort(function (a:any, b:any) {
      return getNDF(a) - getNDF(b) || parseDate(a.Date) - parseDate(b.Date);
    });

    async function testDescription(i: number) {
      const description = data[i]["DESC 2"];
      console.log(description.length);
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
    function expenseLine(i: number) {
      return [
        lastDayOfMonth(data[i].Date),
        "OD-" + ODnum,
        data[i]["Expense Account"],
        "",
        "",
        "",
        data[i]["DESC 1"],
        data[i]["DESC 2"],
        data[i]["Donors"] + data[i]["Project"] + "/" + data[i]["Country"],
        "",
        "",
        data[i]["CHF Amount"],
      ];
    }
    function summaryLine(i: number, total: number) {
      let supplier = supplierLookup[data[i - 1]["Staff"]];
      console.log(supplier);
      if ((supplier == "" || supplier == undefined)) {
        return [
          lastDayOfMonth(data[i - 1].Date),
          "OD-" + ODnum,
          "20000",
          "UNKNOWN NAME",
          "UNKNOWN CURRENCY1",
          data[i - 1]["NDF #"],
          data[i - 1]["DESC 1"],
          data[i - 1]["NDF #"],
          "",
          "UNKNOWN CURRENCY1",
          "",
          (-1 * Math.round(total * 100)) / 100,
        ];
      } else {
        console.log("supplier: ", supplier)
        console.log("supplier...", supplier.nameval)
        console.log("supplier...nameval ", supplier['nameval'])
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
        ];
      }
    }

    const output = [];
    const ODnum_asint = parseInt(ODnum);
    let prevNDF = data[0]["NDF #"];
    let NDF = prevNDF;
    let prevDate = lastDayOfMonth(data[0].Date);
    let date = prevDate;
    let total=0;
    for (let i = 0; i < data.length; i++) {
      NDF = data[i]["NDF #"];
      date = lastDayOfMonth(data[i].Date);

      if (NDF != prevNDF || date != prevDate || i == data.length - 1) {
        //summary line

        output.push(summaryLine(i, total));
//        console.log(output);
        ODnum += 1;
        prevNDF = NDF;
        prevDate = date;
        total = 0;
      }

      if (i < data.length && "CHF Amount" in data[i]) {
        total += parseFloat(
          data[i]["CHF Amount"].replace(",", "").replace("'", "")
        );
      }

      if (data[i].Date) {
        //		await testDescription(i)
        output.push(expenseLine(i));
      }
    }
    //last summary line
    output.push(summaryLine(data.length, total));


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