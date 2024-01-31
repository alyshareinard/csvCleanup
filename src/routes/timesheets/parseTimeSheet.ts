import PapaParse from "papaparse";

function parseDateTimesheet(filename: string) {
  //  console.log("in parse date timesheet.  filename is ", filename);
  let date = filename.split("_")[0];
  //  console.log("date is ", date);

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
  mydate: string,
  REB: number
) {
  let employee = employeeLookup(timesheetLine["Nom complet"]);
  //    console.log(employee);
  if (employee == undefined) {
    employee = {
      nameval: "EMPLOYEE" + timesheetLine["Nom complet"] + " NOT FOUND",
      currency: "",
      currency2: "",
      code: "",
      paycode: "",
    };
  }
  return [
    mydate,
    makeREBstring(REB),
    employee.code,
    "",
    "",
    "",
    timesheetLine["Description"],
    "",
    timesheetLine["Analysis code"],
    "",
    "",
    Number(timesheetLine["Total"]) * -1
  ];
}

function summaryLine(timesheetLine: any, mydate: string, REB: number) {
  let employee = employeeLookup(timesheetLine["Nom complet"]);
  //    console.log(employee);
  if (employee == undefined) {
    employee = {
      nameval: "EMPLOYEE" + timesheetLine["Nom complet"] + " NOT FOUND",
      currency: "",
      currency2: "",
      code: "",
      paycode: "",
    };
  }
  return [
    mydate,
    makeREBstring(REB),
    employee.code,
    "",
    "",
    "",
    timesheetLine["Description"],
    "",
    employee.paycode,
    "",
    "",
    timesheetLine["Total"]
  ];
}


function step1output(timesheetLine: any, amount: String) {

  
  return [  
    timesheetLine["Nom complet"],
    timesheetLine["Code Donateur"],
    timesheetLine["Code Projects"],
    timesheetLine["Nom Projects"],
    timesheetLine["Code Country"],
    timesheetLine["Code Donateur"] +
      timesheetLine["Code Projects"] +
      "/" +
      timesheetLine["Code Country"],
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
  data: any,
  lookupfile: any,
  filename: string,
  REBnum: string
) {
  console.log("filename is ", filename);
  const mydate = parseDateTimesheet(filename);


  const output = [];
  let REBint = parseInt(REBnum);

  for (let i = 0; i < data.length; i++) {
    if (data[i]["Nom complet"] == "") {
      break;
    }

    output.push(expenseLine(data[i], mydate, REBint));
    output.push(summaryLine(data[i], mydate, REBint));
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
    fields: ["Nom complet", "Code Donateur", "Code Projects", "Nom Projects", "Code Country",	"Analysis code", "Nom Coût horaire", "Temps imputé (Heures)", "Total", "Description"]		
  });
  //  console.log("csvOutput is ", csvOutput);
  return {
    csvReady: true,
    message: "Your CSV is ready!",
    href: encodeURI("data:text/csv;charset=utf-8," + "\ufeff" + csvOutput),
  };
}

function employeeLookup(employee: string) {
  type Employees = {
    [key: string]: {
      nameval: string;
      currency: string;
      currency2: string;
      code: string;
      paycode: string;
    };
  };
  const employees: Employees = {
    "Luce Ahouangnimon": {
      nameval: "AHOUANGNIMON L.",
      currency: "CHF",
      currency2: "",
      code: "51000",
      paycode: "",
    },
    "Linda Asamoah": {
      nameval: "ASAMOAH LINDA",
      currency: "CHF",
      currency2: "",
      code: "51000",
      paycode: "",
    },
    "Juvenal Babona": {
      nameval: "BABONA MIHIGO J",
      currency: "CHF",
      currency2: "",
      code: "50000",
      paycode: "",
    },
    "Barbara Bernath": {
      nameval: "BERNATH-THEVENO",
      currency: "CHF",
      currency2: "",
      code: "51000",
      paycode: "",
    },
    "Benjamin Buckland": {
      nameval: "BUCKLAND BENJAM",
      currency: "CHF",
      currency2: "",
      code: "51000",
      paycode: "",
    },
    "Margaret Bünzli": {
      nameval: "BUNZLI MARGARET",
      currency: "CHF",
      currency2: "",
      code: "51000",
      paycode: "",
    },
    "Valentina Cadelo": {
      nameval: "CADELO VALENTIN",
      currency: "CHF",
      currency2: "",
      code: "51000",
      paycode: "",
    },
    "Emilio Congco": {
      nameval: "CONGCO EMILIO",
      currency: "CHF",
      currency2: "",
      code: "51000",
      paycode: "",
    },
    "Veronica Filippeschi": {
      nameval: "FILIPPESCHI VER",
      currency: "CHF",
      currency2: "",
      code: "51000",
      paycode: "",
    },
    "Manachaya Yankittikul": {
      nameval: "MANACHAYA YANKI",
      currency: "EUR",
      currency2: "EUR",
      code: "50000",
      paycode: "",
    },
    "Sara Vera Lopez": {
      nameval: "SARA LOPEZ",
      currency: "USD",
      currency2: "USD",
      code: "50000",
      paycode: "",
    },
    "Nid Satjipanon": {
      nameval: "SATJIPANON N.",
      currency: "CHF",
      currency2: "",
      code: "50000",
      paycode: "",
    },
    "Sylvia Dias": {
      nameval: "SYLVIA DIAS",
      currency: "CHF",
      currency2: "",
      code: "50000",
      paycode: "",
    },
    "Cécile Trochu Grasso": {
      nameval: "TROCHU GRASSO C",
      currency: "CHF",
      currency2: "",
      code: "50000",
      paycode: "",
    },
    "Jasmine Zik-Ikeorha": {
      nameval: "ZIK-IKEORHA CHI",
      currency: "CHF",
      currency2: "",
      code: "51000",
      paycode: "",
    },
  };
  const employeeMatch = employees[employee];
  if (employeeMatch.code == "51000") {
    employeeMatch.paycode = "ADM-UNRE01/A0900-00/ALL";
  } else if (employeeMatch.code == "50000") {
    employeeMatch.paycode = "ADM-UNRE01/A0905-00/ALL";
  }
  return employeeMatch;
}
