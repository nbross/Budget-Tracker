let db;
// add a connection to IndexedDB database called 'budget-tracker' and set it to version 1
const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = function (event) {
    // create object store called "nw_transaction" and set autoIncrement to true
    const db = event.target.result;
    db.createObjectStore("nw_transaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    // log error here
    console.log("Oh no!" + event.target.errorCode);
};

function saveRecord(record) {
    // create a transaction on the nw_transaction db with readwrite access
    const transaction = db.transaction("nw_transaction", "readwrite");

    // access your nw_transaction object store
    const store = transaction.objectStore("nw_transaction");

    // add record to your store with add method
    store.add(record);
}

function checkDatabase() {
    // open a transaction on the db
    const transaction = db.transaction("nw_transaction", "readwrite");
    // access your object store
    const store = transaction.objectStore("nw_transaction");
    // get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    // if successful, open a transaction on your nw_transaction db
                    const transaction = db.transaction("nw_transaction", "readwrite");

                    // access your nw_transaction object store
                    const store = transaction.objectStore("nw_transaction");

                    // clear all items in your store
                    store.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);