var keywords;

function getJson() {
    // Basic XML request since we can't use JQuery in worker
    var req = new XMLHttpRequest();
    req.open('GET', "https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000", true);
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let res = JSON.parse(this.responseText);
            filterResults(res);
        }
    };
    req.send();
}

function sendData(data, index) {
    postMessage({item: data, index: index});
}

function filterResults(results) {

    let keywordsList = keywords.split(/[ ,]+/);
    for (let i = 0; i < results.length; i++) {
        keywordsList.forEach(searchKeyword => {
            if (results[i].keywords.search(searchKeyword) != -1) {
                sendData(results[i], i);
            }
        });
    }
    // We don't use close() because we need to update the UI after completion
    postMessage("done");
}

onmessage = function (e) {
    // Receiving keywords
    keywords = e.data;
}

getJson();