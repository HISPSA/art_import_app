        //DHIS2 Settings initialization for a baseUrl that is used for the menu
        window.dhis2 = window.dhis2 || {};
        dhis2.settings = dhis2.settings || {};
        dhis2.settings.baseUrl = '../';

        var urlArray = window.location.pathname.split('/');
        var apiIndex = urlArray.indexOf('api');

        if (apiIndex > 1) {
            dhis2.settings.baseUrl = urlArray[apiIndex - 1];
        } else {
            dhis2.settings.baseUrl = '';
        }

        document.getElementById("fileID").addEventListener("change", findFile, false);
        document.getElementById("importButton").addEventListener("click", importFile, false);

        var jsonDataImport = [];

        function getCatComboUID(duration) {
            var catcombo = ""; //"default"

            switch (parseInt(duration)) {
                case 0:
                    catcombo = "AO4k8lTPUjo" //"D000 months"
                    break;
                case 3:
                    catcombo = "aZBz1KkuHm1" //"D003 months";
                    break;
                case 6:
                    catcombo = "Z5G1gTdyuLZ"; //"D006 months";
                    break;
                case 12:
                    catcombo = "ttRyehSpUrQ"; //"D012 months";
                    break;
                case 24:
                    catcombo = "fk8QJVc8mOC"; //"D024 months";
                    break;
                case 36:
                    catcombo = "ylwnwGm7O6k"; //"D036 months";
                    break;
                case 48:
                    catcombo = "YfkogCRSws8"; //"D048 months";
                    break;
                case 60:
                    catcombo = "HxJj6ovGtlk"; //"D060 months";
                    break;
                case 72:
                    catcombo = "qrXxTws7Y70"; //"D072 months";
                    break;
                case 84:
                    catcombo = "IodbX2YKEVo"; //"D084 months";
                    break;
                case 96:
                    catcombo = "H7QxMHaaw2L"; //"D096 months";
                    break;
                case 108:
                    catcombo = "wSNXri3v6pi"; //"D108 months";
                    break;
                case 120:
                    catcombo = "NOfi9mwBpcI"; //"D120 months";
                    break;
                case 132:
                    catcombo = "njTP2dH6CWH"; //"D132 months";
                    break;
                case 144:
                    catcombo = "f6uAWSG2Crn"; //"D144 months";
                    break;
                case 156:
                    catcombo = "iRw9WYOBYpr"; //"D156 months";
                    break;
                case 168:
                    catcombo = "kTTu0q5Fpux"; //"D168 months";
                    break;
                case 180:
                    catcombo = "Ub3v8kaC1Ig"; //"D180 months";
                    break;
                case 192:
                    catcombo = "ziIlhhRvq0F"; //"D192 months";
                    break;
                case 204:
                    catcombo = "SP6j95WfGGI"; //"D204 months";
                    break;
                case 216:
                    catcombo = "L36LB6lE9to"; //"D216 months";
                    break;
                case 228:
                    catcombo = "epZ0CZZRJpz"; //"D228 months";
                    break;
                default:
                    catcombo = "JO2HBbjqU3c"; //"default"
            } //select
            
            return catcombo;
        }

        function findFile(e) {
            jsonDataImport = [];

            var bypassItemArray = ['Cohort', 'OrgUnitCode', 'Duration', 'Age', 'OrgUnitName', 'Province', 'District', 'Subdistrict',
                          'CohortYear', 'ReportYear', 'ReportQuarter', 'pTOT', 'pKIDS', 'pChild1', 'pChild5', 'pChild15', 'PRG'];
            //var catComboZero = [];

            document.getElementById("responseMessage").innerHTML = '';
            document.getElementById("conflictTable").innerHTML = '';
            
            if (document.contains(document.getElementById("downloadLink"))) {
                document.getElementById("downloadLink").remove();
            }

            document.getElementById("spinner").style.display = "block";
            var files = e.target.files;
            var importType = "";
            if ((files[0].name).includes("Quarterly")) {

                importType = "Quarterly";
            } else if ((files[0].name).includes("Pregnant")) {

                importType = "Pregnant";
            }


            var reader = new FileReader();
            reader.onload = function () {

                var parsed = new DOMParser().parseFromString(this.result, "text/xml");

                var cohortReturn = parsed.childNodes[0];
                // Retrieve each art record.

                try {
                    var count = 0;
                    var errorReportArray = [];
                    errorReportArray.push('OrgUnitName, District, Subdistrict');
                    
                    for (var i = 0; i < cohortReturn.children.length; i++) {

                        var artQuarterly = cohortReturn.children[i];

                        //orgUnit
                        var artOrgUnitCode = "";

                        if (artQuarterly.getElementsByTagName('OrgUnitCode')[0].firstChild != null) {
                            
                            artOrgUnitCode = artQuarterly.getElementsByTagName('OrgUnitCode')[0].firstChild.nodeValue;
                            //period
                            var artPeriod = artQuarterly.getElementsByTagName('Cohort')[0].firstChild.nodeValue;

                            // category option duration
                            var duration = artQuarterly.getElementsByTagName('Duration')[0].firstChild.nodeValue;
                            var catComboUID = getCatComboUID(duration);

                            var dataelementPrefix = '';
                            age = artQuarterly.getElementsByTagName('Age')[0].firstChild.nodeValue;


                            for (var j = 0; j < artQuarterly.children.length; j++) {

                                var jsonName = artQuarterly.children[j].tagName;

                                if (bypassItemArray.indexOf(jsonName) === -1) {

                                    var bypass = false;
                                    if (importType === "Pregnant") {

                                        if (jsonName === "pPRG") {
                                            jsonName = "A_PRG";
                                        }

                                    } else {

                                        if (age === 'ADULTS') {
                                            dataelementPrefix = 'A_';
                                            if (jsonName === 'KIDS' || jsonName === 'Child1' || jsonName === 'Child5' || jsonName === 'Child15') {
                                                bypass = true;
                                            } //if

                                        } else {
                                            dataelementPrefix = 'C_';
                                            if (jsonName === 'TOT' || jsonName === 'MEN' || jsonName === 'WOM') {
                                                bypass = true;
                                            } //if else
                                        } //if else age === ADULTS    
                                    } //if else import === Pregnant    

                                    if (!bypass) {

                                        var rowArray = {};
                                        rowArray['dataElement'] = dataelementPrefix + jsonName;
                                        rowArray['period'] = artPeriod;
                                        rowArray['orgUnit'] = artOrgUnitCode;

                                        //need to get the correct catoption
                                        //if (catComboZero.indexOf(jsonName) != -1){
                                        rowArray['categoryOptionCombo'] = catComboUID;
                                        //}else{
                                        //    rowArray['categoryOptionCombo'] = "AO4k8lTPUjo";
                                        //} //if'    
                                        rowArray['value'] = parseInt(artQuarterly.children[j].textContent);

                                        jsonDataImport.push(rowArray);

                                    } //if bypass

                                } //if bypassItemArray
                            } //for

                        } // if orgcode not null
                        else {
                            count = count + 1;
                            
                            errorReportArray.push(artQuarterly.getElementsByTagName('OrgUnitName')[0].firstChild.nodeValue + ', ' + artQuarterly.getElementsByTagName('District')[0].firstChild.nodeValue + ', ' + artQuarterly.getElementsByTagName('Subdistrict')[0].firstChild.nodeValue);
                        }

                    } //for

                    document.getElementById("responseMessage").classList.remove('text-danger');
                    document.getElementById("responseMessage").classList.add('text-info');
                    document.getElementById("spinner").style.display = "none";
                    document.getElementById("responseMessage").innerHTML = "File ready for import. <br/> Number of rows: " + jsonDataImport.length +
                        "<br/>" + count + " Records with org unit code missing from import file.";
                
                if (errorReportArray.length > 1) {
                var lonString = "";               
                    for (var i = 0; i < errorReportArray.length; i++) {
                    // var row = table.insertRow(i);
                    lonString = lonString + errorReportArray[i] + '\n';
                    
                    }
                    download('errorlog.csv', lonString);
                }    
                
                    
                } //try
                catch (err) {
                    if (err instanceof TypeError) {
                        document.getElementById("responseMessage").classList.remove('text-info');
                        document.getElementById("responseMessage").classList.add('text-danger');
                        document.getElementById("responseMessage").innerHTML = err.message + "<br/> This could indicate that the Cohort, OrgUnitCode or the Duration is missing from the xml file";
                        document.getElementById("spinner").style.display = "none";

                    } else {
                        throw err;
                    }
                }
            };

            reader.readAsText(files[0]);
        }


