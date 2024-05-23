#!/usr/bin/env node

// import "hal.js"
const fs = require('node:fs');
var nodePandoc = require('node-pandoc');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const hal_baseurl = "https://api.archives-ouvertes.fr";
const fl = 'fileAnnexes_s,fileAnnexesFigure_s,invitedCommunication_s,proceedings_s,popularLevel_s,halId_s,authIdHalFullName_fs,producedDateY_i,docType_s,files_s,fileMain_s,fileMainAnnex_s,linkExtUrl_s,title_s,en_title_s,fr_title_s,label_bibtex,citationRef_s,labStructId_i,journalTitle_s';
//const lastig_filter = '&fq=(labStructId_i:1003089 OR labStructId_i:536752 OR labStructId_i:60135 OR labStructId_i:1002888 OR labStructId_i:54391 OR labStructId_i:1002886)';
const lastig_filter = '&fq=(labStructId_i:1003089 OR labStructId_i:536752)';
const date_filter = '&fq=producedDateY_i:[2018 TO 2023]'
const publication_options = {
  pubPV: "&fq=popularLevel_s:1",
  pubASCL: "&fq=popularLevel_s:0&fq=docType_s:ART&fq=peerReviewing_s:0",
  pubACL: "&fq=popularLevel_s:0&fq=docType_s:ART&fq=peerReviewing_s:1&fq=audience_s:2",
  pubACLN: "&fq=popularLevel_s:0&fq=docType_s:ART&fq=peerReviewing_s:1&fq=audience_s:(1 OR 3)",
  pubINV: "&fq=popularLevel_s:0&fq=docType_s:COMM&fq=invitedCommunication_s:1",
  pubCOM: "&fq=popularLevel_s:0&fq=docType_s:COMM&fq=invitedCommunication_s:0&fq=proceedings_s:0",
  pubACTI: "&fq=popularLevel_s:0&fq=docType_s:COMM&fq=invitedCommunication_s:0&fq=proceedings_s:1&fq=audience_s:2",
  pubACTN: "&fq=popularLevel_s:0&fq=docType_s:COMM&fq=invitedCommunication_s:0&fq=proceedings_s:1&fq=audience_s:(1 OR 3)",
  pubOS: "&fq=docType_s:COUV",
  pubDO: "&fq=docType_s:DOUV",
  pubAP: "&fq=docType_s:(REPORT OR UNDEFINED)",
  pubTH: "&fq=docType_s:(THESE OR HDR)",
  pubAFF: "&fq=docType_s:POSTER",
};

const publication_names = {
  pubPV: "Vulgarisation",
  pubASCL: "Autres articles",
  pubACL: "Journaux internationaux",
  pubACLN: "Journaux nationaux",
  pubINV: "Conférences invitées",
  pubCOM: "Communications",
  pubACTI: "Conférences internationales",
  pubACTN: "Conférences nationales",
  pubOS: "Chapitres d'ouvrages",
  pubDO: "Directions d'ouvrages",
  pubAP: "Rapports ou pré-publications",
  pubTH: "Dissertations (thèses et HDR)",
  pubAFF: "Posters"
};

function createPub(doc) {
  var result = [];
  result.push("**[" + doc.halId_s + "]**");
  console.log(doc.halId_s);
  var authors = [];
  for (var i = 0; i < doc.authIdHalFullName_fs.length; ++i) {
    const [_idHal, _fullName] = doc.authIdHalFullName_fs[i].split('_FacetSep_');
    if (_idHal) {
      authors.push("[" + _fullName + "](" + 'https://cv.archives-ouvertes.fr/' + _idHal + ")");
    } else {
      authors.push(_fullName);
    }
  }
  result.push(authors.join(", "));
  result.push(doc.producedDateY_i);
  var title = (doc.en_title_s || doc.fr_title_s || doc.title_s).toString();
  if (title) {
    title = title.replaceAll('"', "'");
  }
  result.push("[" + title + "](" + 'https://hal.archives-ouvertes.fr/' + doc.halId_s + ")");
  var journal = doc.journalTitle_s;
  if (journal) {
    journal = journal.replaceAll('"', "'");
  }
  result.push(journal);
  return result;
}

