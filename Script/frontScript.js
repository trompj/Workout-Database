/*
Author: Justin Tromp
Date: 12/04/2019
Description: Homework #6 - Database Assignment - Using ajax with server and client interactions.
*/

//let url = "http://localhost:36999/";
let url = "http://flip3.engr.oregonstate.edu:36999/";

document.addEventListener('DOMContentLoaded', postWorkout);
document.addEventListener('DOMContentLoaded', fillTable);

//Edit row that edit button is in.
function editForm(hiddenInput) {
    let form = hiddenInput.parentElement;
    let td = form.parentElement;
    let tr = td.parentElement;

    //Find all applicable nodes
    let nameNode = tr.firstChild;
    let repsNode = nameNode.nextSibling;
    let weightNode = repsNode.nextSibling;
    let dateNode = weightNode.nextSibling;
    let lbsNode = dateNode.nextSibling;

    //Get value of nodes
    let idVal = hiddenInput.value;
    let nameVal = nameNode.textContent;
    let repsVal = repsNode.textContent;
    let weightVal = weightNode.textContent;

    let dateVal = dateNode.textContent;
    if (dateVal != "" && dateVal != null) {
        let dateSplit = dateVal.split('T');
        dateVal = dateSplit[0];
    }
    let date = new Date(dateVal);

    let lbsVal = lbsNode.textContent;

    //Add values to update/edit form and display pop-up form
    document.getElementById("name-edit").value = nameVal;
    document.getElementById("reps-edit").value = repsVal;
    document.getElementById("weight-edit").value = weightVal;
    document.getElementById("date-edit").valueAsDate = date;
    document.getElementById("lbs-edit").value = lbsVal;
    document.getElementById("form-edit-overlay").style.display = "block";
    document.getElementById("overlay-background").style.display = "block";

    let submitEdit = function (event) {
        let editRow = new XMLHttpRequest();

        editRow.open("PUT", (url), true);
        editRow.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        let postBody = "id=" + idVal + "&name=" + document.getElementById("name-edit").value + "&reps=" +
            document.getElementById("reps-edit").value + "&weight=" +
            document.getElementById("weight-edit").value + "&date=" +
            document.getElementById("date-edit").value + "&lbs=" +
            document.getElementById("lbs-edit").value;

        editRow.addEventListener('load', function(event) {
            document.getElementById('name-edit').style.borderColor = "initial";
            document.getElementById('lbs-edit').style.borderColor = "initial";

            if (editRow.status >= 200 && editRow.status < 400) {
                let editResponse = JSON.parse(editRow.responseText);

                //Edit form contents on page after update
                nameNode.textContent = editResponse.name;
                repsNode.textContent = editResponse.reps;
                weightNode.textContent = editResponse.weight;

                let date = editResponse.date;
                if (date != "") {
                    let dateObj = new Date(date);
                    dateObj = addDays(dateObj, 1);
                    let month = (dateObj.getMonth() + 1);
                    let day = dateObj.getDate();

                    if (month < 10) {
                        month = "0" + month;
                    }

                    if (day < 10) {
                        day = "0" + day;
                    }

                    let newDate = (month + '/' + day + '/' + dateObj.getFullYear());

                    dateNode.textContent = newDate.toString();
                }
                else {
                    dateNode.textContent = "";
                }

                lbsNode.textContent = editResponse.lbs;

                //Hide pop-up edit form
                document.getElementById("form-edit-overlay").style.display = "none";
                document.getElementById("overlay-background").style.display = "none";

                document.getElementById("submit-edit").removeEventListener('click', submitEdit);
            }
            else {
                console.log("Error in network request: " + editRow.statusText);

                if (editRow.responseText === "name-lbs") {
                    document.getElementById('name-edit').style.borderColor = "red";
                    document.getElementById('lbs-edit').style.borderColor = "red";
                }
                else if (editRow.responseText === "name") {
                    document.getElementById('name-edit').style.borderColor = "red";
                }
                else if (editRow.responseText === "lbs") {
                    document.getElementById('lbs-edit').style.borderColor = "red";
                }
            }

            event.preventDefault();
        });

        editRow.send(postBody);

        event.preventDefault();
    };

    document.getElementById("submit-edit").addEventListener('click', submitEdit);
}

//Delete row that delete button is in.
function deleteRow(hiddenInput) {
    let deleteRow = new XMLHttpRequest();

    deleteRow.open("DELETE", (url), true);
    deleteRow.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    let idVal = hiddenInput.value;
    let postBody = "id=" + idVal;

    deleteRow.addEventListener('load', function() {
    if (deleteRow.status >= 200 && deleteRow.status < 400) {

        let form = hiddenInput.parentElement;
        let td = form.parentElement;
        let tr = td.parentElement;

        while (tr.firstChild) {
            tr.removeChild(tr.firstChild);
        }

        tr.remove();
    }
    else {
        console.log("Error in network request: " + deleteRow.statusText);
    }
    });

    deleteRow.send(postBody);
}