function get(url) {
  // Return a new promise.
    var jsonObj = new Object;
    jsonObj['dataValues'] = jsonDataImport;
    var jsonData = JSON.stringify(jsonObj);
    
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('POST', url);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    
    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 202) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send(jsonData);
  });
}

function importFile() {
    var url = '../../../api/dataValueSets?dataElementIdScheme=code&orgUnitIdScheme=code&async=true&dryRun=false&importStrategy=CREATE_AND_UPDATE';
    document.getElementById("spinner").style.display = "block";
    get(url).then(function(response) {
        console.log("Success!", response);
        
        window.open("../../../dhis-web-importexport/displayImportDataValueForm.action", "_self");
       // document.getElementById('dframe').src = "../../../dhis-web-importexport/displayImportDataValueForm.action";
    }, function(error) {
        console.error("Failed!", error);
    })
}

function download(filename, text) {
    var element = document.createElement('a');
    var resp = document.getElementById("responseMessage");
    
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('id','downloadLink');
    element.setAttribute('download', filename);
    element.innerHTML = 'Click here to download';


    element.style.display = 'block';
    element.style.color = '#b94a48';
    resp.parentNode.insertBefore(element, resp.nextSibling);
    //document.body.appendChild(element);

    //element.click();

    //document.body.removeChild(element);
}