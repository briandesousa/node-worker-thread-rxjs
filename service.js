const { workerData, parentPort } = require('worker_threads');


parentPort.postMessage(`starting heavy duty work from process ${process.pid} that will take ${workerData}s to complete`);

timeLimit = workerData;
timer = 0;

// simulate a long-running process with updates posted back on a regular interval
do {
    setTimeout(
        (count) => {
            parentPort.postMessage(`heavy duty work in progress...${count+1}s`);
            if(count === timeLimit) {
                parentPort.postMessage('done heavy duty work');
            }
        }, 
        1000 * timer,
        timer);
} while (++timer !== timeLimit);
