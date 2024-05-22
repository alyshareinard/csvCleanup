import PapaParse from "papaparse";

function parseDateTimesheet(filename: string) {
  //  console.log("in parse date timesheet.  filename is ", filename);
  let date = filename.split("_")[0];
  //  console.log("date is ", date);
  const datelist = date.split(".");
  date = datelist[2]+"/"+datelist[1]+"/"+datelist[0]


  return date;
}
function makeREBstring(REBint: number) {
  if (REBint < 10) {
    return "REB-000" + REBint;
  } else if (REBint < 100) {
    return "REB-00" + REBint;
  } else if (REBint < 1000) {
    return "REB-0" + REBint;
  } else {
    return "REB-" + REBint;
  }
}

function expenseLine(
  timesheetLine: any,
  employeeInfo:any,
  mydate: string,
  REB: number
) {

  return [
    mydate,
    makeREBstring(REB),
    employeeInfo.code,
    "",
    "",
    "",
    timesheetLine["Description"],
    "",
    timesheetLine["Analysis code"],
    "",
    "",
    Number(timesheetLine["Total"])
  ];
}

function summaryLine(timesheetLine: any, employeeInfo:any, mydate: string, REB: number) {
  return [
    mydate,
    makeREBstring(REB),
    employeeInfo.code,
    "",
    "",
    "",
    timesheetLine["Description"],
    "",
    employeeInfo.paycode,
    "",
    "",
    timesheetLine["Total"] * -1
  ];
}


function step1output(timesheetLine: any, amount: String) {

  
  return [  
    timesheetLine["Nom complet"],
    timesheetLine["Code Donateur"],
    timesheetLine["Code Area"],
    timesheetLine["Nom Area"],
    timesheetLine["Code Country"],
    timesheetLine["Code Donateur"] + '/AC000-00/' +
//      timesheetLine["Code Projects"] +
//      "/" +
      timesheetLine["Code Country"] + "/" + timesheetLine["Code Area"],
    timesheetLine["Nom Coût horaire"],
    timesheetLine["Temps imputé (Heures)"],
    amount,
    timesheetLine["Nom complet"] +
      "_" +
      String(Number(timesheetLine["Temps imputé (Heures)"])) +
      "h"
  ];
}



export async function createTimesheetOutput2(
  data: any[],
  lookupTable: any[],
  filename: string,
  REBnum: string
) {
  const mydate = parseDateTimesheet(filename);


  const output = [];
  let REBint = parseInt(REBnum);

  for (let i = 0; i < data.length; i++) {
    let employeeName=""
    if (data[i]["Nom complet"] == "") {
      break;
    } else{
      employeeName=data[i]["Nom complet"]
    }

    let employee = {
      nameval: "EMPLOYEE" + data[i]["Nom complet"] + " NOT FOUND",
      code: "",
      paycode: "",
    };
//    console.log("employeeName", employeeName)
    for (let j=0; j<lookupTable.length; j++){

      if (lookupTable[j]["Nom complet"].normalize("NFD").replace(/[\u0300-\u036f]/g, "") == employeeName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
        employee["nameval"] = employeeName
        employee["code"] = lookupTable[j]["Numeric code"]
        employee["paycode"] = lookupTable[j]["Letter code"]
      }
    }

    output.push(expenseLine(data[i], employee, mydate, REBint));
    output.push(summaryLine(data[i], employee, mydate, REBint));
    //        console.log(output);
    REBint += 1;
  }
  //  console.log("output is ", output);
  const csvOutput = PapaParse.unparse({
    data: output,
    fields: ["1", "2", "3", "17", "18", "19", "5", "6", "11", "4", "8", "9"],
  });
  //  console.log("csvOutput is ", csvOutput);
  return {
    csvReady: true,
    message: "Your CSV is ready!",
    href: encodeURI("data:text/csv;charset=utf-8," + "\ufeff" + csvOutput),
  };
}


export async function createTimesheetOutput1(
  data: any,
  lookupfile: any,
  filename: string,
  REBnum: string
) {
  //filter out empty lines
  //  console.log("In create timesheet output.  data is ", data);
  //      data = data.filter(function (el) {
  //        return el.Date != "";
  //      });
  //group data by ndf and then sort by date
  //      data.sort(function (a, b) {
  //        return getNDF(a) - getNDF(b) || parseDate(a.Date) - parseDate(b.Date);
  //      });



  const output = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i]["Nom complet"] == "") {
      break;
    }
    const rawamount =
      Number(data[i]["Nom Coût horaire"]) *
      Number(data[i]["Temps imputé (Heures)"]);
    const amount = Math.round(rawamount * 100) / 100;
    output.push(step1output(data[i], String(amount)));

  }
  //  console.log("output is ", output);
  const csvOutput = PapaParse.unparse({
    data: output,
    fields: ["Nom complet", "Code Donateur", "Code Area", "Nom Area", "Code Country",	"Analysis code", "Nom Coût horaire", "Temps imputé (Heures)", "Total", "Description"]		
  });
  //  console.log("csvOutput is ", csvOutput);
  return {
    csvReady: true,
    message: "Your CSV is ready!",
    href: encodeURI("data:text/csv;charset=utf-8," + "\ufeff" + csvOutput),
  };
}
