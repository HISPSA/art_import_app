        
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
        
    function findFile(e) {
        jsonDataImport = [];
        var bypassItemArray = ['Cohort','OrgUnitCode','Duration', 'Age', 'OrgUnitName', 'Province', 'District', 'Subdistrict',
                          'CohortYear', 'ReportYear', 'ReportQuarter','pTOT','pKIDS','pChild1','pChild5','pChild15', 'PRG','checksum','period'];
        //var catComboZero = [];
        
        document.getElementById("responseMessage").innerHTML = '';
        document.getElementById("conflictTable").innerHTML = '';
        
        document.getElementById("spinner").style.display = "block";
        var files = e.target.files;
        var importType = "";
        if ((files[0].name).includes("Quarterly")){
            
            importType = "Quarterly";
        }else if ((files[0].name).includes("Pregnant")){
        
            importType = "Pregnant";
        }
        
        
        var reader = new FileReader();
        reader.onload = function() {
            
            var parsed = new DOMParser().parseFromString(this.result, "text/xml");
            
            var cohortReturn = parsed.childNodes[0];
            // Retrieve each art record.
            
            try {
            for (var i = 0; i < cohortReturn.children.length; i++)
            {
                
                var artQuarterly = cohortReturn.children[i];
                 //period
                var artPeriod = artQuarterly.getElementsByTagName('Cohort')[0].firstChild.nodeValue;
                //orgUnit
                var artOrgUnitCode = artQuarterly.getElementsByTagName('OrgUnitCode')[0].firstChild.nodeValue;
                // category option duration
                var duration = artQuarterly.getElementsByTagName('Duration')[0].firstChild.nodeValue;
                
                var catcombo = "";//"default"
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
                    catcombo = "JO2HBbjqU3c";//"default"
                }//select
                
                var dataelementPrefix = '';
                age = artQuarterly.getElementsByTagName('Age')[0].firstChild.nodeValue;
                
                
                for (var j = 0; j < artQuarterly.children.length; j++)
                {
                       
                    var jsonName = artQuarterly.children[j].tagName;
                                        
                    if (bypassItemArray.indexOf(jsonName) === -1){
                        
                        var bypass = false;
                        if (importType === "Pregnant"){

                             if (jsonName === "pPRG"){
                                jsonName = "A_PRG"; 
                             }

                        }else{
                            
                            if (age === 'ADULTS') {  
                                dataelementPrefix = 'A_';
                                if (jsonName === 'KIDS' || jsonName === 'Child1' || jsonName === 'Child5' || jsonName === 'Child15'){
                                    bypass = true;
                                } //if

                            }else{
                                dataelementPrefix = 'C_';
                                if (jsonName === 'TOT' || jsonName === 'MEN' || jsonName === 'WOM'){
                                    bypass = true;
                                } //if else
                            }  //if else age === ADULTS    
                        } //if else import === Pregnant    

                        if (!bypass){
                            var rowArray = {};
                            rowArray['dataElement'] = dataelementPrefix+jsonName;
                            rowArray['period'] = artPeriod;
                            rowArray['orgUnit'] = artOrgUnitCode;
                            
                             //need to get the correct catoption
                            //if (catComboZero.indexOf(jsonName) != -1){
                                rowArray['categoryOptionCombo'] = catcombo;    
                            //}else{
                            //    rowArray['categoryOptionCombo'] = "AO4k8lTPUjo";
                            //} //if'    
                            rowArray['value'] = parseInt(artQuarterly.children[j].textContent);
                            jsonDataImport.push(rowArray);
                        } //if bypass

                        } //if bypassItemArray
                }//for                
                
   /*             {
  "dataValues": [
    { "dataElement": "f7n9E0hX8qk", "period": "201401", "orgUnit": "DiszpKrYNg8", categoryoptioncombo:"", value": "12" }
  ]
}
    */           
            } //for
                console.log(jsonDataImport);
                document.getElementById("responseMessage").classList.remove('text-danger');
                document.getElementById("responseMessage").classList.add('text-info');
                document.getElementById("spinner").style.display = "none";
                document.getElementById("responseMessage").innerHTML = "File ready for import. <br/> Number of rows: " + jsonDataImport.length;
        }//try
            catch (err) {
                if (err instanceof TypeError){
                     document.getElementById("responseMessage").classList.remove('text-info');
                    document.getElementById("responseMessage").classList.add('text-danger');
                    document.getElementById("responseMessage").innerHTML = err.message + "<br/> This could indicate that the Cohort, OrgUnitCode or the Duration is missing from the xml file";
                    document.getElementById("spinner").style.display = "none";
                }else{
                    throw err;
                }   
            }        
        };
        
        reader.readAsText(files[0]);
}
        
        function importFile(){
            var jsonObj = new Object;
            jsonObj['dataValues'] = jsonDataImport;
            var jsonData = JSON.stringify(jsonObj);
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
                success: function(){
                    
                    window.open("../../../dhis-web-importexport/displayImportDataValueForm.action","_self");
                 }, //success
                
                error: function(error){
                    document.getElementById("responseMessage").classList.add('text-danger');
                    document.getElementById("spinner").style.display = "none";
                    document.getElementById("responseMessage").innerHTML = error.description;
                }
                
            });
        }