function fillTable(event) {
    let getTable = new XMLHttpRequest();

    getTable.open("GET", url, true);
    getTable.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    getTable.addEventListener('load', function() {
        if (getTable.status >= 200 && getTable.status < 400) {
            let getResponse = JSON.parse(getTable.responseText);

            let table = document.getElementById("workout-table");

            for (let idx = 0; idx < getResponse.length; idx++) {
                //Add data for rows
                let tableRow = document.createElement('tr');
                let td = document.createElement('td');

                td.textContent = getResponse[idx].name;
                tableRow.appendChild(td);

                td = document.createElement('td');
                td.textContent = getResponse[idx].reps;
                tableRow.appendChild(td);

                td = document.createElement('td');
                td.textContent = getResponse[idx].weight;
                tableRow.appendChild(td);

                td = document.createElement('td');
                let date = getResponse[idx].date;
                if (date != "0000-00-00") {
                    let dateObj = new Date(date);
                    let month = (dateObj.getMonth() + 1);
                    let day = dateObj.getDate();

                    if (month < 10) {
                        month = "0" + month;
                    }

                    if (day < 10) {
                        day = "0" + day;
                    }

                    let newDate = (month + '/' + day + '/' + dateObj.getFullYear());

                    td.textContent = newDate.toString();
                }
                else {
                    td.textContent = "";
                }

                tableRow.appendChild(td);

                td = document.createElement('td');
                td.textContent = getResponse[idx].lbs;
                tableRow.appendChild(td);

                //Create buttons and hidden input with id.
                td = document.createElement('td');
                let form = document.createElement('form');

                let hiddenInput = document.createElement('input');
                hiddenInput.type = "hidden";
                hiddenInput.value = getResponse[idx].id;
                form.appendChild(hiddenInput);

                let editButton = document.createElement('button');
                let editTxt = document.createTextNode("Edit");
                editButton.addEventListener('click', function(event) {
                    editForm(hiddenInput);

                    event.preventDefault();
                });
                editButton.appendChild(editTxt);
                form.appendChild(editButton);

                let deleteButton = document.createElement('button');
                let deleteTxt = document.createTextNode("Delete");
                deleteButton.addEventListener('click', function(event) {
                    deleteRow(hiddenInput);

                    event.preventDefault();
                });
                deleteButton.appendChild(deleteTxt);
                form.appendChild(deleteButton);

                td.appendChild(form);
                tableRow.appendChild(td);
                table.appendChild(tableRow);
            }
        }
        else {
            console.log("Error in network request: " + getTable.statusText);
        }
    });

    getTable.send();

    event.preventDefault();
}

function postWorkout() {
    document.getElementById('submit-workout').addEventListener('click', function(event) {
        let postRequest = new XMLHttpRequest();

        let nameVal = document.getElementById('name').value;
        let repVal = document.getElementById('reps').value;
        let weightVal = document.getElementById('weight').value;
        let dateVal = document.getElementById('date').value;
        let lbsVal = document.getElementById('lbs').value;

        let postBody = "name=" + nameVal + "&" + "reps=" + repVal + "&" + "weight=" + weightVal + "&" + "date=" + dateVal + "&" + "lbs=" + lbsVal;

        postRequest.open("POST", url, true);
        postRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        postRequest.addEventListener('load', function() {
            document.getElementById('name').style.borderColor = "initial";
            document.getElementById('lbs').style.borderColor = "initial";

            if (postRequest.status >= 200 && postRequest.status < 400) {
                let postResponse = JSON.parse(postRequest.responseText);

                let table = document.getElementById("workout-table");

                let tableRow = document.createElement('tr');
                let td = document.createElement('td');

                td.textContent = postResponse.name;
                tableRow.appendChild(td);

                td = document.createElement('td');
                td.textContent = postResponse.reps;
                tableRow.appendChild(td);

                td = document.createElement('td');
                td.textContent = postResponse.weight;
                tableRow.appendChild(td);

                td = document.createElement('td');
                if (postResponse.date !== "") {
                    let dateObj = addDays(postResponse.date, 1);
                    let month = (dateObj.getMonth() + 1);
                    let day = dateObj.getDate();

                    if (month < 10) {
                        month = "0" + month;
                    }

                    if (day < 10) {
                        day = "0" + day;
                    }

                    let newDate = (month + '/' + day + '/' + dateObj.getFullYear());

                    dateVal = newDate.toString();
                    td.textContent = dateVal;
                }
                else {
                    td.textContent = "";
                }
                tableRow.appendChild(td);

                td = document.createElement('td');
                td.textContent = postResponse.lbs;
                tableRow.appendChild(td);

                //Create buttons and hidden input with id.
                td = document.createElement('td');
                let form = document.createElement('form');

                let hiddenInput = document.createElement('input');
                hiddenInput.type = "hidden";
                hiddenInput.value = postResponse.id;
                form.appendChild(hiddenInput);

                let editButton = document.createElement('button');
                let editTxt = document.createTextNode("Edit");
                editButton.addEventListener('click', function(event) {
                    editForm(hiddenInput);

                    event.preventDefault();
                });
                editButton.appendChild(editTxt);
                form.appendChild(editButton);

                let deleteButton = document.createElement('button');
                let deleteTxt = document.createTextNode("Delete");
                deleteButton.addEventListener('click', function(event) {
                    deleteRow(hiddenInput);

                    event.preventDefault();
                });
                deleteButton.appendChild(deleteTxt);
                form.appendChild(deleteButton);

                td.appendChild(form);
                tableRow.appendChild(td);
                table.appendChild(tableRow);
            }
            else {
                console.log("Error in network request: " + postRequest.statusText);

                if (postRequest.responseText === "name-lbs") {
                    document.getElementById('name').style.borderColor = "red";
                    document.getElementById('lbs').style.borderColor = "red";
                }
                else if (postRequest.responseText === "name") {
                    document.getElementById('name').style.borderColor = "red";
                }
                else if (postRequest.responseText === "lbs") {
                    document.getElementById('lbs').style.borderColor = "red";
                }
            }
        });

        postRequest.send(postBody);

        event.preventDefault();
    })
}

//Add days to date object
function addDays(date, daysAdded) {
    let dateResult = new Date(date);
    dateResult.setDate(dateResult.getDate() + daysAdded);
    return dateResult;
}