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

        //Event listeners for the buttons
        document.getElementById("fileID").addEventListener("change", findZipFile, false);
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

        function displayMessage(cssClassRemove, cssClassAdd, spinnerDisplay, msg) {
            document.getElementById("responseMessage").classList.remove(cssClassRemove);
            document.getElementById("responseMessage").classList.add(cssClassAdd);
            document.getElementById("spinner").style.display = spinnerDisplay;
            document.getElementById("responseMessage").innerHTML = msg;
        }

        function findZipFile(e) {

            document.getElementById("responseMessage").innerHTML = '';

            //Use this field to display items that cannot be displayed
            document.getElementById("conflictTable").innerHTML = '';
            //start the spinner for the unzipping and formatting of the xml file
            document.getElementById("spinner").style.display = "block";

            var files = e.target.files;

            var zip = new JSZip();
            zip.loadAsync(files[0] /* = file blob */ )
                .then(function (zip) {
                    // process ZIP file content here
                    Object.keys(zip.files).forEach(function (filename) {
                        zip.files[filename].async('string').then(function (fileData) {
                            
                            getXMLValues(fileData, filename) // These are your file contents      
                        })
                    })
                }, function () {
                    // display this as a responseMessage instead of an alert
                    alert("Not a valid zip file")
                });
        }

        function getXMLValues(xmlFile, filename) {

            jsonDataImport = [];

            var bypassItemArray = ['COHORT', 'ORGUNITCODE', 'DURATION', 'AGE', 'ORGUNITNAME', 'PROVINCE', 'DISTRICT', 'SUBDISTRICT',
                          'COHORTYEAR', 'REPORTYEAR', 'REPORTQUARTER', 'PTOT', 'PKIDS', 'PCHILD1', 'PCHILD5', 'PCHILD15', 'PRG', 'CHECKSUM', 'PERIOD'];

            var importType = "";

            if (filename.includes("Quarterly")) {

                importType = "Quarterly";
            } else if (filename.includes("Pregnant")) {

                importType = "Pregnant";
            }

            var cohortReturn = $(xmlFile).children();
            // Retrieve each art record.

            try {
                var count = 0;
                for (var i = 0; i < cohortReturn.length; i++) {

                    var artQuarterly = cohortReturn[i];
                    
                    //orgUnit
                    var artOrgUnitCode = "";

                    if (artQuarterly.getElementsByTagName('ORGUNITCODE')[0].firstChild != null) {

                        artOrgUnitCode = artQuarterly.getElementsByTagName('ORGUNITCODE')[0].firstChild.nodeValue;
                        //period
                        var artPeriod = artQuarterly.getElementsByTagName('COHORT')[0].firstChild.nodeValue;

                        // category option duration
                        var duration = artQuarterly.getElementsByTagName('DURATION')[0].firstChild.nodeValue;
                        var catComboUID = getCatComboUID(duration);

                        var dataelementPrefix = '';
                        age = artQuarterly.getElementsByTagName('AGE')[0].firstChild.nodeValue;
                        
                        
                        for (var j = 0; j < artQuarterly.children.length; j++) {

                            var jsonName = artQuarterly.children[j].tagName;
                            if (bypassItemArray.indexOf(jsonName) === -1) {

                                var bypass = false;
                                if (importType === "Pregnant") {

                                    if (jsonName === "PPRG") {
                                        jsonName = "A_PRG";
                                    }

                                } else {

                                    if (age === 'ADULTS') {
                                        dataelementPrefix = 'A_';
                                        if (jsonName === 'KIDS' || jsonName === 'CHILD1' || jsonName === 'CHILD5' || jsonName === 'CHILD15') {
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
                                    rowArray['categoryOptionCombo'] = catComboUID;
                                    rowArray['value'] = parseInt(artQuarterly.children[j].textContent);

                                    jsonDataImport.push(rowArray);

                                } //if bypass

                            } //if bypassItemArray
                        } //for

                    } // if orgcode not null
                    else {
                        count = count + 1;
                    }

                } //for

                displayMessage('text-danger', 'text-info', 'none', "File ready for import. <br/> Number items for importing: " + jsonDataImport.length +
                    "<br/>" + count + " Items with org unit code missing from zip file.");
            } //try
            catch (err) {
                if (err instanceof TypeError) {

                    displayMessage('text-info', 'text-danger', 'none', err.message + "<br/> This could indicate that the Cohort or the Duration is missing from the xml file");

                } else {
                    throw err;
                }
            }
        }


        function importFile() {
            var jsonObj = new Object;
            jsonObj['dataValues'] = jsonDataImport;
            var jsonData = JSON.stringify(jsonObj);
            //start the spinner for the import into dhis
            document.getElementById("spinner").style.display = "block";

            var url = 'api/dataValueSets?dataElementIdScheme=code&orgUnitIdScheme=code&async=true&dryRun=false&importStrategy=CREATE_AND_UPDATE';
            $.ajax({
                type: 'POST',
                url: '../../../' + url,
                data: jsonData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                dataType: 'json',
                success: function () {

                    window.open("../../../dhis-web-importexport/displayImportDataValueForm.action", "_self");
                }, //success

                error: function (error) {

                    document.getElementById("responseMessage").classList.add('text-danger');
                    document.getElementById("spinner").style.display = "none";

                    document.getElementById("responseMessage").innerHTML = error.description;
                }

            });
        }