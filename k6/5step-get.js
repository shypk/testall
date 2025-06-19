import http from "k6/http";
import { Trend, Counter } from 'k6/metrics';
import exec from 'k6/execution';
import { check, sleep } from "k6";

let vUs = 5000

export const options = {
  discardResponseBodies: true,
  thresholds: {
    http_req_duration: ['p(99)<1000'],
    http_req_duration_060: ['p(99) < 1000'],     
    http_req_duration_070: ['p(99) < 1000'],     
    http_req_duration_080: ['p(99) < 1000'],     
    http_req_duration_090: ['p(99) < 1000'],     
    http_req_duration_100: ['p(99) < 1000'],     
  },

  scenarios: {
    scenario60: {
      executor: "ramping-vus",

      startVUs: vUs*5/10,
      stages: [
        { duration: "20s", target: vUs*6/10},
      ],
    },
    scenario70: {
      executor: "ramping-vus",

      startVUs: vUs*6/10,
      stages: [
        { duration: "20s", target: vUs*7/10 },
      ],
      startTime: '20s'
    },
    scenario80: {
      executor: "ramping-vus",

      startVUs: vUs*7/10,
      stages: [
        { duration: "20s", target: vUs*8/10 },
      ],
      startTime: '40s'
    },
    scenario90: {
      executor: "ramping-vus",

      startVUs: vUs*8/10,
      stages: [
        { duration: "20s", target: vUs*9/10 },
      ],
      startTime: '60s'
    },
    scenario100: {
      executor: "ramping-vus",

      startVUs: vUs*9/10,
      stages: [
        { duration: "20s", target: vUs },
      ],
      startTime: '80s'
    },

  },
};


const trend60 = new Trend('http_req_duration_060', true);
const trend70 = new Trend('http_req_duration_070', true);
const trend80 = new Trend('http_req_duration_080', true);
const trend90 = new Trend('http_req_duration_090', true);
const trend100 = new Trend('http_req_duration_100', true);
const counter60 = new Counter('http_reqs_060');
const counter70 = new Counter('http_reqs_070');
const counter80 = new Counter('http_reqs_080');
const counter90 = new Counter('http_reqs_090');
const counter100 = new Counter('http_reqs_100');
const params = {
  headers: {
    "Host": "test.com",
    "Content-Type": "appliction/json",
  },
  timeout: "360s",
};

export default function () {
  const url = "http://18.183.19.133:8080";
  const res = http.get(
	  url,
	  params,
  );

  if (__VU === 1 && __ITER === 0) {
    const currentDate = new Date().toLocaleString("en-JP", { timeZone: "Asia/Tokyo" });

    console.log(`Start : [${currentDate}]`);
    console.log(`Request Header: ${JSON.stringify(res.request.headers)}`);
    console.log(`Request URL: ${JSON.stringify(res.request.url)}`);
    console.log(`Request Header Size: ${JSON.stringify(res.request.headers).length} bytes`);
  }
  const name = exec.scenario.name
  if ( name == "scenario60") {
    trend60.add(res.timings.duration);
    counter60.add(5);
  }
  else if ( name == "scenario70") {
    trend70.add(res.timings.duration);
    counter70.add(5);
  }
  else if ( name == "scenario80") {
    trend80.add(res.timings.duration);
    counter80.add(5);
  }
  else if ( name == "scenario90") {
    trend90.add(res.timings.duration);
    counter90.add(5);
  }
  else if ( name == "scenario100") {
    trend100.add(res.timings.duration);
    counter100.add(5);
  }

  if (res.error_code != 0) {
    console.log(res.error);
    console.log(res.error_code);
  }
  let success = check(res, {
    "is status 200": (r) => r.status === 200,
  });
  if (!success) {
    const currentDate = new Date().toLocaleString("en-JP", { timeZone: "Asia/Tokyo" });
    console.log(`${currentDate} failed with status ${res.status}: ${res.body}`);
  }
  sleep(0.8);
}
