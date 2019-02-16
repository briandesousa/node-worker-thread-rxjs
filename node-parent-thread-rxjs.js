const Rxjs = require('rxjs');
const RxjsOperators = require('rxjs/operators');
const { Worker } = require('worker_threads');

console.log("\nNode multi-threading demo using worker_threads module in Node 11.7.0\n");

const COMPLETE_SIGNAL = 'COMPLETE';

function runTask(workerData, completedOnTime) {
    return Rxjs.Observable.create(observer => {
        const worker = new Worker('./node-worker-thread-rxjs.js', { workerData });
        worker.on('message', message => observer.next(message));
        worker.on('error', error => observer.error(error));
        worker.on('exit', code => {
            if (code !== 0) {
                observer.error(`Worker stopped with exit code ${code}`);
            } else {
                completedOnTime();
                observer.next(COMPLETE_SIGNAL);
                observer.complete();
            }
        });
    });
}

const MAX_WAIT_TIME = 3;
const WORKER_TIME = 10;

function main() {
    completedOnTime = false;

    console.log(`[Main] Starting worker from process ${process.pid}`);

    const worker$ = runTask(WORKER_TIME, () => completedOnTime = true);

    // receive messages from worker until it completes but only wait for MAX_WAIT_TIME
    worker$.pipe(
        RxjsOperators.takeWhile(message => message !== COMPLETE_SIGNAL),
        RxjsOperators.takeUntil(Rxjs.timer(MAX_WAIT_TIME * 1000))
    ).subscribe(
        result => console.log(`[Main] worker says: ${result}`),
        error => console.error(`[Main] worker error: ${error}`),
        () => {
            if (!completedOnTime) {
                console.log(`[Main] worker could not complete its work in the allowed ${MAX_WAIT_TIME}s, exiting Node process`);
                process.exit(0);
            } else {
                console.log(`[Main] worker completed its work in the allowed ${WORKER_TIME}s`);
            }
        }
    );
}

main();