import api from "@/config/api";

const DEBUG = true;
// set to false to disable debugging
const ERROR = true; // set to false to disable ERROR logging via console.error()

const fadHelper = {
  gp: function gp(resource) {
    return api.api_url + "/" + api.path.prefix + "/" + `crud/fad/${resource}`;
  },
  url: function url() {
    return api.api_url;
  },
  shiftDaysInMonth: function (date, shiftCode) {
    var dayCount = new Date(
      date.split("-")[0],
      date.split("-")[1],
      0
    ).getDate();
    var daysx = [];
    var dString = "";
    for (let i = 0; i < dayCount; i++) {
      dString = `${date}-${(i + 1).toString().padStart(2, 0)}`;
      console.debug("dString: ", dString);
      if (this.getterShiftCode(new Date(dString)) == shiftCode) {
        daysx.push(dString);
      }
    }
    return daysx;
  },
  consoleDebug: function () {
    if (DEBUG) {
      console.debug(new Date().toISOString(), "DEBUG", arguments);
    }
  },
  consoleError: function () {
    if (ERROR) {
      console.error(arguments);
    }
  },
  consoleLog: function () {
    if (DEBUG) {
      console.log(arguments);
    }
  },
};

export default fadHelper;
