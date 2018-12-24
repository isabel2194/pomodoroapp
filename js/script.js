$(document).ready(function() {
  $("#tasktimer").hide();
  $("#breakform").hide();
  $("#tasktimerbreak").hide();
  loadTasks();
});

var actualTime = 0;
var countdown;
var contBreak = 0;

function startTask() {
  var name_task = $("#nametask").val();
  if (checkRepeatedTask(name_task)) {
    alert(
      "El nombre de la tarea no puede ser igual a uno ya utilizado previamente."
    );
    $("#nametask").val("");
  } else {
    var time_task = $("#timetask").val();
    var dt = new Date();
    var comienzo =
      dt.getDate() +
      "/" +
      dt.getMonth() +
      "/" +
      dt.getFullYear() +
      " - " +
      dt.getHours() +
      ":" +
      dt.getMinutes() +
      ":" +
      dt.getSeconds();

    console.log("Empezando tarea: " + name_task);
    $("#currenttime").text(time_task);
    $("#currenttask").text(name_task);
    actualTime = time_task;
    $("#tasktimer").show();
    $("#taskform").hide();
    $("#showBreak").attr("disabled", "disabled");
    if (typeof Worker !== undefined) {
      counterWorker = new Worker("js/countdown.js");
      counterWorker.postMessage(actualTime * 60);
      counterWorker.onmessage = e => {
        $("#currenttime").text(secondsTimeSpanToMS(e.data));
        console.log(e.data);
        if (e.data <= 0) {
          addTaskToDB(name_task, time_task, comienzo);
          showNotificationEndTime();
          $("#showBreak").removeAttr("disabled");
          new Notification("Pomodoro App- El tiempo ha terminado.");
        }
      };
    } else window.alert("Este navegador no soporta workers :(");
  }
}

function showNotificationEndTime() {
  if (!("Notification" in window)) {
    alert("Este navegador no soporta notificaciones.");
  } else {
    if (Notification.permission != "granted") {
      Notification.requestPermission(callBackRequestPermission);
    }
  }
}

function callBackRequestPermission(notifStatus) {
  if (notifStatus == "denied") {
    window.alert(
      "Las notificaciones están desactivadas. Actívelas para poder recibir el aviso cuando el tiempo finalice."
    );
  }
}

function startBreak() {
  var time_task = $("#timebreak").val();
  var name_task = "Descanso";
  console.log("Empezando tarea: " + name_task);
  $("#currenttimebreak").text(time_task);
  actualTime = time_task;
  $("#tasktimerbreak").show();
  $("#breakform").hide();
  $("#showWork").attr("disabled", "disabled");

  if (typeof Worker !== undefined) {
    counterWorker = new Worker("js/countdown.js");
    counterWorker.postMessage(actualTime * 60);
    counterWorker.onmessage = e => {
      $("#currenttimebreak").text(secondsTimeSpanToMS(e.data));
      console.log(e.data);
      if (e.data <= 0) {
        showNotificationEndTime();
        $("#showWork").removeAttr("disabled");
        new Notification("Pomodoro App- El tiempo ha terminado.");
      }
    };
  } else window.alert("Este navegador no soporta workers :(");
}

function secondsTimeSpanToMS(s) {
  var m = Math.floor(s / 60);
  s -= m * 60;
  return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

function checkRepeatedTask(name_task) {
  console.log("Comprobamos si el nombre de la tarea esta repetido.");
  for (var i in localStorage) {
    if (i.indexOf("tarea=") != -1) {
      var tokens = i.split("=");
      var tarea = tokens[1];
      if (tarea === name_task) {
        return true;
      }
    }
  }
  return false;
}

function addTaskToDB(tarea, tiempo, comienzo) {
  console.log(
    "Añadimos la tarea: " +
      tarea +
      "," +
      tiempo +
      "," +
      comienzo +
      " al localstorage."
  );
  localStorage.setItem("tarea=" + tarea, tiempo + "," + comienzo);
  showTask(tarea, tiempo, comienzo);
}

function loadTasks() {
  console.log("Cargando tareas a la tabla.");
  for (var i in localStorage) {
    if (i.indexOf("tarea=") != -1) {
      var tokens = i.split("=");
      var tarea = tokens[1];
      console.log("EROR: " + i);
      var values = localStorage.getItem(i).split(",");
      showTask(tarea, values[0], values[1]);
    }
  }
}

function clearTasks() {
  var resp = window.confirm("¿Quiere borrar todas las tareas guardadas?");
  if (resp == true) {
    console.log("Borrando tareas del localstorage");
    localStorage.clear();
    $("table tbody td").remove();
    loadTasks();
  }
}

function showTask(tarea, tiempo, comienzo) {
  $("table tbody").append(
    `<tr><td>${tarea}</td><td>${tiempo}minutos</td><td>${comienzo}</td></tr>`
  );
}

function showBreak() {
  $("#timebreak").val(5);
  $("#timebreaktext").val(5);
  $("#breakform").show();
  $("#tasktimer").hide();
}

function showWork() {
  $("#nametask").val("");
  $("#timetask").val(25);
  $("#time").val(25);
  $("#taskform").show();
  $("#tasktimerbreak").hide();
}