const getData = async function (url) {
  const res = await fetch(url);
  const data = await res.json();
  // console.log(data);
  return data;
}

var content = [];
var contentAsArray = [];
contentAsArray.push(["ID","AUTHORS","YEAR","TITLE","JOURNAL","TYPE"])
var history = {};
for (var id in publication_options) {
  var type_history = {};
  for (const date of [2018,2019,2020,2021,2022,2023]) {
    type_history[date.toString()] = 0;
  }
  history[id] = type_history;
}
console.log(history);

var journals = {}
async function getContent() {
  for (var id in publication_options) {
    console.log(id);
    content.push("# " + publication_names[id]);
    //var request = new XMLHttpRequest();
    // Open a new connection, using the GET request on the URL endpoint
    var url = hal_baseurl + "/search/?q=*&wt=json&sort=producedDateY_i desc&rows=10000&fl=" + fl + publication_options[id] + lastig_filter + date_filter;
    // console.log(url);
    var data = await getData(url);
    // request.open('GET', url, true);
    // request.onload = function () {
    // const getData = async () => {
    var docs = data.response.docs;
    docs.forEach(doc => {
      var pub = createPub(doc);
      // console.log("RES = " + pub);
      content.push(pub.join(" "));
      content.push("");
      var array = pub.map((x) => '"'+x+'"');
      array.push(id);
      contentAsArray.push(array);
      var date = array[2].replaceAll('"','');
      // console.log(date);
      history[id][date] = history[id][date]+1;
      var journal = array[4];
      console.log(journal);
      if (!(journal in journals)) {
        journals[journal] = 0;
      }
      journals[journal] = journals[journal]+1;
    });
    // }

    // getData()
    //   async () => {
    // const res = await fetch(url)
    // const data = await res.json()
    // };
    // }
    // request.send();
  }
};

async function writeContent() {
  await getContent();
  var journals_as_array = [];
  journals_as_array.push(["name","nb"]);
  for (const name in journals) {
    journals_as_array.push([name,journals[name]]);
  }
  fs.writeFile('journals.csv', journals_as_array.join("\n"), err => {
    if (err) {
      console.error(err);
    }
    console.log("file written successfully!");
  });
  var history_as_array = [];
  history_as_array.push(["type","2018","2019","2020","2021","2022","2023"]);
  for (const id in publication_options) {
    var type_history = [id.substring(3)];
    for (const date of [2018,2019,2020,2021,2022,2023]) {
      type_history.push(history[id][date.toString()]);
    }
    history_as_array.push(type_history);
  }
  fs.writeFile('publication_history.csv', history_as_array.join("\n"), err => {
    if (err) {
      console.error(err);
    }
    console.log("file written successfully!");
  });
  var history_as_df = [];
  history_as_df.push(["type","year","nb"]);
  for (const id in publication_options) {
    for (const date of [2018,2019,2020,2021,2022,2023]) {
      history_as_df.push([id.substring(3),date.toString(),history[id][date.toString()]]);
    }
  }
  fs.writeFile('publication_history_df.csv', history_as_df.join("\n"), err => {
    if (err) {
      console.error(err);
    }
    console.log("file written successfully!");
  });
  fs.writeFile('publications.csv', contentAsArray.join("\n"), err => {
    if (err) {
      console.error(err);
    }
    console.log("file written successfully!");
  });
  fs.writeFile('publications.md', content.join("\n"), err => {
    if (err) {
      console.error(err);
    }
    console.log("file written successfully!");
  });
  var src = 'publications.md';
  var args = ['-f', 'markdown', '-t', 'odt', '-o', 'publications.odt'];
  // Set your callback function
  callback = function (err, result) {

    if (err) {
      console.error('Oh Nos: ', err);
    }

    // For output to files, the 'result' will be a boolean 'true'.
    // Otherwise, the converted value will be returned.
    console.log(result);
    return result;
  };

  // Call pandoc
  nodePandoc(src, args, callback);
  console.log("All done!");
}
writeContent();