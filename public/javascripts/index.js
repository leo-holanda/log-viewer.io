//Remove form so buttons and graph can be displayed
function removeForm() {
  document.querySelector(".form-container").remove();
  if ((loader = document.querySelector(".loader-wrapper"))) loader.remove();

  document.querySelector(".header").remove();
}

// Each field in the csv file becomes a button
function createButtons(fields) {
  let btn;
  for (field of fields) {
    if (field && !field.includes("Time") && !field.includes("Date")) {
      btn = document.createElement("button");
      btn.id = field;
      btn.innerHTML = field;
      btn.classList.add("field-btn");
      document.querySelector(".btn-container").appendChild(btn);
    }
  }

  let cpuBtn = document.getElementById("CPU [°C]");
  cpuBtn.focus();
  cpuBtn.scrollIntoView({ block: "center" });
}

function createContainers() {
  //Remove aligned layout
  document.querySelector("main").classList.remove("aligned");

  let container = document.createElement("div");
  container.classList.add("field-container");
  document.querySelector("main").appendChild(container);

  //Add btn container title
  let title = document.createElement("h4");
  title.innerHTML = "FIELDS";
  title.classList.add("field-container-title");
  document.querySelector(".field-container").appendChild(title);

  container = document.createElement("div");
  container.classList.add("btn-container");
  document.querySelector(".field-container").appendChild(container);

  container = document.createElement("div");
  container.classList.add("report-container");
  document.querySelector("main").appendChild(container);

  container = document.createElement("div");
  container.classList.add("stats-container");
  document.querySelector(".report-container").appendChild(container);

  container = document.createElement("div");
  container.classList.add("line-container");
  document.querySelector(".report-container").appendChild(container);

  container = document.createElement("div");
  container.classList.add("line-btn-container");
  document.querySelector(".line-container").appendChild(container);

  let addLineBtn = document.createElement("button")
	addLineBtn.classList.add("add-line-btn")
	addLineBtn.classList.add("fas")
  addLineBtn.classList.add("fa-plus-circle")
  addLineBtn.id = "add_line_btn"
	document.querySelector(".line-container").appendChild(addLineBtn)

  let lineBtn = document.createElement("div")
  lineBtn.classList.add("line-btn")
  let btn = document.createElement("input")
  btn.setAttribute("type", "radio")
  btn.setAttribute("id", "line1")
  btn.setAttribute("name", "line-btn")
  btn.classList.add("line-selector")
  btn.checked = true
  let label = document.createElement("label")
  label.innerHTML = "CPU [°C]"
  lineBtn.appendChild(btn)
  lineBtn.appendChild(label)
	document.querySelector(".line-btn-container").appendChild(lineBtn)

  container = document.createElement("div");
  container.classList.add("chart-container");
  document.querySelector(".report-container").appendChild(container);
}

//When user click in a field button, update chart and statistics with field data
function addUpdateByField(chart) {
  document
    .querySelector(".btn-container")
    .addEventListener("click", function (event) {
      if (event.target.className == "field-btn") {
        let selectedField = event.target.innerHTML;
        document.querySelector(".line-selector:checked").parentNode.querySelector("label").innerHTML = selectedField
        let lineID = document.querySelector(".line-selector:checked").id
        if (lineID != "line1"){
          
          chart.updateLineByField(selectedField, lineID)
        }
        else{
          chart.updateByField(selectedField);
          updateStats(chart.log, selectedField);
        }
      }
    });
}

function addNewLine(){
  let lineContainer = document.querySelector(".line-btn-container")

  let lineBtn = document.createElement("div")
  lineBtn.classList.add("line-btn")

  let colorPicker = document.createElement("div")
  colorPicker.classList.add("color-picker")
  lineBtn.appendChild(colorPicker)

  let lineID = 'id' + new Date().valueOf();
  console.log(lineID)

  let btn = document.createElement("input")
  btn.setAttribute("type", "radio")
  btn.setAttribute("id", lineID)
  btn.setAttribute("name", "line-btn")
  btn.classList.add("line-selector")

  let label = document.createElement("label")
  label.innerHTML = "CPU [°C]"

  lineBtn.appendChild(btn)
  lineBtn.appendChild(label)

  lineContainer.appendChild(lineBtn)
  
  //https://css-tricks.com/snippets/javascript/random-hex-color/
  let randomColor = Math.floor(Math.random()*16777215).toString(16);
  chart.addNewLine(lineID, randomColor)

  const pickr = Pickr.create({
    el: '.color-picker',
    theme: 'nano',
    default: '#' + randomColor,
    defaultRepresentation: 'HEX',

    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(103, 58, 183, 1)',
        'rgba(63, 81, 181, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(3, 169, 244, 1)',
        'rgba(0, 188, 212, 1)',
        'rgba(0, 150, 136, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(139, 195, 74, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 235, 59, 1)',
        'rgba(255, 193, 7, 1)'
    ],

    components: {

        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
            input: true,
            save: true
        }
    }
  });

  pickr.on('save', function(color){
    document.querySelector('path#' + lineID).setAttribute("stroke", color.toHEXA())
  })

  let removeLine = document.createElement("i")
  removeLine.classList.add("fas")
  removeLine.classList.add("fa-trash")
  removeLine.addEventListener("click", function(){
    document.querySelector("path#" + lineID).remove()
    lineBtn.remove()
  })
  
  for (selector of document.querySelectorAll(".pickr")){
    if(!selector.contains(removeLine)){
      selector.appendChild(removeLine)
    }
  }
}

//Add an alert if there isn't one
function addAlert(message) {
  if (document.querySelector(".form-alert") != null) {
    document.querySelector(".form-alert").innerHTML = message;
    return;
  }

  let alert = document.createElement("h3");
  alert.innerHTML = message;
  alert.classList.add("form-alert");
  document.querySelector(".third-step").appendChild(alert);
}

function addLoadingOverlay() {
  let loaderWrapper = document.createElement("div");
  loaderWrapper.classList.add("loader-wrapper");

  let loading = document.createElement("div");
  loading.classList.add("loader");

  loaderWrapper.appendChild(loading);
  document.querySelector("main").appendChild(loaderWrapper);
}

// When user sends csv or click on example button...
document.getElementById("log_input").addEventListener("change", showUserLog);
document.getElementById("example").addEventListener("click", showExample);


async function showExample() {
  addLoadingOverlay();
  createChart(await getLogExample());
}

function showUserLog() {
  let log = document.getElementById("log_input").files[0];
  if (!isCSV(log)) return addAlert("Please upload only CSV files!");
  createChart(log);
}

let chart = undefined
function createChart(log) {
  // Parse the csv and process the results
  Papa.parse(log, {
    header: true,
    encoding: "latin3", // Important for degree symbol
    skipEmptyLines: true,
    transformHeader: function (header) {
      return header.replace("�", "°");
    },
    complete: function (results) {
      if (isHWLog(results.meta.fields)) {
        removeForm();
        createContainers();
        document.getElementById("add_line_btn").addEventListener("click", addNewLine);
        createButtons(results.meta.fields);

        chart = new Chart({
          container: document.querySelector(".chart-container"),
          parsedLog: results.data,
        });

        chart.draw();

        createStats(results.data);
        addUpdateByField(chart);
      } else {
        addAlert("Please send only logs from HWInfo!");
      }
    },
  });
}
