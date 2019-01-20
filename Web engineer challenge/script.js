var worker;
var favourites = [];
var items = [];

const AVAILABLE_SEARCH_BTN_HTML = '<i class="fas fa-search"></i>';
const LOADING_SEARCH_BTN_HTML = '<i class="fa fa-spinner fa-spin"></i>';
const ENTER_KEYCODE = 13;

$(document).keyup((e) => {
    if (e.keyCode == ENTER_KEYCODE) {
        search();
    }
});

$(() => {
    $("#search-bar").keyup(() => {
        if ($("#search-bar").val() == "") {
            $("#search-result-container").html("<p>Enter some keywords and press enter to start your search !</p>");
        }
    });
});

function search() {
    $("#search-result-container").html("");
    // Check browser compatibility
    if (typeof (Worker) !== undefined) {
        // Check if worker already exists
        if (typeof (worker) == "undefined") {
            startWorker();
            worker.onmessage = function (event) {
                // Check if worker is done
                if (event.data != "done") {
                    items.push(event.data);
                    $("#search-result-container").append(formatData(event.data.item, event.data.index, false));
                } else {
                    stopWorker();
                }
            }
        }
    } else {
        alert("Workers not supported, try it on a newer browser !");
    }
}

function formatData(item, index, isFavourite) {
    // Div containing the title
    let title = "<div class='product-title'> <button " + (isFavourite ? " class='favourite'" : "") + " id='item" + index + "' onclick=toggleFavourite(" + index + ")><i class='fas fa-star'></i> </button>" + item.title + "</div>"
    // Div containing the description
    let description = "<div class='product-description'>" + item.body + "</div>";
    // Unescaping <, > and nbsp
    description = description.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;nbsp;/g, String.fromCharCode(160));
    return title + description;
}

/*
 * Worker handling
 */

// Start worker and disable search until worker termination
function startWorker() {
    items = [];
    worker = new Worker('search-worker.js');
    // To send the keywords to the worker
    worker.postMessage($("#search-bar").val());
    $("#search-button").prop('disabled', true);
    $("#search-button").html(LOADING_SEARCH_BTN_HTML);
}

// Stopping worker and enabling search
function stopWorker() {
    worker.terminate();
    worker = undefined;
    $("#search-button").prop('disabled', false);
    $("#search-button").html(AVAILABLE_SEARCH_BTN_HTML);
}


/* 
 * Favourites handling
 */

function toggleFavourite(index) {
    $("#item" + index).toggleClass("favourite");
    // Check if the item is already favourite
    let position = favourites.findIndex((element) => element.index == index);
    // Add the item to the favourite list or delete it if it already exists
    if (position == -1) {
        favourites.push(items.find((element => element.index == index)));
    } else {
        favourites.splice(position, 1);
    }
    updateFavourites();
}

function updateFavourites() {
    let formattedHtml = "";
    for (favourite of favourites) {
        formattedHtml += formatData(favourite.item, favourite.index, true);
    }
    $("#favourites-container").html(formattedHtml);
}
